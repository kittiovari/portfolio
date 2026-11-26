// Az Osztályterem adatai (diáknevek, pontok, jelenlét) – osztályonként egy
// JSON-dokumentum. Élesben a Netlify Blobs tárolóban, AES-256-GCM-mel
// titkosítva (CONTENT_KEY), így a tárhelyen sincs olvasható diákadat.
// Helyi fejlesztésnél a .netlify/classroom-dev/ mappába ír (gitignore-olt).
import fs from 'node:fs/promises'
import path from 'node:path'
import { seal, open } from './security.mjs'

// Osztálynyilvántartás (Blobs: 'classes'): [{ id, label, pw?, createdAt, archived? }]
// A 9b és 9d az alap; újak a tanári felületről vehetők fel, saját diákjelszóval
// (scrypt-hash a nyilvántartásban – nem kell Netlify-beállítás hozzá).
export const DEFAULT_CLASSES = [{ id: '9b', label: 'NYEK9B' }, { id: '9d', label: 'NYEK9D' }]
export const CLASS_ID = /^[a-z0-9]{1,12}$/
let regCache = null
export async function loadRegistry() {
  if (regCache && regCache.at > Date.now() - 15000) return regCache.list
  let list = null
  try {
    const raw = await readRaw('classes')
    list = raw ? JSON.parse(open(raw).toString('utf8')) : null
  } catch { list = null }
  if (!Array.isArray(list) || !list.length) list = DEFAULT_CLASSES.map((c) => ({ ...c }))
  regCache = { at: Date.now(), list }
  return list
}
export async function saveRegistry(list) {
  await writeRaw('classes', seal(Buffer.from(JSON.stringify(list), 'utf8')))
  regCache = { at: Date.now(), list }
}
export async function isClass(c) {
  if (typeof c !== 'string' || !CLASS_ID.test(c)) return false
  return (await loadRegistry()).some((x) => x.id === c)
}

let storePromise = null
async function getStoreSafe() {
  if (!storePromise) {
    storePromise = import('@netlify/blobs')
      .then(({ getStore }) => getStore({ name: 'classroom', consistency: 'strong' }))
      .catch(() => null)
  }
  try {
    return await storePromise
  } catch {
    return null
  }
}

const DEV_DIR = path.resolve(process.cwd(), '.netlify', 'classroom-dev')
const isNetlify = () => Boolean(process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT || process.env.NETLIFY_BLOBS_CONTEXT)

async function readRaw(key) {
  if (isNetlify()) {
    const store = await getStoreSafe()
    if (!store) throw new Error('blobs unavailable')
    const buf = await store.get(key, { type: 'arrayBuffer' })
    return buf ? Buffer.from(buf) : null
  }
  try {
    return await fs.readFile(path.join(DEV_DIR, `${key}.enc`))
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

async function writeRaw(key, buf) {
  if (isNetlify()) {
    const store = await getStoreSafe()
    if (!store) throw new Error('blobs unavailable')
    await store.set(key, buf)
    return
  }
  await fs.mkdir(DEV_DIR, { recursive: true })
  await fs.writeFile(path.join(DEV_DIR, `${key}.enc`), buf)
}

export async function loadClass(cls) {
  const raw = await readRaw(`class-${cls}`)
  if (!raw) return null
  return JSON.parse(open(raw).toString('utf8'))
}

export async function saveClass(cls, doc) {
  await writeRaw(`class-${cls}`, seal(Buffer.from(JSON.stringify(doc), 'utf8')))
}

async function deleteRaw(key) {
  if (isNetlify()) {
    const store = await getStoreSafe()
    if (!store) throw new Error('blobs unavailable')
    await store.delete(key)
    return
  }
  await fs.rm(path.join(DEV_DIR, `${key}.enc`), { force: true })
}

// ── Óraterv-források (feltöltött fájlok) ──
// Egy blob = titkosított [4 bájt meta-hossz][meta JSON][fájl tartalma]
export const FILE_ID = /^[A-Za-z0-9_-]{12,40}$/
const fileKey = (cls, id) => `file-${cls}-${id}`

export async function saveFile(cls, id, data, meta) {
  const m = Buffer.from(JSON.stringify(meta), 'utf8')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(m.length)
  await writeRaw(fileKey(cls, id), seal(Buffer.concat([len, m, data])))
}

export async function loadFile(cls, id) {
  const raw = await readRaw(fileKey(cls, id))
  if (!raw) return null
  const buf = open(raw)
  const n = buf.readUInt32BE(0)
  return { meta: JSON.parse(buf.subarray(4, 4 + n).toString('utf8')), data: buf.subarray(4 + n) }
}

export async function deleteFile(cls, id) {
  await deleteRaw(fileKey(cls, id))
}

// ── Iskolai naptár (minden osztálynak közös): tanév, szünetek, rövidített napok ──
export async function loadSchool() {
  const raw = await readRaw('school')
  return raw ? JSON.parse(open(raw).toString('utf8')) : null
}
export async function saveSchool(doc) {
  await writeRaw('school', seal(Buffer.from(JSON.stringify(doc), 'utf8')))
}
// az osztály dokumentuma a közös naptárral kiegészítve (olvasáshoz)
export async function withSchool(doc) {
  if (!doc) return doc
  const school = await loadSchool().catch(() => null)
  return school ? { ...doc, calendar: school.calendar || doc.calendar, shortDays: school.shortDays || doc.shortDays } : doc
}

// ── Fájl-index osztályonként (a Tárhely panelhez: név, típus, méret, idő) ──
const indexKey = (cls) => `fileindex-${cls}`
export async function loadFileIndex(cls) {
  const raw = await readRaw(indexKey(cls))
  return raw ? JSON.parse(open(raw).toString('utf8')) : null
}
async function writeFileIndex(cls, list) {
  await writeRaw(indexKey(cls), seal(Buffer.from(JSON.stringify(list), 'utf8')))
}
export async function indexAdd(cls, entry) {
  const list = (await loadFileIndex(cls)) || []
  if (!list.some((x) => x.id === entry.id)) list.push(entry)
  await writeFileIndex(cls, list)
}
export async function indexRemove(cls, id) {
  const list = (await loadFileIndex(cls)) || []
  await writeFileIndex(cls, list.filter((x) => x.id !== id))
}
// az index újraépítése a tárolóból (ha még nincs – a régebben feltöltött fájlokhoz)
export async function rebuildFileIndex(cls) {
  const prefix = `file-${cls}-`
  let keys = []
  if (isNetlify()) {
    const store = await getStoreSafe()
    const { blobs } = await store.list({ prefix })
    keys = blobs.map((b) => b.key)
  } else {
    try { keys = (await fs.readdir(DEV_DIR)).filter((f) => f.startsWith(prefix)).map((f) => f.replace(/\.enc$/, '')) } catch { keys = [] }
  }
  const list = []
  for (const k of keys) {
    const id = k.slice(prefix.length)
    const f = await loadFile(cls, id).catch(() => null)
    if (f) list.push({ id, name: f.meta.name, type: f.meta.type, size: f.meta.size ?? f.data.length, at: f.meta.at || 0 })
  }
  await writeFileIndex(cls, list)
  return list
}
export const fileExists = async (cls, id) => Boolean(await readRaw(fileKey(cls, id)))

// ── Tanévek archívuma: a lezárt tanév teljes dokumentuma, csak olvasásra ──
const archiveKey = (cls, year) => `archive-${cls}-${year}`
export async function loadArchive(cls, year) {
  const raw = await readRaw(archiveKey(cls, year))
  return raw ? JSON.parse(open(raw).toString('utf8')) : null
}
export async function saveArchive(cls, year, doc) {
  await writeRaw(archiveKey(cls, year), seal(Buffer.from(JSON.stringify(doc), 'utf8')))
}
export async function listArchiveYears(cls) {
  const prefix = `archive-${cls}-`
  let keys = []
  if (isNetlify()) {
    const store = await getStoreSafe()
    keys = (await store.list({ prefix })).blobs.map((b) => b.key)
  } else {
    try { keys = (await fs.readdir(DEV_DIR)).filter((f) => f.startsWith(prefix)).map((f) => f.replace(/\.enc$/, '')) } catch { keys = [] }
  }
  return keys.map((k) => k.slice(prefix.length)).filter((y) => /^\d{4}$/.test(y)).sort()
}

// ── A diákok által (személyes kóddal) választott avatarok – külön tárolva ──
// { [studentId]: { a: avatar, prev: előző avatar, at } }. Olvasáskor ráfésüljük
// a dokumentumra; így a tanár egy közben elmentett (régebbi) példánya sem írja felül.
const avatarsKey = (cls) => `avatars-${cls}`
export async function loadAvatars(cls) {
  const raw = await readRaw(avatarsKey(cls)).catch(() => null)
  return raw ? JSON.parse(open(raw).toString('utf8')) : {}
}
export async function saveAvatars(cls, map) {
  await writeRaw(avatarsKey(cls), seal(Buffer.from(JSON.stringify(map), 'utf8')))
}
export function mergeAvatars(doc, map) {
  if (!doc || !map || !Object.keys(map).length) return doc
  return { ...doc, students: (doc.students || []).map((s) => (map[s.id]?.a ? { ...s, avatar: map[s.id].a } : s)) }
}
const AV_LIMITS = { c: 8, b: 10, e: 6, m: 6, x: 4 }
const AV_THEMES = ['monsters', 'animals', 'fruits', 'food', 'tales']
export function cleanAvatar(a) {
  if (!a || typeof a !== 'object') return null
  const out = {}
  for (const [k, n] of Object.entries(AV_LIMITS)) {
    const v = Number(a[k])
    if (!Number.isInteger(v) || v < 0 || v >= n) return null
    out[k] = v
  }
  if (a.t != null) { if (!AV_THEMES.includes(a.t)) return null; out.t = a.t }
  for (const [k, n] of [['h', 14], ['hc', 6]]) {
    if (a[k] == null) continue
    const v = Number(a[k])
    if (!Number.isInteger(v) || v < 0 || v >= n) return null
    out[k] = v
  }
  return out
}
export const sameAvatar = (x, y) => JSON.stringify(cleanAvatar(x) || {}) === JSON.stringify(cleanAvatar(y) || {})

// ── A diákok saját munkái (személyes kóddal írva): szorgalmi beadások, kiváltság-kérések ──
// Diákonként külön titkosított blob ({ subs: { [taskId]: beadás }, reqs: [kérés] }), így két
// diák egyszerre beküldött munkája nem írja felül egymást, és a tanár mentése sem írja felül őket.
const workKey = (cls, sid) => `work-${cls}-${sid}`
export const STUDENT_ID = /^[A-Za-z0-9_-]{1,40}$/
export async function loadWork(cls, sid) {
  const raw = await readRaw(workKey(cls, sid)).catch(() => null)
  const w = raw ? JSON.parse(open(raw).toString('utf8')) : null
  return { subs: w?.subs || {}, reqs: w?.reqs || [] }
}
export async function saveWork(cls, sid, w) {
  await writeRaw(workKey(cls, sid), seal(Buffer.from(JSON.stringify({ subs: w.subs || {}, reqs: w.reqs || [] }), 'utf8')))
}
async function listKeys(prefix) {
  if (isNetlify()) {
    const store = await getStoreSafe()
    return (await store.list({ prefix })).blobs.map((b) => b.key)
  }
  try { return (await fs.readdir(DEV_DIR)).filter((f) => f.startsWith(prefix)).map((f) => f.replace(/\.enc$/, '')) } catch { return [] }
}
export async function loadAllWork(cls, ids) {
  const out = {}
  for (const sid of ids) {
    if (!STUDENT_ID.test(sid)) continue
    const w = await loadWork(cls, sid)
    if (Object.keys(w.subs).length || w.reqs.length) out[sid] = w
  }
  return out
}
export async function deleteAllWork(cls) {
  for (const k of await listKeys(`work-${cls}-`)) await deleteRaw(k)
}

// beadott fotók (JPEG, titkosítva): photo-<cls>-<id>
export const PHOTO_ID = /^p[A-Za-z0-9_-]{16,30}$/
export async function savePhoto(cls, id, data) { await writeRaw(`photo-${cls}-${id}`, seal(data)) }
export async function loadPhoto(cls, id) {
  const raw = await readRaw(`photo-${cls}-${id}`).catch(() => null)
  return raw ? open(raw) : null
}
export async function deletePhoto(cls, id) { await deleteRaw(`photo-${cls}-${id}`) }
export async function deleteAllPhotos(cls) {
  let n = 0
  for (const k of await listKeys(`photo-${cls}-`)) { await deleteRaw(k); n++ }
  return n
}
