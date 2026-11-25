// Saját illusztráció-készlet (emoji helyett) – a CalendarArt / OrgIcon stílusában:
// 40×40, sötét körvonal, pasztell kitöltés, arany kiemelés.
const INK = '#241422'
const C = {
  gold: '#E0B33A', cream: '#FBF4DC', butter: '#FBE7A1', rose: '#F2C4C0', red: '#D9675F', sage: '#BFD8C2', green: '#7FA88A',
  sky: '#C7DDF0', blue: '#6E9CCB', lilac: '#D9CBE6', peach: '#F6D2B5', silver: '#DCDAE0', bronze: '#DDA97C', paper: '#FFFDF8',
}
const Dot = (p) => <circle r="1.2" fill={INK} stroke="none" {...p} />

const medal = (fill, n) => (
  <>
    <path d="M13 4l5 11M27 4l-5 11" strokeWidth="1.6" />
    <path d="M11 4h6l4 9h-2zM29 4h-6l-4 9h2z" fill={C.sky} strokeWidth="1.2" />
    <circle cx="20" cy="25" r="10" fill={fill} />
    <circle cx="20" cy="25" r="6.8" strokeWidth="1.1" opacity=".5" />
    <text x="20" y="29.2" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={INK} stroke="none" fontFamily="system-ui, sans-serif">{n}</text>
  </>
)
const page = (tab, lines = true) => (
  <>
    <path d="M10 5h14l7 7v22a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill={C.paper} />
    <path d="M24 5v7h7" />
    {lines && <path d="M13 18h11M13 22.5h13M13 27h9" strokeWidth="1.3" opacity=".5" />}
    {tab && <rect x="5" y="24" width="15" height="8" rx="2" fill={tab} strokeWidth="1.3" />}
  </>
)

export const ART = {
  // ── pontkategóriák ──
  active: (
    <>
      <path d="M20 7a9.5 9.5 0 0 0-5.6 17.2c1.3 1 1.8 2.3 1.8 3.8h7.6c0-1.5.5-2.8 1.8-3.8A9.5 9.5 0 0 0 20 7z" fill={C.butter} />
      <path d="M16.5 31.5h7M17.5 35h5" />
      <path d="M20 27.5v-6.5M17.5 18.5l2.5 2.5 2.5-2.5" strokeWidth="1.3" />
      <path d="M20 2.5v1.8M6.5 8l1.4 1.2M33.5 8l-1.4 1.2M3.5 18h1.8M34.7 18h1.8" strokeWidth="1.5" stroke={C.gold} />
    </>
  ),
  question: (
    <>
      <path d="M8 8h24a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H19l-6.5 5.5V28H8a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3z" fill={C.sky} />
      <path d="M16.5 15a3.6 3.6 0 1 1 5.4 3.1c-1.1.7-1.9 1.4-1.9 2.9" />
      <Dot cx="20" cy="24.3" />
    </>
  ),
  perfect_task: (
    <>
      <circle cx="18" cy="22" r="13" fill={C.rose} />
      <circle cx="18" cy="22" r="8.5" fill={C.paper} />
      <circle cx="18" cy="22" r="4" fill={C.red} />
      <path d="M18 22L33 7" />
      <path d="M29 6l4 1 1 4M31 4l2 3" strokeWidth="1.4" />
    </>
  ),
  team1: medal(C.gold, 1),
  team2: medal(C.silver, 2),
  team3: medal(C.bronze, 3),
  creative: (
    <>
      <path d="M20 5C11 5 4.5 11.5 4.5 19.5S11 34 18.5 34c2.5 0 3.2-1.6 2.6-3.2-.7-1.9.4-3.5 2.6-3.5h4.3c4.2 0 7.5-3.1 7.5-7.6C35.5 11.3 28.6 5 20 5z" fill={C.cream} />
      <circle cx="12" cy="17" r="2.6" fill={C.red} strokeWidth="1.2" />
      <circle cx="18.5" cy="11.5" r="2.6" fill={C.gold} strokeWidth="1.2" />
      <circle cx="26.5" cy="12.5" r="2.6" fill={C.blue} strokeWidth="1.2" />
      <circle cx="11.5" cy="25" r="2.6" fill={C.green} strokeWidth="1.2" />
    </>
  ),
  fastest: (
    <>
      <path d="M23 3L10 22h9l-3 15 14-21h-9z" fill={C.butter} />
      <path d="M4 14h5M2.5 20h5M5 26h4" strokeWidth="1.5" opacity=".55" />
    </>
  ),
  hw_done: (
    <>
      <rect x="8" y="5" width="23" height="30" rx="3" fill={C.sage} />
      <path d="M13 5v30" strokeWidth="1.3" />
      <circle cx="22" cy="20" r="7" fill={C.paper} strokeWidth="1.4" />
      <path d="M18.8 20.2l2.3 2.3 4.2-4.6" />
    </>
  ),
  perfect_hw: (
    <>
      <path d="M5 11a2 2 0 0 1 2-2h8l3 3h15a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" fill={C.peach} />
      <path d="M5 16h30" strokeWidth="1.3" />
      <path d="M20 19.5l1.9 3.8 4.2.6-3 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3-3 4.2-.6z" fill={C.gold} strokeWidth="1.3" />
    </>
  ),
  extra_hw: (
    <>
      <path d="M18 6l3.6 7.4 8.1 1.2-5.9 5.7 1.4 8.1-7.2-3.8-7.2 3.8 1.4-8.1-5.9-5.7 8.1-1.2z" fill={C.gold} />
      <path d="M32 26v7M28.5 29.5h7M31 4v4M29 6h4" strokeWidth="1.5" />
    </>
  ),
  disruptive: (
    <>
      <path d="M20 4l3.2 6.5 7-2.4-1.6 7.2 7 2.7-6 4.4 3.6 6.4-7.3-.6-1 7.3L20 30l-4.9 5.5-1-7.3-7.3.6 3.6-6.4-6-4.4 7-2.7-1.6-7.2 7 2.4z" fill={C.rose} />
      <path d="M15.5 17.5l3 2-3 2M24.5 17.5l-3 2 3 2" strokeWidth="1.5" />
    </>
  ),
  passivity: (
    <>
      <path d="M11 31a7 7 0 0 1-.6-14 9.5 9.5 0 0 1 18.3-1.6A7.8 7.8 0 1 1 29.5 31z" fill={C.lilac} />
      <path d="M14 23.5q2 1.6 4 0M22 23.5q2 1.6 4 0" strokeWidth="1.4" />
      <path d="M29 5h4l-4 4h4M34 10.5h2.5l-2.5 2.5h2.5" strokeWidth="1.3" />
    </>
  ),
  missing_eq: (
    <>
      <path d="M11 13h18a4 4 0 0 1 4 4v15a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V17a4 4 0 0 1 4-4z" fill={C.peach} />
      <path d="M15 13V9a5 5 0 0 1 10 0v4" />
      <rect x="13" y="21" width="14" height="8" rx="2" fill={C.paper} strokeDasharray="2.2 2" strokeWidth="1.3" />
      <path d="M18.3 23.4a1.9 1.9 0 1 1 2.5 1.8c-.5.2-.8.5-.8 1" strokeWidth="1.2" />
    </>
  ),
  late: (
    <>
      <circle cx="20" cy="22" r="12" fill={C.cream} />
      <path d="M20 15v7l4.5 3" />
      <path d="M8.5 9.5l4-3.5M31.5 9.5l-4-3.5M13 33l-2 3M27 33l2 3" />
      <path d="M8 6.5a4 4 0 0 1 4.5-1.5M32 6.5a4 4 0 0 0-4.5-1.5" stroke={C.red} />
    </>
  ),
  no_hw: (
    <>
      <rect x="8" y="5" width="23" height="30" rx="3" fill={C.paper} />
      <path d="M13 5v30" strokeWidth="1.3" />
      <circle cx="22" cy="20" r="7" fill={C.rose} strokeWidth="1.4" />
      <path d="M19.4 17.4l5.2 5.2M24.6 17.4l-5.2 5.2" />
    </>
  ),
  // ── óralépések ──
  attendance: (
    <>
      <rect x="8" y="7" width="24" height="29" rx="3" fill={C.paper} />
      <rect x="14" y="4" width="12" height="6" rx="2" fill={C.sky} />
      <circle cx="16" cy="19" r="3" fill={C.sage} strokeWidth="1.3" />
      <path d="M11.5 28.5c.8-3 2.4-4.5 4.5-4.5s3.7 1.5 4.5 4.5" strokeWidth="1.3" />
      <path d="M23 21l2 2 4-4.5" stroke={C.green} strokeWidth="2" />
    </>
  ),
  reflection: (
    <>
      <ellipse cx="20" cy="17" rx="11" ry="13" fill={C.lilac} />
      <ellipse cx="20" cy="17" rx="7.5" ry="9.5" fill={C.paper} strokeWidth="1.3" />
      <path d="M20 30v6M14 36h12" />
      <path d="M20 21.5l-3-3a2 2 0 0 1 3-2.6 2 2 0 0 1 3 2.6z" fill={C.red} strokeWidth="1.1" />
    </>
  ),
  reading: (
    <>
      <path d="M4 10c6-2.5 11-2.5 16 1 5-3.5 10-3.5 16-1v22c-6-2.5-11-2.5-16 1-5-3.5-10-3.5-16-1z" fill={C.sky} />
      <path d="M20 11v22" />
      <path d="M8 16c3-.8 6-.8 8.5.4M8 21c3-.8 6-.8 8.5.4M23.5 16.4c2.5-1.2 5.5-1.2 8.5-.4M23.5 21.4c2.5-1.2 5.5-1.2 8.5-.4" strokeWidth="1.2" opacity=".55" />
    </>
  ),
  writing: (
    <>
      <rect x="6" y="7" width="20" height="27" rx="3" fill={C.paper} />
      <path d="M10 14h12M10 19h9M10 24h7" strokeWidth="1.3" opacity=".55" />
      <path d="M31 9l3 3-12 12-4.5 1.5 1.5-4.5z" fill={C.sage} />
    </>
  ),
  speaking: (
    <>
      <path d="M6 9h18a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H14l-5 4v-4H6a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3z" fill={C.peach} />
      <path d="M30 16h4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-1v4l-5-4h-6a3 3 0 0 1-3-3v-1" fill={C.sky} />
      <path d="M9 15h12M9 19h8" strokeWidth="1.3" opacity=".55" />
    </>
  ),
  listening: (
    <>
      <path d="M7 24v-4a13 13 0 0 1 26 0v4" />
      <rect x="5" y="22" width="7" height="11" rx="3" fill={C.lilac} />
      <rect x="28" y="22" width="7" height="11" rx="3" fill={C.lilac} />
      <path d="M17 17v6M20 14v12M23 17v6" stroke={C.gold} strokeWidth="1.6" />
    </>
  ),
  grammar: (
    <>
      <path d="M7 13h8a3 3 0 1 1 6 0h8v8a3 3 0 1 0 0 6v8H7v-8a3 3 0 1 1 0-6z" fill={C.rose} />
      <path d="M13 25h6M16 22v6" strokeWidth="1.4" opacity=".6" />
    </>
  ),
  vocabulary: (
    <>
      <rect x="5" y="10" width="17" height="21" rx="3" fill={C.butter} transform="rotate(-8 13 20)" />
      <rect x="18" y="9" width="17" height="21" rx="3" fill={C.lilac} transform="rotate(7 26 20)" />
      <text x="13.5" y="25" textAnchor="middle" fontSize="11" fontWeight="800" fill={INK} stroke="none" fontFamily="system-ui, sans-serif" transform="rotate(-8 13 20)">A</text>
      <text x="26.5" y="24" textAnchor="middle" fontSize="11" fontWeight="800" fill={INK} stroke="none" fontFamily="system-ui, sans-serif" transform="rotate(7 26 20)">b</text>
    </>
  ),
  pronunciation: (
    <>
      <path d="M8 16a12 12 0 0 1 24 0c0 6-4 8-4 12a5 5 0 0 1-9 2" fill={C.peach} />
      <path d="M16 17a4 4 0 0 1 8 0c0 2.5-2 3.5-2 5.5" strokeWidth="1.4" />
      <path d="M34 22q3 3 0 6M37 19q5 6 0 12" stroke={C.gold} strokeWidth="1.5" />
    </>
  ),
  // ── felület ──
  homework: (
    <>
      <rect x="6" y="6" width="22" height="29" rx="3" fill={C.sky} />
      <path d="M11 6v29" strokeWidth="1.3" />
      <path d="M15.5 14h8M15.5 19h6" strokeWidth="1.4" opacity=".6" />
      <path d="M33.5 12.5l2.5 2.5-12 12-4 1.5 1.5-4z" fill={C.gold} />
      <path d="M31 15l2.5 2.5" strokeWidth="1.3" />
    </>
  ),
  calendar: (
    <>
      <rect x="5" y="8" width="30" height="27" rx="5" fill={C.cream} />
      <path d="M5 16h30M12 5v6M20 5v6M28 5v6" />
      <g opacity=".55"><Dot cx="12" cy="22" /><Dot cx="20" cy="22" /><Dot cx="12" cy="29" /><Dot cx="20" cy="29" /><Dot cx="28" cy="29" /></g>
      <circle cx="28" cy="22" r="3.6" fill={C.gold} />
    </>
  ),
  directions: (
    <>
      <rect x="8" y="7" width="24" height="29" rx="3" fill={C.paper} />
      <rect x="14" y="4" width="12" height="6" rx="2" fill={C.gold} />
      <path d="M17 17h10M17 23h10M17 29h7" strokeWidth="1.4" />
      <g fill={C.green} stroke="none"><circle cx="13" cy="17" r="1.5" /><circle cx="13" cy="23" r="1.5" /><circle cx="13" cy="29" r="1.5" /></g>
    </>
  ),
  headphones: (
    <>
      <path d="M7 24v-4a13 13 0 0 1 26 0v4" />
      <rect x="5" y="22" width="7" height="11" rx="3" fill={C.lilac} />
      <rect x="28" y="22" width="7" height="11" rx="3" fill={C.lilac} />
    </>
  ),
  file: page(null),
  pdf: page(C.red),
  doc: page(C.blue),
  slides: page('#E0915A'),
  sheet: page(C.green),
  link: (
    <>
      <path d="M17 23l6-6" />
      <path d="M14.5 19.5l-3 3a5 5 0 0 0 7 7l3-3" fill="none" />
      <path d="M25.5 20.5l3-3a5 5 0 0 0-7-7l-3 3" fill="none" />
      <circle cx="30" cy="30" r="4" fill={C.sky} strokeWidth="1.3" />
    </>
  ),
  holiday: (
    <>
      <path d="M20 9v26" />
      <path d="M5 18a15 11 0 0 1 30 0q-3.7-2.8-7.5 0-3.7-2.8-7.5 0-3.7-2.8-7.5 0-3.7-2.8-7.5 0z" fill={C.rose} />
      <path d="M4 35h32" />
      <circle cx="32" cy="7" r="3" fill={C.gold} stroke="none" />
    </>
  ),
  lock: (
    <>
      <rect x="9" y="17" width="22" height="18" rx="4" fill={C.butter} />
      <path d="M14 17v-4a6 6 0 0 1 12 0v4" />
      <path d="M20 24v4" />
    </>
  ),
  clip: <path d="M26 13l-10 10a3 3 0 0 0 4.2 4.2l11-11a5.5 5.5 0 0 0-7.8-7.8L12.2 19.6a8 8 0 0 0 11.3 11.3L32 22.5" />,
  bag: (
    <>
      <path d="M11 13h18a4 4 0 0 1 4 4v15a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V17a4 4 0 0 1 4-4z" fill={C.sage} />
      <path d="M15 13V9a5 5 0 0 1 10 0v4" />
      <rect x="13" y="22" width="14" height="7" rx="2" fill={C.paper} strokeWidth="1.3" />
    </>
  ),
  trophy: (
    <>
      <path d="M12 6h16v8a8 8 0 0 1-16 0z" fill={C.gold} />
      <path d="M12 9H7a5 5 0 0 0 5 6M28 9h5a5 5 0 0 1-5 6" />
      <path d="M20 22v6M14 34h12l-1.5-6h-9z" fill={C.cream} />
    </>
  ),
  relax: (
    <>
      <path d="M8 32C8 18 18 8 33 7c0 15-10 25-25 25z" fill={C.sage} />
      <path d="M8 32L24 16M15 25h6M19 21v-5" strokeWidth="1.4" />
    </>
  ),
  energy: (
    <>
      <circle cx="20" cy="20" r="15" fill={C.peach} />
      <path d="M22 8l-8 13h6l-2 11 8-13h-6z" fill={C.butter} />
    </>
  ),
  star: <path d="M20 5l4.4 9 9.9 1.4-7.2 7 1.7 9.8L20 27.6l-8.8 4.6 1.7-9.8-7.2-7 9.9-1.4z" fill={C.gold} />,
  warning: (
    <>
      <path d="M20 5l16 28H4z" fill={C.butter} />
      <path d="M20 15v8" /><Dot cx="20" cy="28" />
    </>
  ),
}

// Ikonválasztóhoz: a választható saját illusztrációk ('art:<név>' formában tárolva)
export const ART_CHOICES = ['active', 'question', 'perfect_task', 'team1', 'team2', 'team3', 'creative', 'fastest', 'hw_done', 'perfect_hw', 'extra_hw', 'star', 'trophy', 'directions', 'headphones', 'relax', 'energy', 'disruptive', 'passivity', 'missing_eq', 'late', 'no_hw', 'warning', 'bag']

export function Art({ name, className = 'cr-art', title }) {
  const g = ART[name]
  if (!g) return null
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" role={title ? 'img' : undefined} aria-hidden={title ? undefined : 'true'} aria-label={title}>
      {g}
    </svg>
  )
}

// Egy pontkategória vagy esemény ikonja: kulcs → saját rajz; 'art:név' → rajz;
// régi emoji → a hozzá legközelebbi rajz (vagy csillag/figyelmeztetés)
const LEGACY = { '💡': 'active', '❓': 'question', '🎯': 'perfect_task', '🥇': 'team1', '🥈': 'team2', '🥉': 'team3', '🎨': 'creative', '⚡': 'fastest', '👍': 'hw_done', '📁': 'perfect_hw', '🌟': 'extra_hw', '⭐': 'star', '🛸': 'disruptive', '😶': 'passivity', '🧩': 'missing_eq', '⏰': 'late', '🗑️': 'no_hw', '🗑': 'no_hw', '🏆': 'trophy', '⚠️': 'warning', '👑': 'trophy' }
export function artName({ key, icon, value } = {}) {
  if (key && ART[key]) return key
  if (typeof icon === 'string' && icon.startsWith('art:') && ART[icon.slice(4)]) return icon.slice(4)
  if (icon && LEGACY[icon]) return LEGACY[icon]
  return value < 0 ? 'warning' : 'star'
}
export function SkillArt({ skill, className = 'cr-art' }) {
  return <Art name={artName(skill || {})} className={className} />
}
// eseményhez: a kategória (e.k) kulcsa alapján
export function EventArt({ doc, e, className = 'cr-art' }) {
  const all = [...(doc?.skills?.positive || []), ...(doc?.skills?.negative || [])]
  const sk = all.find((k) => k.id === e.k)
  return <Art name={artName(sk || { key: e.auto === 'late' ? 'late' : null, icon: e.i, value: e.v })} className={className} />
}
export function fileArt(mime = '') {
  return mime.includes('pdf') ? 'pdf' : /word|opendocument\.text/.test(mime) ? 'doc' : /presentation|powerpoint/.test(mime) ? 'slides' : /sheet|excel/.test(mime) ? 'sheet' : 'file'
}
export function eventArtName(doc, e) {
  const all = [...(doc?.skills?.positive || []), ...(doc?.skills?.negative || [])]
  const sk = all.find((k) => k.id === e.k)
  return artName(sk || { key: e.auto === 'late' ? 'late' : null, icon: e.i, value: e.v })
}
// Egy óralépés illusztrációja: a fix lépés szerepe, különben az első címke
const STEP_ART = { attendance: 'attendance', warmer: 'energy', hwreview: 'hw_done', homework: 'homework', reflection: 'reflection', reading: 'reading', listening: 'listening', speaking: 'speaking', writing: 'writing', grammar: 'grammar', vocabulary: 'vocabulary', pronunciation: 'pronunciation' }
export function stepArt(it) {
  if (it.role && STEP_ART[it.role]) return STEP_ART[it.role]
  if (it.auto === 'hwreview') return 'hw_done'
  const t = (it.tags || []).find((x) => STEP_ART[x])
  return t ? STEP_ART[t] : 'directions'
}
