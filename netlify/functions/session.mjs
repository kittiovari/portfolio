// GET  /api/session  → mely területek vannak feloldva (a lakat ikonokhoz)
// POST /api/session  { logout: true } → minden feloldás törlése
import { AREAS, hasSession, clearCookie, json, sameOrigin } from '../lib/security.mjs'

export default async (req) => {
  if (req.method === 'POST') {
    if (!sameOrigin(req)) return json(403, { error: 'origin' })
    const res = json(200, { ok: true })
    for (const area of AREAS) res.headers.append('Set-Cookie', clearCookie(area))
    return res
  }
  if (req.method !== 'GET') return json(405, { error: 'method' }, { Allow: 'GET, POST' })
  const unlocked = AREAS.filter((area) => hasSession(req, area))
  return json(200, { unlocked })
}

export const config = { path: '/api/session' }
