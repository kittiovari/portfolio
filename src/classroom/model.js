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
      skill('5* dolgozat', '👑', 1),
      skill('Aktív órai részvétel', '💡', 1),
      skill('Csapatverseny 1. hely', '🥇', 3),
      skill('Csapatverseny 2. hely', '🥈', 2),
      skill('Csapatverseny 3. hely', '🥉', 1),
      skill('Elkészített házi feladat', '👍', 2),
      skill('Hibátlan házi feladat', '📁', 1),
      skill('Hibátlan órai feladat', '🎒', 1),
      skill('Jót mondtál/kérdeztél!', '🔍', 1),
      skill('Szorgalmi feladat', '🎨', 1),
      skill('Szuper Quizlet-felelős voltál!', '🧪', 2),
    ],
    negative: [
      skill('Csúnya beszéd', '👎', -1),
      skill('Fegyelmezetlenség', '🛸', -1),
      skill('Gúnyolódás', '🦖', -1),
      skill('Hiányos felszerelés', '🧩', -1),
      skill('Késés', '⏰', -1),
      skill('Nincs házi feladat', '🗑️', -2),
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
    directions: ['Vedd elő a füzeted', 'Nyisd ki a könyvet az 50. oldalon', 'Dolgozz párban 10 percig'],
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
  { id: 'today', label: 'Ma' },
  { id: 'yesterday', label: 'Tegnap' },
  { id: 'week', label: 'Ez a hét' },
  { id: 'lastweek', label: 'Múlt hét' },
  { id: 'month', label: 'Ez a hónap' },
  { id: 'lastmonth', label: 'Múlt hónap' },
  { id: 'all', label: 'Mindig' },
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

// ── Jelenlét ──
export const ATTENDANCE = {
  present: { label: 'Jelen', next: 'absent' },
  absent: { label: 'Hiányzik', next: 'late' },
  late: { label: 'Késett', next: 'left' },
  left: { label: 'Korábban távozott', next: 'present' },
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
