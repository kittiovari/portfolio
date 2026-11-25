// GET  /api/session  → mely területek vannak feloldva (a lakat ikonokhoz)
// POST /api/session  { logout: true } → minden feloldás törlése
import { AREAS, hasSession, clearCookie, json, sameOrigin } from '../lib/security.mjs'
import { loadRegistry } from '../lib/classroomStore.mjs'

const allAreas = async () => [...new Set([...AREAS, ...(await loadRegistry().catch(() => [])).map((c) => `language-${c.id}`)])]

export default async (req) => {
  if (req.method === 'POST') {
    if (!sameOrigin(req)) return json(403, { error: 'origin' })
    const res = json(200, { ok: true })
    for (const area of await allAreas()) res.headers.append('Set-Cookie', clearCookie(area))
    return res
  }
  if (req.method !== 'GET') return json(405, { error: 'method' }, { Allow: 'GET, POST' })
  const unlocked = (await allAreas()).filter((area) => hasSession(req, area))
  return json(200, { unlocked })
}

export const config = { path: '/api/session' }
