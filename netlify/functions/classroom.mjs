// GET /api/classroom/:cls  → az osztály adatai ({ doc: null }, ha még üres)
// PUT /api/classroom/:cls  { doc } → mentés. A doc.rev egyezzen a tárolttal,
//   különben 409 (másik eszközön közben módosult) és visszaküldjük a frisset.
// Csak a tanári (teacher) munkamenet-sütivel érhető el.
import zlib from 'node:zlib'
import { hasSession, json, sameOrigin } from '../lib/security.mjs'
import { isClass, loadClass, saveClass, loadAvatars, saveAvatars, mergeAvatars, sameAvatar, loadAllWork } from '../lib/classroomStore.mjs'
import { allWorkEvents, stripWorkEvents } from '../lib/studentWork.mjs'

// a diákok beadásaiból képzett pont-események ráfésülése (a tárolt dokumentumban nincsenek benne)
async function withWork(cls, doc) {
  if (!doc) return doc
  const work = await loadAllWork(cls, (doc.students || []).map((s) => s.id)).catch(() => ({}))
  const extra = allWorkEvents(doc, work)
  return extra.length ? { ...doc, events: [...stripWorkEvents(doc.events), ...extra] } : doc
}

// A kliens tömörítve (gzip) küldi a dokumentumot: így évekig elfér a teljes
// eseménynapló. Tömörítve max. 5 MB, kibontva max. 40 MB.
const MAX_BYTES = 5 * 1024 * 1024
const MAX_PLAIN = 40 * 1024 * 1024
// válasz tömörítve, ha a böngésző kéri
function gz(req, status, body) {
  const text = JSON.stringify(body)
  if (!/gzip/.test(req.headers.get('accept-encoding') || '') || text.length < 2048) return json(status, body, { Vary: 'Cookie, Accept-Encoding' })
  return new Response(zlib.gzipSync(text), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Encoding': 'gzip', 'Cache-Control': 'no-store', Vary: 'Cookie, Accept-Encoding' },
  })
}

export default async (req, context) => {
  const cls = context?.params?.cls
  if (!(await isClass(cls))) return json(404, { error: 'class' })
  if (!hasSession(req, 'teacher')) return json(401, { error: 'locked' })

  try {
    if (req.method === 'GET') {
      return gz(req, 200, { doc: await withWork(cls, mergeAvatars(await loadClass(cls), await loadAvatars(cls))) })
    }
    if (req.method !== 'PUT') return json(405, { error: 'method' }, { Allow: 'GET, PUT' })
    if (!sameOrigin(req)) return json(403, { error: 'origin' })

    const raw = Buffer.from(await req.arrayBuffer())
    if (raw.length > MAX_BYTES) return json(413, { error: 'too-large' })
    let text
    try {
      text = req.headers.get('x-body-encoding') === 'gzip' ? zlib.gunzipSync(raw, { maxOutputLength: MAX_PLAIN }).toString('utf8') : raw.toString('utf8')
    } catch {
      return json(413, { error: 'too-large' })
    }
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
    const avatars = await loadAvatars(cls)
    if ((doc.rev ?? 0) !== currentRev) return gz(req, 409, { error: 'conflict', doc: await withWork(cls, mergeAvatars(current, avatars)) })

    // diák által választott avatar: ha a beküldött érték a diák választása (vagy az előtte
    // lévő / a tárolt alap), az övé marad; ha a tanár mást állított be, a tanáré nyer
    let avChanged = false
    const base = Object.fromEntries((current?.students || []).map((s) => [s.id, s.avatar]))
    const students = doc.students.map((s) => {
      const o = avatars[s.id]
      if (!o) return s
      if (sameAvatar(s.avatar, o.a) || sameAvatar(s.avatar, o.prev) || sameAvatar(s.avatar, base[s.id])) return { ...s, avatar: o.a }
      delete avatars[s.id]; avChanged = true
      return s
    })
    for (const id of Object.keys(avatars)) if (!doc.students.some((s) => s.id === id)) { delete avatars[id]; avChanged = true }
    if (avChanged) await saveAvatars(cls, avatars)
    // a beadásokból képzett események nem kerülnek a dokumentumba (olvasáskor fésüljük rá)
    const next = { ...doc, students, events: stripWorkEvents(doc.events), rev: currentRev + 1, savedAt: Date.now() }
    await saveClass(cls, next)
    return json(200, { rev: next.rev })
  } catch (err) {
    console.error('classroom failed', cls, err?.message)
    return json(500, { error: 'store' })
  }
}

export const config = { path: '/api/classroom/:cls' }
