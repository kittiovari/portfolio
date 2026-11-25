// GET /api/classview/:cls – az osztályoldal (diákok) csak olvasható nézete.
// A csoport jelszavával (language-<cls>) vagy tanári sütivel érhető el.
// ADATVÉDELEM: a szűrés itt, a szerveren történik – a diákok böngészőjébe
// NEM kerül ki: fejlesztendő (negatív) bejegyzés, jelenlét/hiányzás,
// „ne kerüljenek egy csoportba” párok. A pontszám csak a pozitív pontok összege.
import { hasSession, json } from '../lib/security.mjs'
import { isClass, loadClass } from '../lib/classroomStore.mjs'

const dayKey = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, '0')
  // Magyar idő szerint (a szerver UTC-ben fut)
  const hu = new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }))
  return `${hu.getFullYear()}-${z(hu.getMonth() + 1)}-${z(hu.getDate())}`
}

export default async (req, context) => {
  if (req.method !== 'GET') return json(405, { error: 'method' }, { Allow: 'GET' })
  const cls = context?.params?.cls
  if (!isClass(cls)) return json(404, { error: 'class' })
  if (!hasSession(req, `language-${cls}`) && !hasSession(req, 'teacher')) return json(401, { error: 'locked' })

  try {
    const doc = await loadClass(cls)
    if (!doc) return json(200, { students: [], events: [], groups: [], plan: { title: '', items: [] }, directions: [] }, { Vary: 'Cookie' })

    const students = (doc.students || []).map((s) => ({ id: s.id, first: s.first, last: s.last, avatar: s.avatar }))
    const ids = new Set(students.map((s) => s.id))
    const events = (doc.events || [])
      .filter((e) => e.v > 0 && ids.has(e.s))
      .map((e) => ({ id: e.id, s: e.s, n: e.n, i: e.i, v: e.v, t: e.t }))
    const groups = (doc.groups || []).map((g) => ({ id: g.id, name: g.name, ids: (g.ids || []).filter((id) => ids.has(id)) }))
    // A mai óraterv; ha mára nincs, a következő betervezett alkalomé (dátummal)
    const getPlan = (k) => doc.plans?.[k] || (doc.today?.[k]?.length
      ? { title: '', items: doc.today[k].map((it) => ({ id: it.id, kind: 'task', title: it.text, note: '', skills: [], resources: [], done: Boolean(it.done) })) }
      : null)
    const todayKey = dayKey()
    let planDate = todayKey
    if (!getPlan(todayKey)?.items?.length) {
      const keys = [...new Set([...Object.keys(doc.plans || {}), ...Object.keys(doc.today || {})])]
      planDate = keys.filter((k) => k > todayKey && getPlan(k)?.items?.length).sort()[0] || todayKey
    }
    const p = getPlan(planDate)
    const plan = p ? {
      title: String(p.title || ''),
      items: (p.items || []).map((it) => ({
        id: it.id, kind: it.kind, title: it.title, note: it.note, skills: it.skills || [], done: Boolean(it.done),
        resources: (it.resources || []).map((r) => (r.type === 'file'
          ? { id: r.id, type: 'file', fileId: r.fileId, name: r.name, mime: r.mime, size: r.size }
          : { id: r.id, type: 'link', url: r.url, name: r.name })),
      })),
    } : { title: '', items: [] }

    return json(200, { students, events, groups, plan, planDate, isToday: planDate === todayKey, directions: doc.directions || [] }, { Vary: 'Cookie' })
  } catch (err) {
    console.error('classview failed', cls, err?.message)
    return json(500, { error: 'store' })
  }
}

export const config = { path: '/api/classview/:cls' }
