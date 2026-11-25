// GET /api/classroom/:cls  → az osztály adatai ({ doc: null }, ha még üres)
// PUT /api/classroom/:cls  { doc } → mentés. A doc.rev egyezzen a tárolttal,
//   különben 409 (másik eszközön közben módosult) és visszaküldjük a frisset.
// Csak a tanári (teacher) munkamenet-sütivel érhető el.
import { hasSession, json, sameOrigin } from '../lib/security.mjs'
import { isClass, loadClass, saveClass } from '../lib/classroomStore.mjs'

const MAX_BYTES = 900 * 1024

export default async (req, context) => {
  const cls = context?.params?.cls
  if (!isClass(cls)) return json(404, { error: 'class' })
  if (!hasSession(req, 'teacher')) return json(401, { error: 'locked' })

  try {
    if (req.method === 'GET') {
      return json(200, { doc: await loadClass(cls) }, { Vary: 'Cookie' })
    }
    if (req.method !== 'PUT') return json(405, { error: 'method' }, { Allow: 'GET, PUT' })
    if (!sameOrigin(req)) return json(403, { error: 'origin' })

    const text = await req.text()
    if (text.length > MAX_BYTES) return json(413, { error: 'too-large' })
    let body
    try {
      body = JSON.parse(text)
    } catch {
      return json(400, { error: 'body' })
    }
    const doc = body?.doc
    if (!doc || typeof doc !== 'object' || !Array.isArray(doc.students) || !Array.isArray(doc.events)) {
      return json(400, { error: 'shape' })
    }

    const current = await loadClass(cls)
    const currentRev = current?.rev ?? 0
    if ((doc.rev ?? 0) !== currentRev) return json(409, { error: 'conflict', doc: current })

    const next = { ...doc, rev: currentRev + 1, savedAt: Date.now() }
    await saveClass(cls, next)
    return json(200, { rev: next.rev })
  } catch (err) {
    console.error('classroom failed', cls, err?.message)
    return json(500, { error: 'store' })
  }
}

export const config = { path: '/api/classroom/:cls' }
