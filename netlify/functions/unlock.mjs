// POST /api/unlock  { area, password }
// Jelszó ellenőrzése a szerveren; helyes jelszóra aláírt, HttpOnly sütit ad.
import {
  isArea, areaPasswordHash, verifyPassword, signSession, sessionCookie,
  json, sameOrigin, clientIp,
} from '../lib/security.mjs'
import { lockedFor, registerFailure, registerSuccess } from '../lib/rateLimit.mjs'
import { loadRegistry } from '../lib/classroomStore.mjs'

export default async (req, context) => {
  if (req.method !== 'POST') return json(405, { error: 'method' }, { Allow: 'POST' })
  if (!sameOrigin(req)) return json(403, { error: 'origin' })

  let body
  try {
    body = await req.json()
  } catch {
    return json(400, { error: 'body' })
  }
  const area = body?.area
  const password = typeof body?.password === 'string' ? body.password.slice(0, 200) : ''
  if (!isArea(area)) return json(400, { error: 'area' })

  const ip = clientIp(req, context)
  const wait = await lockedFor(ip, area)
  if (wait > 0) return json(429, { error: 'locked', retryAfter: wait }, { 'Retry-After': String(wait) })

  let stored = areaPasswordHash(area)
  if (area.startsWith('language-')) {
    const c = (await loadRegistry()).find((x) => `language-${x.id}` === area)
    if (!c) return json(400, { error: 'area' })
    if (c.pw) stored = c.pw
  }
  if (!stored) {
    // Nincs beállítva jelszó → zárva marad (biztonságos alapállapot)
    return json(503, { error: 'not-configured' })
  }

  if (!verifyPassword(password, stored)) {
    const { remaining, lockedSeconds } = await registerFailure(ip, area)
    if (lockedSeconds) return json(429, { error: 'locked', retryAfter: lockedSeconds }, { 'Retry-After': String(lockedSeconds) })
    return json(401, { error: 'wrong', remaining })
  }

  await registerSuccess(ip, area)
  return json(200, { ok: true }, { 'Set-Cookie': sessionCookie(area, signSession(area)) })
}

export const config = { path: '/api/unlock' }
