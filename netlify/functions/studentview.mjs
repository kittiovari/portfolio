// POST /api/studentview/:cls  { code } – egy diák SAJÁT, teljes riportja.
// Feltétel: az osztály jelszavával (language-<cls>) vagy tanárként belépve,
// ÉS a tanártól kapott személyes kód. Csak annak az egy diáknak az adatai
// kerülnek ki (a negatív bejegyzésekkel, E-Kréta-számlálókkal együtt).
// Rossz kódra ugyanaz a próbálkozáskorlát érvényes, mint a jelszavaknál.
import crypto from 'node:crypto'
import { hasSession, json, sameOrigin, clientIp } from '../lib/security.mjs'
import { isClass, loadClass, loadArchive, loadAvatars, saveAvatars, cleanAvatar } from '../lib/classroomStore.mjs'
import { lockedFor, registerFailure, registerSuccess } from '../lib/rateLimit.mjs'

const norm = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))

export default async (req, context) => {
  if (req.method !== 'POST') return json(405, { error: 'method' }, { Allow: 'POST' })
  if (!sameOrigin(req)) return json(403, { error: 'origin' })
  const cls = context?.params?.cls
  if (!(await isClass(cls))) return json(404, { error: 'class' })
  if (!hasSession(req, `language-${cls}`) && !hasSession(req, 'teacher')) return json(401, { error: 'locked' })

  let body
  try { body = await req.json() } catch { return json(400, { error: 'body' }) }
  const code = norm(body?.code)
  const area = `code-${cls}`
  const ip = clientIp(req, context)
  const wait = await lockedFor(ip, area)
  if (wait > 0) return json(429, { error: 'locked', retryAfter: wait }, { 'Retry-After': String(wait) })

  try {
    const doc = await loadClass(cls)
    const want = typeof body?.id === 'string' ? body.id : null
    const found = code.length >= 6 ? (doc?.students || []).find((x) => x.code && same(norm(x.code), code)) : null
    // a kód csak ahhoz a diákhoz nyit, akinek az avatarjára kattintottak
    const s = found && (!want || found.id === want) ? found : null
    if (!s) {
      const { remaining, lockedSeconds } = await registerFailure(ip, area)
      if (lockedSeconds) return json(429, { error: 'locked', retryAfter: lockedSeconds }, { 'Retry-After': String(lockedSeconds) })
      return json(401, { error: 'wrong', remaining })
    }
    await registerSuccess(ip, area)
    const avatars = await loadAvatars(cls)
    // a saját avatar módosítása (csak érvényes értékekkel)
    if (body?.avatar !== undefined) {
      const a = cleanAvatar(body.avatar)
      if (!a) return json(400, { error: 'avatar' })
      avatars[s.id] = { a, prev: avatars[s.id]?.a || s.avatar || null, at: Date.now() }
      await saveAvatars(cls, avatars)
      return json(200, { ok: true, avatar: a }, { 'Cache-Control': 'no-store' })
    }
    const past = []
    for (const y of doc.previousYears || []) {
      const a = await loadArchive(cls, y).catch(() => null)
      if (a) past.push(...(a.events || []).filter((e) => e.s === s.id))
    }
    const events = [...past, ...(doc.events || [])].filter((e) => e.s === s.id)
      .map((e) => ({ id: e.id, s: e.s, k: e.k, n: e.n, i: e.i, v: e.v, t: e.t, l: e.l, sn: e.sn, auto: e.auto }))
    const attendance = Object.entries(doc.attendance || {})
      .filter(([, m]) => m?.[s.id]).map(([date, m]) => ({ date, status: m[s.id] }))
    return json(200, { id: s.id, avatar: avatars[s.id]?.a || s.avatar, events, resets: doc.resets?.[s.id] || {}, attendance }, { 'Cache-Control': 'no-store' })
  } catch (err) {
    console.error('studentview failed', cls, err?.message)
    return json(500, { error: 'store' })
  }
}

export const config = { path: '/api/studentview/:cls' }
