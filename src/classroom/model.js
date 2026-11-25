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
// doc.plans[YYYY-MM-DD] = { title, items: [{ id, kind, title, note, skills[], resources[], done }] }
// resource: { id, type: 'link' | 'file', url?, fileId?, name, mime?, size? }
export const SKILLS = [
  { id: 'R', label: 'Reading', hu: 'Olvasás', color: '#5B8DB8' },
  { id: 'L', label: 'Listening', hu: 'Hallás utáni értés', color: '#8A6BBE' },
  { id: 'S', label: 'Speaking', hu: 'Beszéd', color: '#D9774F' },
  { id: 'W', label: 'Writing', hu: 'Írás', color: '#4E9A6A' },
]
export const EXTRA_TAGS = [
  { id: 'G', label: 'Grammar' },
  { id: 'V', label: 'Vocabulary' },
]
export const KINDS = [
  { id: 'warmup', label: 'Warm-up', icon: '🔥' },
  { id: 'task', label: 'Task', icon: '📝' },
  { id: 'homework', label: 'Homework', icon: '🏠' },
]

// A régi, egyszerű napirendet (doc.today) is óratervként adja vissza
export function getPlan(doc, key) {
  if (doc.plans?.[key]) return doc.plans[key]
  const old = doc.today?.[key]
  if (old?.length) {
    return { title: '', items: old.map((it) => ({ id: it.id, kind: 'task', title: it.text, note: '', skills: [], resources: [], done: Boolean(it.done) })) }
  }
  return { title: '', items: [] }
}
export const plannedDays = (doc) =>
  [...new Set([...Object.keys(doc.plans || {}), ...Object.keys(doc.today || {})])].filter((k) => getPlan(doc, k).items.length).sort()

export function skillCoverage(plan) {
  const have = new Set(plan.items.flatMap((it) => it.skills || []))
  return SKILLS.map((s) => ({ ...s, ok: have.has(s.id) }))
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
