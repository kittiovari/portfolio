import { useRef, useState } from 'react'
import { Icon } from './ui.jsx'
import { levelMoments, levelInfo } from './levels.js'
import { LevelBadge, BADGE } from './progress.jsx'
import { sightsOf } from './cities.js'
import { CityMap } from './citymap.jsx'
import { LEVELS } from './levels.js'

/*
  English passport – minden beadott szorgalmi feladat és minden elért szint egy bélyeg.
  A bélyegek egy angol nyelvű hely saját rajzai, egy-egy rövid érdekességgel.
  Csak a diák saját riportjában és a tanár diákonkénti nézetében látszik; év végén nyomtatható.
*/
const INK = '#241422'

// ── Helyek (saját, vonalas rajzok 60×60-as mezőben) ──
export const PLACES = [
  {
    id: 'london', city: 'London', country: 'England', color: '#D9675F', bg: '#FBE3E0',
    fact: 'Big Ben is the bell – the tower itself is called the Elizabeth Tower.',
    art: (
      <>
        <path d="M6 54h48" />
        <path d="M22 54V22h16v32z" fill="#F6D2B5" />
        <path d="M24 22l6-12 6 12z" fill="#E0B33A" />
        <path d="M30 10V5" />
        <circle cx="30" cy="30" r="5" fill="#fff" />
        <path d="M30 27.5V30l1.8 1.2" strokeWidth="1.2" />
        <path d="M25 40h10M25 46h10" strokeWidth="1.2" opacity=".5" />
        <path d="M8 54v-9h10v9" fill="#D9675F" strokeWidth="1.4" />
        <path d="M9.5 48h7" strokeWidth="1.1" />
        <circle cx="10.5" cy="54" r="1.5" fill={INK} stroke="none" />
        <circle cx="15.5" cy="54" r="1.5" fill={INK} stroke="none" />
      </>
    ),
  },
  {
    id: 'edinburgh', city: 'Edinburgh', country: 'Scotland', color: '#6E9CCB', bg: '#E4EEF8',
    fact: 'Edinburgh Castle stands on Castle Rock – an old, extinct volcano.',
    art: (
      <>
        <path d="M4 54c4-10 10-14 18-15l8-1c10 0 18 6 26 16z" fill="#BFD8C2" />
        <path d="M16 39V27h28v12" fill="#DCDAE0" />
        <path d="M16 27v-3h4v3M24 27v-3h4v3M32 27v-3h4v3M40 27v-3h4v3" strokeWidth="1.4" />
        <path d="M26 39v-6a4 4 0 0 1 8 0v6" fill="#fff" strokeWidth="1.4" />
        <path d="M40 24V12" />
        <path d="M40 12h8l-2 3 2 3h-8" fill="#6E9CCB" strokeWidth="1.3" />
      </>
    ),
  },
  {
    id: 'dublin', city: 'Dublin', country: 'Ireland', color: '#4E9A6A', bg: '#E1F0E6',
    fact: 'The Ha’penny Bridge is named after the halfpenny people once paid to cross it.',
    art: (
      <>
        <path d="M4 46c6-12 16-18 26-18s20 6 26 18" fill="none" strokeWidth="2.2" />
        <path d="M4 46h52" />
        <path d="M12 38v8M20 32.5V46M30 30v16M40 32.5V46M48 38v8" strokeWidth="1.1" opacity=".6" />
        <path d="M20 32.5V23M40 32.5V23" />
        <circle cx="20" cy="21.5" r="2" fill="#FBE7A1" strokeWidth="1.2" />
        <circle cx="40" cy="21.5" r="2" fill="#FBE7A1" strokeWidth="1.2" />
        <path d="M6 52c3-2 6 2 9 0s6 2 9 0 6 2 9 0 6 2 9 0 6 2 9 0" stroke="#6E9CCB" strokeWidth="1.4" />
      </>
    ),
  },
  {
    id: 'cardiff', city: 'Cardiff', country: 'Wales', color: '#E0B33A', bg: '#FBF1D2',
    fact: 'Wales has its own language: in Welsh, Cardiff is called Caerdydd.',
    art: (
      <>
        <path d="M30 54V32" stroke="#4E9A6A" strokeWidth="2" />
        <path d="M30 46c-6-1-9-5-10-9 5 0 9 3 10 9z" fill="#A9D18E" strokeWidth="1.3" />
        {[0, 60, 120, 180, 240, 300].map((a) => {
          const r = (a * Math.PI) / 180
          const x = 30 + 8 * Math.cos(r), y = 22 + 8 * Math.sin(r)
          return <ellipse key={a} cx={x} cy={y} rx="5.5" ry="3.6" transform={`rotate(${a} ${x} ${y})`} fill="#FBE7A1" strokeWidth="1.3" />
        })}
        <circle cx="30" cy="22" r="5" fill="#E0B33A" />
        <path d="M26.5 25.5l-1.5 3h10l-1.5-3" fill="#E0B33A" strokeWidth="1.2" />
      </>
    ),
  },
  {
    id: 'newyork', city: 'New York', country: 'USA', color: '#3F8F7F', bg: '#DFF0EC',
    fact: 'The Statue of Liberty was a gift from France – copper that turned green over time.',
    art: (
      <>
        <path d="M20 54l3-10h14l3 10z" fill="#DCDAE0" />
        <path d="M25 44l1-20h8l1 20z" fill="#8FD6C3" />
        <circle cx="30" cy="20" r="4" fill="#8FD6C3" />
        <path d="M26 16.5l-2-3M28.5 15.5l-.5-3.5M31.5 15.5l.5-3.5M34 16.5l2-3" strokeWidth="1.3" />
        <path d="M34 25l5-14" fill="none" strokeWidth="2" />
        <path d="M37.5 11h3l-1 3h-1z" fill="#8FD6C3" strokeWidth="1.2" />
        <path d="M39 8.5c-1.5-2 0-4 0-4s1.8 2 0 4z" fill="#E0B33A" strokeWidth="1.1" />
        <path d="M26 30l-3 4" strokeWidth="1.4" />
        <rect x="21" y="31" width="4" height="5" rx="0.8" fill="#8FD6C3" strokeWidth="1.1" />
      </>
    ),
  },
  {
    id: 'toronto', city: 'Toronto', country: 'Canada', color: '#B4443B', bg: '#F8E2DF',
    fact: 'The CN Tower has a glass floor – you can stand on it 342 metres above the ground.',
    art: (
      <>
        <path d="M4 54h52" />
        <path d="M28.5 54l.8-28h1.4l.8 28z" fill="#DCDAE0" />
        <ellipse cx="30" cy="26" rx="5" ry="3" fill="#F2C4C0" />
        <path d="M30 23V6" />
        <path d="M8 54V42h6v12M14 54V36h7v18M38 54V38h6v16M44 54V44h8v10" fill="#C7DDF0" strokeWidth="1.3" />
        <path transform="translate(-36 2)" d="M47 12l1.5 2.5 2.5-1-1 2.5 2.5 1.5-3 .5.5 2.5-2-1.5-2 1.5.5-2.5-3-.5 2.5-1.5-1-2.5 2.5 1z" fill="#D9675F" strokeWidth="1" />
      </>
    ),
  },
  {
    id: 'sydney', city: 'Sydney', country: 'Australia', color: '#2A78D6', bg: '#E2EEFB',
    fact: 'The roof of the Sydney Opera House is covered with over a million tiles.',
    art: (
      <>
        <path d="M6 44h48v4H6z" fill="#F6D2B5" strokeWidth="1.3" />
        <path d="M12 44c0-10 4-18 12-22-2 8-1 16 2 22z" fill="#fff" />
        <path d="M24 44c0-12 5-21 14-25-3 9-2 18 2 25z" fill="#fff" />
        <path d="M38 44c0-8 3-14 10-17-2 6-1 12 2 17z" fill="#fff" />
        <path d="M6 53c3-2 6 2 9 0s6 2 9 0 6 2 9 0 6 2 9 0 6 2 9 0" stroke="#2A78D6" strokeWidth="1.4" />
        <circle cx="10" cy="12" r="4" fill="#FBE7A1" strokeWidth="1.2" />
      </>
    ),
  },
  {
    id: 'wellington', city: 'Wellington', country: 'New Zealand', color: '#D9774F', bg: '#FBE6DB',
    fact: 'Wellington’s little red cable car has been climbing the hill since 1902.',
    art: (
      <>
        <path d="M4 54c10-6 20-14 30-24s16-14 22-16v40z" fill="#BFD8C2" />
        <path d="M4 46L56 16" strokeWidth="1.4" />
        <g transform="rotate(-30 30 31)">
          <rect x="20" y="25" width="20" height="11" rx="2" fill="#D9675F" />
          <path d="M23 28h4v4h-4zM29 28h4v4h-4zM35 28h3v4h-3" fill="#fff" strokeWidth="1.1" />
          <circle cx="24" cy="37" r="1.6" fill={INK} stroke="none" />
          <circle cx="36" cy="37" r="1.6" fill={INK} stroke="none" />
        </g>
      </>
    ),
  },
  {
    id: 'capetown', city: 'Cape Town', country: 'South Africa', color: '#7FA88A', bg: '#E5F0E8',
    fact: 'A flat cloud often covers Table Mountain – locals call it the “tablecloth”.',
    art: (
      <>
        <path d="M4 46l10-18 6-2h22l5 3 9 17z" fill="#CFE3D3" />
        <path d="M18 26.5c2-3 6-3 8-1 2-3 7-3 9 0 2-2 6-1 7 1.5" fill="#fff" strokeWidth="1.4" />
        <path d="M4 46h52" />
        <path d="M6 52c3-2 6 2 9 0s6 2 9 0 6 2 9 0 6 2 9 0 6 2 9 0" stroke="#6E9CCB" strokeWidth="1.4" />
        <circle cx="12" cy="14" r="4" fill="#FBE7A1" strokeWidth="1.2" />
      </>
    ),
  },
  {
    id: 'sanfrancisco', city: 'San Francisco', country: 'USA', color: '#E0703A', bg: '#FCE7DA',
    fact: 'The Golden Gate Bridge isn’t gold – its colour is called “International Orange”.',
    art: (
      <>
        <path d="M4 42h52" stroke="#E0703A" strokeWidth="2.2" />
        <path d="M16 54V14M44 54V14" stroke="#E0703A" strokeWidth="2.6" />
        <path d="M14 22h4M42 22h4M14 30h4M42 30h4" stroke="#E0703A" strokeWidth="1.4" />
        <path d="M4 34c4 0 8-6 12-20 4 14 10 22 14 22s10-8 14-22c4 14 8 20 12 20" stroke="#E0703A" strokeWidth="1.3" />
        <path d="M6 52c3-2 6 2 9 0s6 2 9 0 6 2 9 0 6 2 9 0 6 2 9 0" stroke="#6E9CCB" strokeWidth="1.4" />
        <path d="M24 10c3-2 7-2 10 0" stroke="#9AA4AE" strokeWidth="1.3" />
      </>
    ),
  },
]

// Bélyeg-rajz (fogazott széllel, színes kerettel, postabélyegzővel)
export function Stamp({ place, date, kind, className = 'cr-stamp', rot = 0 }) {
  const holes = []
  for (let i = 0; i <= 10; i++) { holes.push([4 + i * 9.2, 2]); holes.push([4 + i * 9.2, 118]) }
  for (let i = 1; i < 13; i++) { holes.push([2, 4 + i * 9.2]); holes.push([98, 4 + i * 9.2]) }
  return (
    <svg className={className} viewBox="0 0 100 120" role="img" aria-label={`${place.city} stamp`} style={rot ? { transform: `rotate(${rot}deg)` } : undefined}>
      <rect x="2" y="2" width="96" height="116" fill="#FFFDF8" />
      {holes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" fill="var(--stamp-hole, #F4EFE7)" />)}
      <rect x="9" y="9" width="82" height="102" rx="2" fill={place.bg} stroke={place.color} strokeWidth="2" />
      <g transform="translate(20 16)" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{place.art}</g>
      <text x="50" y="91" textAnchor="middle" fontSize={place.city.length > 10 ? 8.6 : 10.5} fontWeight="800" fill={INK} fontFamily="system-ui, sans-serif">{place.city.toUpperCase()}</text>
      <text x="50" y="102" textAnchor="middle" fontSize="7" fontWeight="600" fill={place.color} fontFamily="system-ui, sans-serif" letterSpacing=".6">{place.country.toUpperCase()}</text>
      {date && (
        <g transform="rotate(-14 74 30)" opacity=".75">
          <circle cx="74" cy="30" r="15" fill="none" stroke="#4B3479" strokeWidth="1.4" />
          <circle cx="74" cy="30" r="11.5" fill="none" stroke="#4B3479" strokeWidth=".8" />
          <text x="74" y="28.5" textAnchor="middle" fontSize="5.4" fontWeight="800" fill="#4B3479" fontFamily="system-ui, sans-serif">{kind === 'level' ? 'VISA' : 'VISITED'}</text>
          <text x="74" y="35" textAnchor="middle" fontSize="5" fontWeight="700" fill="#4B3479" fontFamily="system-ui, sans-serif">{date}</text>
        </g>
      )}
    </svg>
  )
}

// ── Bélyegek ──
// Városbélyeg: minden 5. elfogadott szorgalmi után (a városok sorban követik egymást).
// Vízum: minden elért szint (a szint jelvényével) – a városok így csak a szorgalmikból jönnek.
const isExtraSub = (e) => e.v >= 0 && (/^xs-/.test(e.id || '') || e.n === 'Extra task submitted')
const taskTitle = (e) => (e.sn || 'Extra task').replace(/^Extra task:?\s*/, '') || 'Extra task'
const VISA_COLORS = { explorer: ['#4E9A6A', '#E5F0E8'], traveller: ['#6E9CCB', '#E4EEF8'], storyteller: ['#D9774F', '#FBE6DB'], navigator: ['#8A6BBE', '#F2ECFA'], legend: ['#C9962B', '#FBF1D2'] }
const visaPlace = (l) => ({
  id: `visa-${l.id}`, city: l.name, country: 'Level visa', color: VISA_COLORS[l.id]?.[0] || '#6B5A69', bg: VISA_COLORS[l.id]?.[1] || '#F4EFE7',
  fact: `Reached ${l.min} XP – levels never go down.`,
  art: <g transform="translate(-1 -2) scale(1.55)">{BADGE[l.id]}</g>,
})
export const extraCount = (events = []) => events.filter(isExtraSub).length
// Utazás: minden elfogadott szorgalmi a következő nevezetességhez visz; egy város 5–8 állomás.
// Ha egy város minden állomása megvan → városbélyeg, és jön a következő város.
export function journey(events = []) {
  const ex = events.filter(isExtraSub).sort((a, b) => a.t - b.t).map((e) => ({ t: e.t, title: taskTitle(e) }))
  const done = []
  let i = 0
  // a 10 város után nincs újrakezdés (később új tematika jöhet) – current: null
  for (let k = 0; k < PLACES.length; k++) {
    const place = PLACES[k]
    const need = Math.max(1, sightsOf(place).length || 5)
    if (ex.length - i >= need) { done.push({ place, need, visited: ex.slice(i, i + need), t: ex[i + need - 1].t }); i += need }
    else return { done, current: { place, need, have: ex.length - i, visited: ex.slice(i) } }
  }
  return { done, current: null }
}
export function stampsOf(events = []) {
  const cities = journey(events).done.map((c) => ({ t: c.t, kind: 'extra', place: c.place, label: `${c.need} sights`, visited: c.visited }))
  const visas = levelMoments(events).map((l) => ({ t: l.t, kind: 'level', place: visaPlace(l), label: `Level: ${l.name}`, level: l.id }))
  return [...cities, ...visas].sort((a, b) => a.t - b.t).map((s, i) => ({ ...s, n: i + 1 }))
}
// haladás a következő városig (a város állomásszáma szerint 5–8 lábnyom)
export const nextCity = (events = []) => journey(events).current

// lábnyom a haladásjelzőhöz (bal/jobb váltakozva; megtett lépés: kitöltve)
function Footprint({ on, right }) {
  return (
    <svg className={`cr-foot ${on ? 'is-on' : ''}`} viewBox="0 0 16 24" aria-hidden="true" style={right ? { transform: 'scaleX(-1) translateY(-3px)' } : undefined}>
      <path d="M7.6 8.6c2.6-.2 4.3 1.9 4.2 5.2-.1 3.3-1.4 6.4-1.6 8-.2 1.3-1.4 1.9-2.6 1.7-1.4-.2-2.1-1.3-2.2-2.8-.2-2.2-1.6-3.9-1.7-6.4-.1-3.2 1.5-5.5 3.9-5.7z" />
      <ellipse cx="4.4" cy="6.1" rx="1.25" ry="1.6" />
      <ellipse cx="6.9" cy="4.4" rx="1.3" ry="1.75" />
      <ellipse cx="9.6" cy="4.2" rx="1.2" ry="1.6" />
      <ellipse cx="11.8" cy="5.3" rx="1.05" ry="1.4" />
      <ellipse cx="13.3" cy="7.2" rx=".9" ry="1.2" />
    </svg>
  )
}

const short = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()
const ROT = [-3, 2, -1.5, 3, -2.5, 1, -1, 2.5]

// nextTask: { title, onOpen } – a diák saját lapján a legújabb, még be nem adott szorgalmi
export function Passport({ events, name, classLabel, own = false, nextTask = null }) {
  const stamps = stampsOf(events)
  const next = nextCity(events)
  const [map, setMap] = useState(null) // { place, visited, complete }
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)
  const pdf = async () => {
    setBusy(true)
    try { await downloadPassportPdf({ root: ref.current, stamps, events, name, classLabel }) } catch (e) { console.error('passport pdf', e) } finally { setBusy(false) }
  }
  const slots = Math.max(8, Math.ceil((stamps.length + 1) / 4) * 4)
  return (
    <section className="cr-passport" aria-label="English passport" ref={ref}>
      <header className="cr-passport__cover">
        <span className="cr-passport__crest"><PassportCrest /></span>
        <span className="cr-passport__title"><small>English</small><b>Passport</b></span>
        <span className="cr-spacer" />
        <span className="cr-passport__count"><b>{stamps.length}</b> stamp{stamps.length === 1 ? '' : 's'}</span>
        <button className="cr-btn cr-btn--sm" onClick={pdf} disabled={busy}><Icon.download />{busy ? 'Making PDF…' : 'Download PDF'}</button>
      </header>
      <p className="cr-muted cr-passport__how">Every extra task handed in takes you to the next sight. Visit all the sights of a city (5–8) to earn its stamp – tap a stamp to see the map. Every new level = a visa.</p>
      <ol className="cr-passport__page">
        {Array.from({ length: slots }, (_, i) => {
          const s = stamps[i]
          return s ? (
            <li key={i} className="cr-passport__slot is-on">
              {s.kind === 'extra'
                ? <button className="cr-passport__open" onClick={() => setMap({ place: s.place, visited: s.visited, complete: true })} aria-label={`Open the map of ${s.place.city}`}><Stamp place={s.place} date={short(s.t)} kind={s.kind} rot={ROT[i % ROT.length]} /></button>
                : <Stamp place={s.place} date={short(s.t)} kind={s.kind} rot={ROT[i % ROT.length]} />}
              <b>{s.kind === 'level' ? s.label : s.place.city}</b>
              <small>{s.kind === 'extra' ? `${s.label} · ` : ''}{s.place.fact}</small>
            </li>
          ) : i === stamps.length && !next ? (
            <li key={i} className="cr-passport__slot cr-passport__done"><b>All cities visited!</b><small>New journeys are coming soon.</small></li>
          ) : i === stamps.length ? (
            // a város, ahol most jár: halvány előnézet + lábnyomok
            <li key={i} className="cr-passport__slot cr-passport__next" title={`${next.have} / ${next.need} sights of ${next.place.city}`}>
              <span className="cr-passport__now">Now exploring</span>
              <button className="cr-passport__open" onClick={() => setMap({ place: next.place, visited: next.visited, complete: false })} aria-label={`Open the map of ${next.place.city}`}><Stamp place={next.place} className="cr-stamp-next" /></button>
              <span className="cr-passport__dots" aria-label={`${next.have} of ${next.need} extra tasks`}>
                {Array.from({ length: next.need }, (_, k) => <Footprint key={k} on={k < next.have} right={k % 2 === 1} />)}
              </span>
              <small><b>{next.have} / {next.need}</b> sights of {next.place.city}</small>
              {nextTask && (
                <button className="cr-btn cr-btn--sm cr-btn--primary cr-passport__go" onClick={nextTask.onOpen} title={`Hand in “${nextTask.title}” to reach the next sight`}>
                  <span>Next step</span><small>{nextTask.title}</small>
                </button>
              )}
            </li>
          ) : (
            <li key={i} className="cr-passport__slot" />
          )
        })}
      </ol>
      {map && <CityMap place={map.place} visited={map.visited} complete={map.complete} onClose={() => setMap(null)} />}
      {/* a PDF-hez használt rajzok (rejtve) */}
      <span className="cr-pdfsrc" hidden>
        <PassportCrest className="cr-pdfsrc__crest" />
        {LEVELS.map((l) => <LevelBadge key={l.id} id={l.id} className={`cr-pdfsrc__badge--${l.id}`} />)}
      </span>
    </section>
  )
}

function PassportCrest({ className = 'cr-art' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" stroke="#E0B33A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="20" cy="20" r="14" />
      <ellipse cx="20" cy="20" rx="6" ry="14" />
      <path d="M6 20h28M8.5 13h23M8.5 27h23" />
    </svg>
  )
}

// ── Év végi útlevél / oklevél PDF-ben (A4) ──
// A lapot vászonra rajzoljuk (így a magyar ékezetes nevek is hibátlanok), majd
// egy kis, saját PDF-íróval JPEG-oldalakként mentjük – külső könyvtár nélkül.
const PX = 2 // képpont / pont (A4 = 595 × 842 pt → 1190 × 1684 px)
const A4 = { w: 595.28, h: 841.89 }

function svgToImage(svgEl, w, h) {
  const clone = svgEl.cloneNode(true)
  clone.removeAttribute('style')
  clone.setAttribute('width', String(w)); clone.setAttribute('height', String(h))
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const xml = new XMLSerializer().serializeToString(clone).replace(/var\(--stamp-hole,\s*#[0-9A-Fa-f]+\)/g, '#FFFFFF')
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`
  })
}
function wrap(g, text, maxW) {
  const words = String(text).split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    const t = line ? `${line} ${w}` : w
    if (g.measureText(t).width > maxW && line) { lines.push(line); line = w } else line = t
  }
  if (line) lines.push(line)
  return lines
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath()
}
// JPEG-oldalakból PDF (minden oldal egy teljes oldalas kép)
function pdfFromJpegs(pages) {
  const enc = new TextEncoder()
  const parts = []
  let len = 0
  const offs = []
  const put = (x) => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length }
  const obj = (id, ...body) => { offs[id] = len; put(`${id} 0 obj\n`); body.forEach(put); put('\nendobj\n') }
  put('%PDF-1.4\n')
  const n = pages.length
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>')
  obj(2, `<< /Type /Pages /Kids [${pages.map((_, k) => `${3 + 3 * k} 0 R`).join(' ')}] /Count ${n} >>`)
  pages.forEach((p, k) => {
    const pid = 3 + 3 * k
    obj(pid, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] /Resources << /XObject << /Im0 ${pid + 2} 0 R >> >> /Contents ${pid + 1} 0 R >>`)
    const cs = `q ${A4.w} 0 0 ${A4.h} 0 0 cm /Im0 Do Q`
    obj(pid + 1, `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`)
    obj(pid + 2, `<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.bytes.length} >>\nstream\n`, p.bytes, '\nendstream')
  })
  const xref = len
  const size = 3 + 3 * n
  put(`xref\n0 ${size}\n0000000000 65535 f \n`)
  for (let i = 1; i < size; i++) put(`${String(offs[i]).padStart(10, '0')} 00000 n \n`)
  put(`trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
  return new Blob(parts, { type: 'application/pdf' })
}

export async function downloadPassportPdf({ root, stamps, events, name, classLabel }) {
  const W = Math.round(A4.w * PX), H = Math.round(A4.h * PX)
  const M = 40 * PX // margó
  const font = 'system-ui, -apple-system, "Segoe UI", sans-serif'
  const lv = levelInfo(events)
  const now = new Date()
  const y0 = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
  const stampEls = [...root.querySelectorAll('.cr-passport__page svg.cr-stamp')]
  const crest = await svgToImage(root.querySelector('.cr-pdfsrc__crest'), 64 * PX, 64 * PX)
  const badgeEl = lv.level ? root.querySelector(`.cr-pdfsrc__badge--${lv.level.id}`) : null
  const badge = badgeEl ? await svgToImage(badgeEl, 60 * PX, 60 * PX) : null
  const pages = []
  let c, g, y
  const newPage = () => {
    c = document.createElement('canvas'); c.width = W; c.height = H
    g = c.getContext('2d'); g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H)
    g.textBaseline = 'top'
    y = M
  }
  const finish = async () => {
    g.fillStyle = '#6B5A69'; g.font = `500 ${9 * PX}px ${font}`; g.textAlign = 'right'
    g.fillText(`${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · English Passport · ${name}`, W - M, H - M + 8 * PX)
    g.textAlign = 'left'
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9))
    pages.push({ bytes: new Uint8Array(await blob.arrayBuffer()), w: W, h: H })
  }

  newPage()
  // fejléc
  const hh = 118 * PX
  g.fillStyle = '#2F3E66'; roundRect(g, M, y, W - 2 * M, hh, 16 * PX); g.fill()
  g.drawImage(crest, M + 22 * PX, y + 27 * PX, 64 * PX, 64 * PX)
  const tx = M + 104 * PX
  g.fillStyle = '#E0B33A'; g.font = `700 ${9.5 * PX}px ${font}`
  g.fillText(`ENGLISH PASSPORT · SCHOOL YEAR ${y0}/${String(y0 + 1).slice(2)}`, tx, y + 24 * PX)
  g.fillStyle = '#FBF4DC'; g.font = `800 ${26 * PX}px ${font}`
  g.fillText(name, tx, y + 42 * PX, W - 2 * M - 200 * PX)
  g.font = `500 ${11 * PX}px ${font}`
  g.fillText(`${classLabel ? `Class ${classLabel} · ` : ''}${lv.level ? `Level: ${lv.level.name}` : 'Just starting'} · ${lv.pts} XP · ${stamps.length} stamp${stamps.length === 1 ? '' : 's'}`, tx, y + 80 * PX)
  if (badge) {
    g.fillStyle = '#FFFDF8'; g.beginPath(); g.arc(W - M - 52 * PX, y + hh / 2, 38 * PX, 0, Math.PI * 2); g.fill()
    g.drawImage(badge, W - M - 82 * PX, y + hh / 2 - 30 * PX, 60 * PX, 60 * PX)
  }
  y += hh + 22 * PX
  g.fillStyle = '#241422'; g.font = `400 ${12 * PX}px ${font}`
  for (const l of wrap(g, `This passport belongs to ${name}, who travelled through the English-speaking world one extra task and one level at a time.`, W - 2 * M)) { g.fillText(l, M, y); y += 17 * PX }
  y += 14 * PX

  // bélyegek: két oszlop
  const colW = (W - 2 * M - 20 * PX) / 2
  const sw = 74 * PX, sh = sw * 1.2
  const rowH = sh + 16 * PX
  for (let i = 0; i < stamps.length; i++) {
    const col = i % 2
    if (col === 0 && y + rowH > H - M - 20 * PX) { await finish(); newPage() }
    const x = M + col * (colW + 20 * PX)
    const s = stamps[i]
    if (stampEls[i]) g.drawImage(await svgToImage(stampEls[i], sw, sh), x, y, sw, sh)
    const tx2 = x + sw + 12 * PX
    const tw = colW - sw - 12 * PX
    let ty = y + 8 * PX
    g.fillStyle = '#241422'; g.font = `800 ${12 * PX}px ${font}`
    g.fillText(s.place.city, tx2, ty, tw); ty += 17 * PX
    g.font = `600 ${10 * PX}px ${font}`
    for (const l of wrap(g, s.kind === 'level' ? 'Level visa' : s.label, tw).slice(0, 2)) { g.fillText(l, tx2, ty); ty += 14 * PX }
    g.fillStyle = '#6B5A69'; g.font = `400 ${9 * PX}px ${font}`
    g.fillText(new Date(s.t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), tx2, ty); ty += 13 * PX
    for (const l of wrap(g, s.place.fact, tw).slice(0, 3)) { g.fillText(l, tx2, ty); ty += 12.5 * PX }
    if (col === 1 || i === stamps.length - 1) y += rowH
  }
  if (!stamps.length) { g.fillStyle = '#6B5A69'; g.font = `500 ${12 * PX}px ${font}`; g.fillText('No stamps yet – the first one is coming!', M, y) }
  await finish()

  const blob = pdfFromJpegs(pages)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `English-passport-${name.replace(/[\\/:*?"<>|]+/g, '').trim().replace(/\s+/g, '-')}.pdf`
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

// ── Tanári összesítő: minden diák aktuális XP-je, szintje és útlevele ──
// Csak a tanárnak; ábécérendben (nincs rangsor). Egy sorra kattintva lenyílik a diák teljes útlevele.
export function ClassPassports({ doc, classLabel = '' }) {
  const [open, setOpen] = useState(null)
  const coll = new Intl.Collator('hu', { sensitivity: 'base' })
  const rows = [...doc.students].sort((a, b) => coll.compare(a.first, b.first) || coll.compare(a.last || '', b.last || '')).map((s) => {
    const ev = doc.events.filter((e) => e.s === s.id)
    return { s, ev, lv: levelInfo(ev), stamps: stampsOf(ev) }
  })
  return (
    <div className="cr-classpass">
      <p className="cr-muted">Current XP (positive points, all years), level and passport for each student – alphabetical, only you can see this overview.</p>
      <ul>
        {rows.map(({ s, ev, lv, stamps }) => {
          const prevMin = lv.level ? lv.level.min : 0
          const pct = lv.next ? Math.round(((lv.pts - prevMin) / (lv.next.min - prevMin)) * 100) : 100
          const name = [s.last, s.first].filter(Boolean).join(' ')
          return (
            <li key={s.id} className={open === s.id ? 'is-open' : ''}>
              <button className="cr-classpass__row" onClick={() => setOpen(open === s.id ? null : s.id)} aria-expanded={open === s.id}>
                <span className="cr-classpass__who"><b>{s.first}</b><small>{s.last}</small></span>
                <span className="cr-classpass__xp"><b>{lv.pts}</b><small>XP</small></span>
                <span className="cr-classpass__lv">
                  <LevelBadge id={lv.level?.id || 'start'} className="cr-art cr-art--sm" />
                  <span><b>{lv.level?.name || 'Just starting'}</b>
                    <i className="cr-classpass__bar"><i style={{ width: `${Math.max(4, pct)}%` }} /></i>
                    <small>{lv.next ? `${lv.toNext} to ${lv.next.name}` : 'Top level'}</small></span>
                </span>
                <span className="cr-classpass__stamps" aria-label={`${stamps.length} stamps`}>
                  {stamps.slice(-5).map((st, i) => <Stamp key={i} place={st.place} className="cr-classpass__stamp" />)}
                  <small title={nextCity(ev) ? `${nextCity(ev).have} / ${nextCity(ev).need} sights of ${nextCity(ev).place.city}` : 'All cities visited'}>{stamps.length}<i className="cr-classpass__next">{nextCity(ev) ? `${nextCity(ev).have}/${nextCity(ev).need}` : 'all'}</i></small>
                </span>
              </button>
              {open === s.id && <div className="cr-classpass__detail"><Passport events={ev} name={name} classLabel={classLabel} /></div>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
