// Tanévek archívuma (csak tanár)
//   GET  /api/classarchive/:cls          → { years: ['2025', …] }
//   GET  /api/classarchive/:cls/:year    → { doc } – a lezárt tanév teljes dokumentuma
//   POST /api/classarchive/:cls          { year, name?, keepSchedule? } → új tanév:
//        a mostani dokumentum az archívumba kerül, az új tanév a diákokkal
//        (ugyanazokkal az azonosítókkal és kódokkal) és a pontszabályokkal indul.
import zlib from 'node:zlib'
import { hasSession, json, sameOrigin } from '../lib/security.mjs'
import { isClass, loadClass, saveClass, loadArchive, saveArchive, listArchiveYears } from '../lib/classroomStore.mjs'

const gz = (req, body) => (/\bgzip\b/.test(req.headers.get('accept-encoding') || '')
  ? new Response(zlib.gzipSync(JSON.stringify(body)), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Encoding': 'gzip', 'Cache-Control': 'no-store' } })
  : json(200, body))

export default async (req, context) => {
  const { cls, year } = context?.params || {}
  if (!(await isClass(cls))) return json(404, { error: 'class' })
  if (!hasSession(req, 'teacher')) return json(401, { error: 'locked' })
  try {
    if (req.method === 'GET' && !year) return json(200, { years: await listArchiveYears(cls) })
    if (req.method === 'GET') {
      if (!/^\d{4}$/.test(year)) return json(404, { error: 'year' })
      const doc = await loadArchive(cls, year)
      return doc ? gz(req, { doc }) : json(404, { error: 'year' })
    }
    if (req.method !== 'POST' || year) return json(405, { error: 'method' })
    if (!sameOrigin(req)) return json(403, { error: 'origin' })
    const body = await req.json().catch(() => ({}))
    const y = String(body.year || '')
    if (!/^\d{4}$/.test(y)) return json(400, { error: 'year' })
    const cur = await loadClass(cls)
    if (!cur) return json(400, { error: 'empty' })
    if (await loadArchive(cls, y)) return json(409, { error: 'exists' })
    await saveArchive(cls, y, { ...cur, archivedAt: Date.now(), schoolYear: y })
    const next = {
      ...cur,
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim().slice(0, 40) : cur.name,
      events: [], attendance: {}, plans: {}, today: {}, groups: [], groupsDate: null, deskmates: [], resets: {}, units: [],
      schedule: body.keepSchedule ? cur.schedule : [],
      previousYears: [...new Set([...(cur.previousYears || []), y])].sort(),
      rev: (cur.rev ?? 0) + 1, savedAt: Date.now(),
    }
    await saveClass(cls, next)
    return json(200, { ok: true, rev: next.rev })
  } catch (err) {
    console.error('classarchive failed', cls, err?.message)
    return json(500, { error: 'store' })
  }
}

export const config = { path: ['/api/classarchive/:cls', '/api/classarchive/:cls/:year'] }
