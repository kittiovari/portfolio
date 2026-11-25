// Osztályterem – adatmodell és segédfüggvények (tisztán kliensoldali logika).

export const CLASSES = [
  { id: '9b', label: 'NYEK9B', area: 'language-9b' },
  { id: '9d', label: 'NYEK9D', area: 'language-9d' },
]

export const uid = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)
    .replace(/-/g, '')
    .slice(0, 10)

const skill = (name, icon, value) => ({ id: uid(), name, icon, value })

export function defaultSkills() {
  return {
    positive: [
      skill('Top mark (5) on a test', '👑', 1),
      skill('Active participation', '💡', 1),
      skill('Team challenge – 1st place', '🥇', 3),
      skill('Team challenge – 2nd place', '🥈', 2),
      skill('Team challenge – 3rd place', '🥉', 1),
      skill('Homework done', '👍', 2),
      skill('Perfect homework', '📁', 1),
      skill('Perfect class task', '🎒', 1),
      skill('Great answer / question!', '🔍', 1),
      skill('Extra task', '🎨', 1),
      skill('Super Quizlet monitor!', '🧪', 2),
    ],
    negative: [
      skill('Bad language', '👎', -1),
      skill('Disruptive behaviour', '🛸', -1),
      skill('Teasing others', '🦖', -1),
      skill('Missing equipment', '🧩', -1),
      skill('Late', '⏰', -1),
      skill('No homework', '🗑️', -2),
    ],
  }
}

export function emptyClass() {
  return {
    v: 1,
    rev: 0,
    students: [],
    skills: defaultSkills(),
    events: [],
    attendance: {},
    groups: [],
    avoid: [],
    directions: ['Take out your notebook', 'Open your book at page 50', 'Work in pairs for 10 minutes'],
    today: {},
    tps: { think: 60, pair: 120, share: 120 },
  }
}

// ── Avatarok: saját, vonalrajzos „szörnyecskék” ──
export const AVATAR = {
  colors: ['#9FD3E8', '#A9D18E', '#C3B0EA', '#F4AFC4', '#F7C873', '#F2A283', '#8FD6C3', '#E9D772'],
  bodies: ['bean', 'round', 'tall'],
  eyes: ['two', 'one', 'three'],
  mouths: ['smile', 'grin', 'o'],
  extras: ['none', 'horns', 'antenna', 'ears'],
}
const pick = (arr) => Math.floor(Math.random() * arr.length)
export const randomAvatar = () => ({
  c: pick(AVATAR.colors), b: pick(AVATAR.bodies), e: pick(AVATAR.eyes), m: pick(AVATAR.mouths), x: pick(AVATAR.extras),
})

// „Léderer Emma” → { last: 'Léderer', first: 'Emma' } (magyar névsorrend)
export function parseName(line) {
  const parts = line.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return null
  if (parts.length === 1) return { first: parts[0], last: '' }
  return { last: parts[0], first: parts.slice(1).join(' ') }
}

// Keresztnév szerinti ABC-sorrend (magyar ábécé), azonos keresztnévnél vezetéknév szerint
const coll = new Intl.Collator('hu', { sensitivity: 'base' })
export const sortStudents = (list) => [...list].sort((a, b) => coll.compare(a.first, b.first) || coll.compare(a.last, b.last))

export const fullName = (s) => [s.last, s.first].filter(Boolean).join(' ')
export const shortName = (s) => `${s.first}${s.last ? ` ${s.last[0]}.` : ''}`

// ── Pontok ──
export function pointsBy(events) {
  const map = {}
  for (const e of events) map[e.s] = (map[e.s] || 0) + e.v
  return map
}

// ── Dátumok ──
export const dayKey = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const startOfWeek = (d) => {
  const s = startOfDay(d)
  const wd = (s.getDay() + 6) % 7 // hétfő = 0
  s.setDate(s.getDate() - wd)
  return s
}

export const RANGES = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'This week' },
  { id: 'lastweek', label: 'Last week' },
  { id: 'month', label: 'This month' },
  { id: 'lastmonth', label: 'Last month' },
  { id: 'all', label: 'All time' },
]

export function rangeBounds(id, now = new Date()) {
  const today = startOfDay(now)
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
  switch (id) {
    case 'today': return [today, add(today, 1)]
    case 'yesterday': return [add(today, -1), today]
    case 'week': return [startOfWeek(now), add(startOfWeek(now), 7)]
    case 'lastweek': return [add(startOfWeek(now), -7), startOfWeek(now)]
    case 'month': return [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 1)]
    case 'lastmonth': return [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 1)]
    default: return [new Date(0), new Date(8.64e15)]
  }
}

export const inRange = (t, [from, to]) => t >= from.getTime() && t < to.getTime()

// ── Óraterv ──
// doc.schedule = [{ id, day: 1–6 (hétfő = 1), time: 'HH:MM' }]  – heti órarend
// doc.lessonLength = 45
// doc.plans[kulcs] = { title, items: [{ id, minutes, aim, activity, org, equipment, tags[], resources[], done }] }
//   kulcs: 'YYYY-MM-DD@HH:MM' (órarendi óra) vagy 'YYYY-MM-DD' (órarend nélkül)
// resource: { id, type: 'link' | 'file', url?, fileId?, name, mime?, size? }
export const LESSON_MIN = 45
export const WEEKDAYS = [
  { id: 1, short: 'Mon', label: 'Monday' },
  { id: 2, short: 'Tue', label: 'Tuesday' },
  { id: 3, short: 'Wed', label: 'Wednesday' },
  { id: 4, short: 'Thu', label: 'Thursday' },
  { id: 5, short: 'Fri', label: 'Friday' },
  { id: 6, short: 'Sat', label: 'Saturday' },
]
export const ORG_FORMS = [
  { id: 'frontal', label: 'Frontal', icon: '🧑‍🏫' },
  { id: 'individual', label: 'Individual', icon: '🙋' },
  { id: 'pairs', label: 'In pairs', icon: '👯' },
  { id: 'groups', label: 'In groups', icon: '👥' },
]
export const TAGS = [
  { id: 'attendance', label: 'Attendance', color: '#6F8FAF' },
  { id: 'warmer', label: 'Warmer', color: '#E0915A' },
  { id: 'hwreview', label: 'Homework review', color: '#9A7B5B' },
  { id: 'reading', label: 'Reading', color: '#5B8DB8' },
  { id: 'listening', label: 'Listening', color: '#8A6BBE' },
  { id: 'speaking', label: 'Speaking', color: '#D9774F' },
  { id: 'writing', label: 'Writing', color: '#4E9A6A' },
  { id: 'grammar', label: 'Grammar practice', color: '#B5527A' },
  { id: 'pronunciation', label: 'Pronunciation practice', color: '#A0568F' },
  { id: 'vocabulary', label: 'Vocabulary practice', color: '#8F5A9E' },
  { id: 'homework', label: 'Future homework', color: '#3F6E9A' },
  { id: 'reflection', label: 'Self-reflection', color: '#6B5A69' },
]
export const tagOf = (id) => TAGS.find((t) => t.id === id)
// A saját (középső) feladatoknál választható címkék – a fix lépések címkéi nélkül
export const TASK_TAGS = TAGS.filter((t) => !['attendance', 'warmer', 'hwreview', 'homework', 'reflection'].includes(t.id))

const z2 = (n) => String(n).padStart(2, '0')
export const lessonKey = (date, time) => (time ? `${date}@${time}` : date)
export const splitKey = (k) => { const [date, time = null] = String(k).split('@'); return { date, time } }
const parseDate = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d) }
export const addMinutes = (time, min) => {
  if (!time) return null
  const [h, m] = time.split(':').map(Number)
  const t = h * 60 + m + min
  return `${z2(Math.floor(t / 60) % 24)}:${z2(t % 60)}`
}

// ── Fix váz: Warmer, Homework review | saját feladatok | Future homework, Self-reflection ──
// A fix lépések azonosítója rögzített (role), így üres tervnél is stabilan megjelennek.
export const FIXED = {
  attendance: { minutes: 2, aim: 'Attendance', org: 'frontal', tags: ['attendance'] },
  warmer: { minutes: 5, aim: '', org: 'frontal', tags: ['warmer'] },
  hwreview: { minutes: 5, aim: '', org: 'frontal', tags: ['hwreview'], auto: 'hwreview' },
  homework: { minutes: 3, aim: '', org: 'frontal', tags: ['homework'] },
  reflection: { minutes: 2, aim: 'Self-reflection', org: 'individual', tags: ['reflection'] },
}
const fixedItem = (role) => ({ id: `fixed-${role}`, role, activity: '', equipment: '', resources: [], done: false, ...FIXED[role] })
export const reflectionItem = () => fixedItem('reflection')
export const warmerItem = () => fixedItem('warmer')
export const hwReviewItem = () => fixedItem('hwreview')

// Régi tervek fix lépéseinek felismerése + a hiányzók pótlása, rögzített sorrendben
export function withSkeleton(plan) {
  const items = [...(plan.items || [])]
  const take = (role, test) => {
    let i = items.findIndex((it) => it.role === role)
    if (i < 0 && test) i = items.findIndex(test)
    if (i < 0) return fixedItem(role)
    const [it] = items.splice(i, 1)
    return { ...it, role, id: it.id || `fixed-${role}` }
  }
  const attendance = take('attendance', null)
  const warmer = take('warmer', (it, i) => i === 0 && it.tags?.length === 1 && it.tags[0] === 'warmer')
  const hwreview = take('hwreview', (it) => it.auto === 'hwreview')
  const reflection = take('reflection', (it) => it.tags?.includes('reflection') && /self-reflection/i.test(it.aim || ''))
  const homework = take('homework', null)
  return { ...plan, items: [attendance, warmer, { ...hwreview, auto: 'hwreview' }, ...items, homework, reflection] }
}
export const isFixed = (it) => Boolean(it.role)
const hasContent = (it) => Boolean((it.aim || '').trim() || (it.activity || '').trim() || it.resources?.length)

export const newItem = () => ({ id: uid(), minutes: 5, aim: '', activity: '', org: '', equipment: '', tags: [], resources: [], done: false })

// Korábbi kártyák (kind/title/note/skills) átalakítása az új szerkezetre
const SKILL_TAG = { R: 'reading', L: 'listening', S: 'speaking', W: 'writing', G: 'grammar', V: 'vocabulary' }
function normalizeItem(it) {
  if (it.aim !== undefined) return { tags: [], resources: [], ...it }
  const tags = [...(it.kind === 'warmup' ? ['warmer'] : it.kind === 'homework' ? ['homework'] : []), ...(it.skills || []).map((s) => SKILL_TAG[s]).filter(Boolean)]
  return { id: it.id, minutes: it.minutes ?? 5, aim: it.title || it.text || '', activity: it.note || '', org: '', equipment: '', tags, resources: it.resources || [], done: Boolean(it.done) }
}
const normalizePlan = (p) => ({ title: p?.title || '', items: (p?.items || []).map(normalizeItem) })

export function getPlan(doc, key) {
  if (doc.plans?.[key]) return normalizePlan(doc.plans[key])
  const { date, time } = splitKey(key)
  // órarendi óránál a régi, csak dátumos terv is előkerül
  if (time && doc.plans?.[date]) return normalizePlan(doc.plans[date])
  const old = doc.today?.[date]
  if (old?.length) return normalizePlan({ items: old })
  return { title: '', items: [] }
}

export const plannedKeys = (doc) =>
  [...new Set([...Object.keys(doc.plans || {}), ...Object.keys(doc.today || {})])].filter((k) => getPlan(doc, k).items.length || doc.plans?.[k]?.title).sort()

// ── Csengetési rend (0–9. óra): normál 45 perces és rövidített 35 perces ──
export const BELLS = {
  normal: [['07:05', '07:45'], ['07:50', '08:35'], ['08:45', '09:30'], ['09:40', '10:25'], ['10:35', '11:20'],
    ['11:40', '12:25'], ['12:45', '13:30'], ['13:35', '14:20'], ['14:25', '15:10'], ['15:15', '16:00']],
  short: [['07:10', '07:45'], ['07:50', '08:25'], ['08:35', '09:10'], ['09:20', '09:55'], ['10:05', '10:40'],
    ['10:50', '11:25'], ['11:45', '12:20'], ['12:40', '13:15'], ['13:20', '13:55'], ['14:00', '14:35']],
}
export const SHORT_MIN = 35
export const periodOfTime = (time) => BELLS.normal.findIndex(([start]) => start === time)
// órarendi bejegyzés → kezdés (a kulcsban mindig a normál rend kezdése szerepel, így stabil)
const entryTime = (s) => (Number.isInteger(s.period) ? BELLS.normal[s.period][0] : s.time)

export const isShortDay = (doc, date) => (doc.shortDays || []).includes(date)
// Tanítási nap? (a tanév kezdete–vége között, nem szünetben)
export function isSchoolDay(doc, date) {
  const c = doc.calendar || {}
  if (c.start && date < c.start) return false
  if (c.end && date > c.end) return false
  return !(c.breaks || []).some((b) => b.from && b.to && date >= b.from && date <= b.to)
}
export const breakOn = (doc, date) => (doc.calendar?.breaks || []).find((b) => b.from && b.to && date >= b.from && date <= b.to)

// Az óra tényleges kezdése és hossza (rövidített napon a rövidített rend szerint)
export function lessonStart(doc, key) {
  const { date, time } = splitKey(key)
  if (!time) return null
  const p = periodOfTime(time)
  return p >= 0 && isShortDay(doc, date) ? BELLS.short[p][0] : time
}
export const lessonLength = (doc, key) => (isShortDay(doc, splitKey(key).date) ? SHORT_MIN : doc.lessonLength || LESSON_MIN)
export const periodOfKey = (key) => { const t = splitKey(key).time; return t ? periodOfTime(t) : -1 }

// Az órarend szerinti órák egy időablakban (kulcsok, időrendben)
export function scheduledLessons(doc, fromDate, days) {
  const sched = [...(doc.schedule || [])].map((s) => ({ ...s, t: entryTime(s) })).filter((s) => s.t)
    .sort((a, b) => a.day - b.day || a.t.localeCompare(b.t))
  if (!sched.length) return []
  const out = []
  const d = parseDate(fromDate)
  for (let i = 0; i < days; i++) {
    const wd = d.getDay() === 0 ? 7 : d.getDay()
    const date = dayKey(d)
    // szünetben és a tanéven kívül nincs óra
    if (isSchoolDay(doc, date)) for (const s of sched) if (s.day === wd) out.push(lessonKey(date, s.t))
    d.setDate(d.getDate() + 1)
  }
  return out
}

// Léptetéshez: órarendi órák (−60…+180 nap) + minden betervezett alkalom
export function lessonTimeline(doc) {
  // a teljes tanév: a megadott első naptól az utolsóig (különben −60 nap … +1 év)
  const c = doc.calendar || {}
  const from = c.start || dayKey(new Date(Date.now() - 60 * 864e5))
  const to = c.end || dayKey(new Date(Date.now() + 366 * 864e5))
  const days = Math.max(1, Math.round((parseDate(to) - parseDate(from)) / 864e5) + 1)
  const sched = scheduledLessons(doc, from, Math.min(days, 500))
  const schedDates = new Set(sched.map((k) => splitKey(k).date))
  // a csak dátumos (órarend előtti) terv beolvad az aznapi órarendi órába
  const planned = plannedKeys(doc).filter((k) => splitKey(k).time || !schedDates.has(k))
  return [...new Set([...sched, ...planned])].sort()
}

// A következő (vagy most zajló) óra kulcsa
export function nextLessonKey(doc, now = new Date()) {
  const today = dayKey(now)
  const nowTime = `${z2(now.getHours())}:${z2(now.getMinutes())}`
  return lessonTimeline(doc).find((k) => {
    const { date, time } = splitKey(k)
    if (date > today) return true
    if (date < today) return false
    return !time || addMinutes(lessonStart(doc, k), lessonLength(doc, k)) > nowTime
  }) || null
}

// Az adott óra előtti utolsó óra, amelyben van „Future homework” lépés
export function previousHomework(doc, key) {
  const keys = plannedKeys(doc).filter((k) => k < key).sort().reverse()
  for (const k of keys) {
    const items = getPlan(doc, k).items.filter((it) => !it.auto && it.tags?.includes('homework') && hasContent(it))
    if (items.length) return { key: k, items }
  }
  return null
}

// Felirat: dátum · kezdés (· „short”). doc nélkül a kulcsban lévő időt írja ki.
export const lessonLabel = (key, opts = { weekday: 'short', day: 'numeric', month: 'short' }, doc = null) => {
  const { date, time } = splitKey(key)
  const d = parseDate(date).toLocaleDateString('en-GB', opts)
  if (!time) return d
  const p = periodOfTime(time)
  const start = doc ? lessonStart(doc, key) : time
  const short = doc && isShortDay(doc, date) ? ' · short' : ''
  return `${d} · ${p >= 0 ? `${p}. · ` : ''}${start}${short}`
}

// ── Jelenlét ──
export const ATTENDANCE = {
  present: { label: 'Present', next: 'absent' },
  absent: { label: 'Absent', next: 'late' },
  late: { label: 'Late', next: 'left' },
  left: { label: 'Left early', next: 'present' },
}
export const isAbsent = (doc, id, day = dayKey()) => doc.attendance?.[day]?.[id] === 'absent'

// ── Csoportkészítés („ne kerüljenek egy csoportba” párokkal) ──
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function makeGroups(ids, size, avoid = []) {
  const n = Math.max(1, Math.round(ids.length / size))
  const bad = new Set(avoid.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]))
  let best = null
  let bestScore = Infinity
  for (let attempt = 0; attempt < 300; attempt++) {
    const order = shuffle(ids)
    const groups = Array.from({ length: n }, () => [])
    order.forEach((id, i) => groups[i % n].push(id))
    let score = 0
    for (const g of groups) for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) if (bad.has(`${g[i]}|${g[j]}`)) score++
    if (score < bestScore) { best = groups; bestScore = score }
    if (score === 0) break
  }
  return best
}

// ── CSV export ──
export function toCsv(rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return '﻿' + rows.map((r) => r.map(esc).join(';')).join('\r\n')
}

export function download(name, text, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const fmtTime = (s) => {
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.max(0, s % 60)).padStart(2, '0')}`
}

// ── Egyszeri átállás angolra: a korábbi magyar alapértelmezések cseréje ──
// Csak a pontosan egyező, gyári magyar szövegeket cseréli (a saját átnevezéseket nem).
const HU_EN = {
  '5* dolgozat': 'Top mark (5) on a test',
  'Aktív órai részvétel': 'Active participation',
  'Csapatverseny 1. hely': 'Team challenge – 1st place',
  'Csapatverseny 2. hely': 'Team challenge – 2nd place',
  'Csapatverseny 3. hely': 'Team challenge – 3rd place',
  'Elkészített házi feladat': 'Homework done',
  'Hibátlan házi feladat': 'Perfect homework',
  'Hibátlan órai feladat': 'Perfect class task',
  'Jót mondtál/kérdeztél!': 'Great answer / question!',
  'Szorgalmi feladat': 'Extra task',
  'Szuper Quizlet-felelős voltál!': 'Super Quizlet monitor!',
  'Csúnya beszéd': 'Bad language',
  'Fegyelmezetlenség': 'Disruptive behaviour',
  'Gúnyolódás': 'Teasing others',
  'Hiányos felszerelés': 'Missing equipment',
  'Késés': 'Late',
  'Nincs házi feladat': 'No homework',
  'Vedd elő a füzeted': 'Take out your notebook',
  'Nyisd ki a könyvet az 50. oldalon': 'Open your book at page 50',
  'Dolgozz párban 10 percig': 'Work in pairs for 10 minutes',
}
export function migrateToEnglish(doc) {
  let changed = false
  const tr = (s) => { if (typeof s === 'string' && HU_EN[s]) { changed = true; return HU_EN[s] } return s }
  const grp = (s) => { const m = typeof s === 'string' && s.match(/^(\d+)\. csoport$/); if (m) { changed = true; return `Group ${m[1]}` } return s }
  const next = {
    ...doc,
    skills: doc.skills && {
      positive: (doc.skills.positive || []).map((k) => ({ ...k, name: tr(k.name) })),
      negative: (doc.skills.negative || []).map((k) => ({ ...k, name: tr(k.name) })),
    },
    events: (doc.events || []).map((e) => ({ ...e, n: tr(e.n) })),
    directions: (doc.directions || []).map(tr),
    groups: (doc.groups || []).map((g) => ({ ...g, name: grp(g.name) })),
  }
  return changed ? next : doc
}
