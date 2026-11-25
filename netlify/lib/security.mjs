// Szerveroldali biztonsági segédfüggvények a Netlify Functions számára.
// Ez a kód SOHA nem kerül a böngészőbe: a titkok (jelszó-hash-ek, kulcsok)
// csak a Netlify környezeti változóiban élnek.
import crypto from 'node:crypto'

// ── Területek ──────────────────────────────────────────────
// A nyelvoktatás osztályonként külön terület: saját jelszó, süti és tartalom
// teacher: a tanári Osztályterem (pontozás, jelenlét) – csak a tanár jelszavával
export const AREAS = ['language-9b', 'language-9d', 'arttherapy', 'ux', 'teacher']
export const isArea = (a) => AREAS.includes(a) || /^language-[a-z0-9]{1,12}$/.test(a || '')
export const hashEnv = (area) => `PASS_HASH_${area.toUpperCase().replace(/-/g, '_')}`

// ── Jelszó: scrypt (lassú, memóriaigényes → nehéz nyers erővel törni) ──
// Formátum: scrypt$N$r$p$<salt base64>$<hash base64>
const SCRYPT_MAXMEM = 128 * 1024 * 1024

export function hashPassword(password, { N = 32768, r = 8, p = 1 } = {}) {
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(normalize(password), salt, 32, { N, r, p, maxmem: SCRYPT_MAXMEM })
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${hash.toString('base64')}`
}

export function verifyPassword(password, stored) {
  if (!stored || typeof password !== 'string') return false
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [, N, r, p, saltB64, hashB64] = parts
  const expected = Buffer.from(hashB64, 'base64')
  let actual
  try {
    actual = crypto.scryptSync(normalize(password), Buffer.from(saltB64, 'base64'), expected.length, {
      N: Number(N), r: Number(r), p: Number(p), maxmem: SCRYPT_MAXMEM,
    })
  } catch {
    return false
  }
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

// Szóközök levágása, ékezetek egységes (NFC) alakra hozása
const normalize = (s) => String(s).trim().normalize('NFC')

export function areaPasswordHash(area) {
  return process.env[hashEnv(area)] || ''
}

// ── Munkamenet: HMAC-kel aláírt, lejárattal ellátott token sütiben ──
const SESSION_DAYS = 7
const cookieName = (area) => `kp_${area}`

function sessionSecret() {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 32) throw new Error('SESSION_SECRET hiányzik vagy túl rövid')
  return s
}

const b64url = (buf) => Buffer.from(buf).toString('base64url')

export function signSession(area) {
  const payload = b64url(JSON.stringify({ a: area, exp: Date.now() + SESSION_DAYS * 864e5 }))
  const sig = b64url(crypto.createHmac('sha256', sessionSecret()).update(payload).digest())
  return `${payload}.${sig}`
}

export function verifySession(token, area) {
  if (!token || !token.includes('.')) return false
  const [payload, sig] = token.split('.')
  const expected = b64url(crypto.createHmac('sha256', sessionSecret()).update(payload).digest())
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return data.a === area && typeof data.exp === 'number' && data.exp > Date.now()
  } catch {
    return false
  }
}

function readCookies(req) {
  const out = {}
  for (const part of (req.headers.get('cookie') || '').split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

export function hasSession(req, area) {
  return verifySession(readCookies(req)[cookieName(area)], area)
}

// HttpOnly: JavaScript nem olvashatja; Secure: csak HTTPS-en; SameSite=Strict:
// más oldalról indított kérés nem viszi magával; Path=/api: csak az API kapja meg.
export function sessionCookie(area, token) {
  return `${cookieName(area)}=${token}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}`
}

export function clearCookie(area) {
  return `${cookieName(area)}=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
}

// ── Védett tartalom: AES-256-GCM (titkosítás + sérthetetlenség-ellenőrzés) ──
// Fájlformátum: [12 bájt IV][16 bájt hitelesítő tag][titkosított adat]
function contentKey() {
  const k = process.env.CONTENT_KEY
  const buf = k ? Buffer.from(k, 'base64') : null
  if (!buf || buf.length !== 32) throw new Error('CONTENT_KEY hiányzik vagy hibás (32 bájt base64)')
  return buf
}

export function seal(plain, key = contentKey()) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plain), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), enc])
}

export function open(sealed, key = contentKey()) {
  const iv = sealed.subarray(0, 12)
  const tag = sealed.subarray(12, 28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(sealed.subarray(28)), decipher.final()])
}

// ── HTTP segédek ──
export function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      ...headers,
    },
  })
}

// Csak a saját oldalunkról érkező kérést fogadjuk el (CSRF elleni védelem)
export function sameOrigin(req) {
  const origin = req.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).host === new URL(req.url).host
  } catch {
    return false
  }
}

export function clientIp(req, context) {
  return context?.ip || req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}
