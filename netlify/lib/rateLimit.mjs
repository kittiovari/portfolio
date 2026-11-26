// Próbálkozáskorlát a jelszóellenőrzéshez: IP-címenként és területenként
// MAX_ATTEMPTS rossz próbálkozás után LOCK_MINUTES percre letiltjuk.
// Éles környezetben a Netlify Blobs tárolót használja (minden példány közös);
// helyi fejlesztésnél, ahol ez nem elérhető, memóriában számol.
import crypto from 'node:crypto'

const MAX_ATTEMPTS = 5
const WINDOW_MINUTES = 15
const LOCK_MINUTES = 15

const memory = new Map()
let storePromise = null

async function getStoreSafe() {
  if (!storePromise) {
    storePromise = import('@netlify/blobs')
      .then(({ getStore }) => getStore({ name: 'rate-limit', consistency: 'strong' }))
      .catch(() => null)
  }
  try {
    return await storePromise
  } catch {
    return null
  }
}

// Az IP-címet nem tároljuk nyersen, csak sózott hash-ként (adattakarékosság)
function keyFor(ip, area) {
  const salt = process.env.SESSION_SECRET || 'local'
  return 'rl-' + crypto.createHash('sha256').update(`${salt}|${area}|${ip}`).digest('hex').slice(0, 40)
}

async function read(key) {
  const store = await getStoreSafe()
  if (store) {
    try {
      return (await store.get(key, { type: 'json' })) || null
    } catch {
      /* esés a memóriára */
    }
  }
  return memory.get(key) || null
}

async function write(key, value) {
  const store = await getStoreSafe()
  if (store) {
    try {
      await store.setJSON(key, value)
      return
    } catch {
      /* esés a memóriára */
    }
  }
  memory.set(key, value)
}

async function remove(key) {
  const store = await getStoreSafe()
  if (store) {
    try {
      await store.delete(key)
    } catch {
      /* semmi */
    }
  }
  memory.delete(key)
}

// Visszaadja, hány másodpercig van még tiltva (0 = nincs tiltva)
export async function lockedFor(ip, area) {
  const rec = await read(keyFor(ip, area))
  if (!rec?.lockedUntil) return 0
  return Math.max(0, Math.ceil((rec.lockedUntil - Date.now()) / 1000))
}

export async function registerFailure(ip, area) {
  const key = keyFor(ip, area)
  const now = Date.now()
  let rec = await read(key)
  if (!rec || now - rec.first > WINDOW_MINUTES * 60e3) rec = { count: 0, first: now }
  rec.count += 1
  if (rec.count >= MAX_ATTEMPTS) rec.lockedUntil = now + LOCK_MINUTES * 60e3
  await write(key, rec)
  return { remaining: Math.max(0, MAX_ATTEMPTS - rec.count), lockedSeconds: rec.lockedUntil ? LOCK_MINUTES * 60 : 0 }
}

// Általános írási korlát (pl. diákbeadások): ablakonként legfeljebb `max` kérés.
// true = mehet, false = túl sok kérés
export async function allowHit(id, area, max = 40, windowSeconds = 600) {
  const key = keyFor(id, `hit|${area}`)
  const now = Date.now()
  let rec = await read(key)
  if (!rec || now - rec.first > windowSeconds * 1000) rec = { count: 0, first: now }
  rec.count += 1
  await write(key, rec)
  return rec.count <= max
}

export async function registerSuccess(ip, area) {
  await remove(keyFor(ip, area))
}
