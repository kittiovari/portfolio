// GET /api/school → a közös iskolai naptár ({ school: null }, ha még nincs)
// PUT /api/school { school: { calendar, shortDays } } → mentés (csak tanár)
import { hasSession, json, sameOrigin } from '../lib/security.mjs'
import { loadSchool, saveSchool } from '../lib/classroomStore.mjs'

export default async (req) => {
  if (!hasSession(req, 'teacher')) return json(401, { error: 'locked' })
  try {
    if (req.method === 'GET') return json(200, { school: await loadSchool() }, { Vary: 'Cookie' })
    if (req.method !== 'PUT') return json(405, { error: 'method' }, { Allow: 'GET, PUT' })
    if (!sameOrigin(req)) return json(403, { error: 'origin' })
    const text = await req.text()
    if (text.length > 100 * 1024) return json(413, { error: 'too-large' })
    const s = JSON.parse(text)?.school
    if (!s || typeof s !== 'object') return json(400, { error: 'shape' })
    const clean = {
      calendar: {
        start: typeof s.calendar?.start === 'string' ? s.calendar.start.slice(0, 10) : '',
        end: typeof s.calendar?.end === 'string' ? s.calendar.end.slice(0, 10) : '',
        breaks: (Array.isArray(s.calendar?.breaks) ? s.calendar.breaks : []).slice(0, 60).map((b) => ({ id: String(b.id || '').slice(0, 40), name: String(b.name || '').slice(0, 80), from: String(b.from || '').slice(0, 10), to: String(b.to || '').slice(0, 10) })),
      },
      shortDays: (Array.isArray(s.shortDays) ? s.shortDays : []).slice(0, 100).map((d) => String(d).slice(0, 10)),
      savedAt: Date.now(),
    }
    await saveSchool(clean)
    return json(200, { ok: true })
  } catch (err) {
    console.error('school failed', err?.message)
    return json(500, { error: 'store' })
  }
}

export const config = { path: '/api/school' }
