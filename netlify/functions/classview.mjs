// GET /api/classview/:cls – az osztályoldal (diákok) csak olvasható nézete.
// A csoport jelszavával (language-<cls>) vagy tanári sütivel érhető el.
// ADATVÉDELEM: a szűrés itt, a szerveren történik – a közös jelszóval a diákok
// böngészőjébe NEM kerül ki: fejlesztendő (negatív) bejegyzés, jelenlét/hiányzás,
// személyes kód, nullázások. A saját, teljes riport csak a személyes kóddal
// érhető el (/api/studentview/:cls).
import { hasSession, json } from '../lib/security.mjs'
import { isClass, loadClass, withSchool, loadAvatars, mergeAvatars, loadRegistry } from '../lib/classroomStore.mjs'
import { cleanXt } from '../lib/studentWork.mjs'

const dayKey = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, '0')
  // Magyar idő szerint (a szerver UTC-ben fut)
  const hu = new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }))
  return `${hu.getFullYear()}-${z(hu.getMonth() + 1)}-${z(hu.getDate())}`
}

const SKILL_TAG = { R: 'reading', L: 'listening', S: 'speaking', W: 'writing', G: 'grammar', V: 'vocabulary' }
const normItem = (it) => (it.aim !== undefined ? it : {
  id: it.id, minutes: it.minutes ?? 5, aim: it.title || it.text || '', activity: it.note || '', org: '', equipment: '',
  tags: [...(it.kind === 'warmup' ? ['warmer'] : it.kind === 'homework' ? ['homework'] : []), ...(it.skills || []).map((x) => SKILL_TAG[x]).filter(Boolean)],
  resources: it.resources || [], done: Boolean(it.done),
})
const hasContent = (it) => Boolean((it.aim || '').trim() || (it.activity || '').trim() || it.resources?.length)
const cleanRes = (r) => (r.type === 'file'
  ? { id: r.id, type: 'file', fileId: r.fileId, name: r.name, mime: r.mime, size: r.size }
  : { id: r.id, type: 'link', url: r.url, name: r.name })

const taskMeta = (xt) => {
  const x = cleanXt(xt)
  return { kinds: x.items.map((i) => (i.open ? 'o' : 'c')), px: x.px, py: x.py, due: x.due }
}

// rövidített napon a rövidített csengetési rend szerinti kezdés
const NORMAL = ['07:05', '07:50', '08:45', '09:40', '10:35', '11:40', '12:45', '13:35', '14:25', '15:15']
const SHORT = ['07:10', '07:50', '08:35', '09:20', '10:05', '10:50', '11:45', '12:40', '13:20', '14:00']

export default async (req, context) => {
  if (req.method !== 'GET') return json(405, { error: 'method' }, { Allow: 'GET' })
  const cls = context?.params?.cls
  if (!(await isClass(cls))) return json(404, { error: 'class' })
  if (!hasSession(req, `language-${cls}`) && !hasSession(req, 'teacher')) return json(401, { error: 'locked' })

  try {
    const doc = mergeAvatars(await withSchool(await loadClass(cls)), await loadAvatars(cls))
    if (!doc) return json(200, { students: [], events: [], groups: [], deskmates: [], lessons: [], plan: { title: '', items: [] }, directions: [] }, { Vary: 'Cookie' })

    const students = (doc.students || []).map((s) => ({ id: s.id, first: s.first, last: s.last, avatar: s.avatar }))
    const ids = new Set(students.map((s) => s.id))
    // a közös jelszóval semmilyen pontadat nem megy ki (osztályösszesítő sem):
    // mindenki csak a saját eredményét látja, a személyes kódjával (/api/studentview)
    const events = []
    const today = dayKey()
    // csoportok csak arra a napra érvényesek, amikor készültek
    const groups = []
    const deskmates = []
    const skills = [...(doc.skills?.positive || []), ...(doc.skills?.negative || [])].map((k) => ({ id: k.id, key: k.key, name: k.name, icon: k.icon, value: k.value }))

    // Minden betervezett óra (a tanév idővonala), a házi-ellenőrzés az előző óra házijából
    const plansAll = { ...Object.fromEntries(Object.entries(doc.today || {}).map(([k, v]) => [k, { title: '', items: v }])), ...(doc.plans || {}) }
    const keys = Object.keys(plansAll).filter((k) => plansAll[k]?.items?.length).sort()
    const prevHwOf = (key) => {
      for (const k of keys.filter((x) => x < key).reverse()) {
        const hw = (plansAll[k].items || []).map(normItem).filter((it) => !it.auto && it.tags?.includes('homework') && hasContent(it))
        if (hw.length) return hw
      }
      return []
    }
    const shortDays = doc.shortDays || []
    const lessonOf = (key) => {
      const p = plansAll[key]
      const prevHw = prevHwOf(key)
      const keep = (it) => (it.role === 'attendance' || it.moved ? false
        : it.role === 'reflection' ? true
          : it.auto === 'hwreview' || it.role === 'hwreview' ? prevHw.length > 0
            : (!it.role || hasContent(it)))
      const resolve = (it) => (it.auto === 'hwreview' || it.role === 'hwreview' ? {
        ...it,
        aim: `Homework review: ${prevHw.map((h) => h.aim).filter(Boolean).join(' · ') || 'homework'}`,
        activity: prevHw.map((h) => h.activity).filter(Boolean).join('\n'),
        equipment: prevHw.map((h) => h.equipment).filter(Boolean).join(', '),
        resources: prevHw.flatMap((h) => h.resources || []),
      } : it)
      const date = key.slice(0, 10)
      const keyTime = key.includes('@') ? key.split('@')[1] : null
      const pIdx = keyTime ? NORMAL.indexOf(keyTime) : -1
      return {
        key, date,
        time: keyTime && pIdx >= 0 && shortDays.includes(date) ? SHORT[pIdx] : keyTime,
        period: pIdx,
        title: String(p.title || ''),
        items: (p.items || []).map(normItem).filter(keep).map(resolve).map((it) => ({
          id: it.id, role: it.role || undefined, minutes: Number(it.minutes) || 0, aim: it.aim || '', activity: it.activity || '', org: it.org || '', equipment: it.equipment || '',
          tags: it.tags || [], done: Boolean(it.done), resources: (it.resources || []).map(cleanRes),
          // szorgalmi feladat: csak a kérdések száma és típusa – a megoldókulcs SOSEM megy ki
          ...(it.role === 'extra' && it.xt ? { task: taskMeta(it.xt) } : {}),
        })),
      }
    }
    const lessons = keys.map(lessonOf).filter((l) => l.items.length)
    const next = lessons.find((l) => l.date >= today) || null

    return json(200, {
      students, events, groups, deskmates, skills, lessons,
      calendar: doc.calendar || {}, units: doc.units || [], shortDays,
      // kompatibilitás: a következő (vagy mai) óra
      plan: next ? { title: next.title, items: next.items } : { title: '', items: [] },
      planKey: next?.key || null, planDate: next?.date || null, planTime: next?.time || null, isToday: next?.date === today,
      directions: doc.directions || [],
      avatarTheme: doc.avatarTheme || 'monsters',
      label: (await loadRegistry()).find((c) => c.id === cls)?.label || cls.toUpperCase(),
    }, { Vary: 'Cookie' })
  } catch (err) {
    console.error('classview failed', cls, err?.message)
    return json(500, { error: 'store' })
  }
}

export const config = { path: '/api/classview/:cls' }
