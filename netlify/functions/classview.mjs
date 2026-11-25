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
    // csoportok csak arra a napra érvényesek, amikor készültek
    const groups = (doc.groupsDate === dayKey() ? doc.groups || [] : []).map((g) => ({ id: g.id, name: g.name, ids: (g.ids || []).filter((id) => ids.has(id)) }))
    // A következő (vagy ma zajló) betervezett óra – kulcs: 'YYYY-MM-DD@HH:MM' vagy 'YYYY-MM-DD'
    const SKILL_TAG = { R: 'reading', L: 'listening', S: 'speaking', W: 'writing', G: 'grammar', V: 'vocabulary' }
    const normItem = (it) => (it.aim !== undefined ? it : {
      id: it.id, minutes: it.minutes ?? 5, aim: it.title || it.text || '', activity: it.note || '', org: '', equipment: '',
      tags: [...(it.kind === 'warmup' ? ['warmer'] : it.kind === 'homework' ? ['homework'] : []), ...(it.skills || []).map((x) => SKILL_TAG[x]).filter(Boolean)],
      resources: it.resources || [], done: Boolean(it.done),
    })
    const plansAll = { ...Object.fromEntries(Object.entries(doc.today || {}).map(([k, v]) => [k, { title: '', items: v }])), ...(doc.plans || {}) }
    const todayKey = dayKey()
    const planKey = Object.keys(plansAll).filter((k) => k.slice(0, 10) >= todayKey && (plansAll[k]?.items?.length)).sort()[0] || null
    const p = planKey ? plansAll[planKey] : null
    const hasContent = (it) => Boolean((it.aim || '').trim() || (it.activity || '').trim() || it.resources?.length)
    // Homework review: az előző óra „Future homework” lépéseinek tartalma
    const prevHw = (() => {
      if (!planKey) return []
      const keys = Object.keys(plansAll).filter((k) => k < planKey).sort().reverse()
      for (const k of keys) {
        const hw = (plansAll[k]?.items || []).map(normItem).filter((it) => !it.auto && it.tags?.includes('homework') && hasContent(it))
        if (hw.length) return hw
      }
      return []
    })()
    const resolveKeep = (it) => it.role === 'attendance' ? false : it.role === 'reflection' || it.auto === 'hwreview' ? prevHw.length > 0 || it.role === 'reflection' : (!it.role || hasContent(it))
    const resolve = (it) => (it.auto === 'hwreview' ? {
      ...it,
      aim: prevHw.length ? `Homework review: ${prevHw.map((h) => h.aim).filter(Boolean).join(' · ')}` : 'Homework review',
      activity: prevHw.map((h) => h.activity).filter(Boolean).join('\n'),
      equipment: prevHw.map((h) => h.equipment).filter(Boolean).join(', '),
      resources: prevHw.flatMap((h) => h.resources || []),
    } : it)
    const plan = p ? {
      title: String(p.title || ''),
      items: (p.items || []).map(normItem).filter(resolveKeep).map(resolve).map((it) => ({
        id: it.id, role: it.role || undefined, minutes: Number(it.minutes) || 0, aim: it.aim || '', activity: it.activity || '', org: it.org || '', equipment: it.equipment || '',
        tags: it.tags || [], done: Boolean(it.done),
        resources: (it.resources || []).map((r) => (r.type === 'file'
          ? { id: r.id, type: 'file', fileId: r.fileId, name: r.name, mime: r.mime, size: r.size }
          : { id: r.id, type: 'link', url: r.url, name: r.name })),
      })),
    } : { title: '', items: [] }
    const planDate = planKey ? planKey.slice(0, 10) : null
    // rövidített napon a rövidített csengetési rend szerinti kezdés
    const NORMAL = ['07:05', '07:50', '08:45', '09:40', '10:35', '11:40', '12:45', '13:35', '14:25', '15:15']
    const SHORT = ['07:10', '07:50', '08:35', '09:20', '10:05', '10:50', '11:45', '12:40', '13:20', '14:00']
    const keyTime = planKey && planKey.includes('@') ? planKey.split('@')[1] : null
    const pIdx = keyTime ? NORMAL.indexOf(keyTime) : -1
    const planTime = keyTime && pIdx >= 0 && (doc.shortDays || []).includes(planDate) ? SHORT[pIdx] : keyTime

    return json(200, { students, events, groups, plan, planDate, planTime, isToday: planDate === todayKey, directions: doc.directions || [] }, { Vary: 'Cookie' })
  } catch (err) {
    console.error('classview failed', cls, err?.message)
    return json(500, { error: 'store' })
  }
}

export const config = { path: '/api/classview/:cls' }
