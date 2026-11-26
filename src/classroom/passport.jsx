import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './ui.jsx'
import { levelMoments, levelInfo } from './levels.js'
import { LevelBadge } from './progress.jsx'

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
          <text x="74" y="28.5" textAnchor="middle" fontSize="5.4" fontWeight="800" fill="#4B3479" fontFamily="system-ui, sans-serif">{kind === 'level' ? 'LEVEL UP' : 'EXTRA'}</text>
          <text x="74" y="35" textAnchor="middle" fontSize="5" fontWeight="700" fill="#4B3479" fontFamily="system-ui, sans-serif">{date}</text>
        </g>
      )}
    </svg>
  )
}

// A bélyegek: beadott szorgalmik + elért szintek, időrendben; a helyek sorban követik egymást
export function stampsOf(events = []) {
  const extra = events.filter((e) => e.v >= 0 && (/^xs-/.test(e.id || '') || e.n === 'Extra task submitted'))
    .map((e) => ({ t: e.t, kind: 'extra', label: (e.sn || 'Extra task').replace(/^Extra task:?\s*/, '') || 'Extra task' }))
  const levels = levelMoments(events).map((l) => ({ t: l.t, kind: 'level', label: `Level: ${l.name}`, level: l.id }))
  return [...extra, ...levels].sort((a, b) => a.t - b.t).map((s, i) => ({ ...s, place: PLACES[i % PLACES.length], n: i + 1 }))
}
const short = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()
const ROT = [-3, 2, -1.5, 3, -2.5, 1, -1, 2.5]

export function Passport({ events, name, classLabel, own = false }) {
  const stamps = stampsOf(events)
  const [printing, setPrinting] = useState(false)
  const slots = Math.max(8, Math.ceil((stamps.length + 1) / 4) * 4)
  return (
    <section className="cr-passport" aria-label="English passport">
      <header className="cr-passport__cover">
        <span className="cr-passport__crest"><PassportCrest /></span>
        <span className="cr-passport__title"><small>English</small><b>Passport</b></span>
        <span className="cr-spacer" />
        <span className="cr-passport__count"><b>{stamps.length}</b> stamp{stamps.length === 1 ? '' : 's'}</span>
        <button className="cr-btn cr-btn--sm" onClick={() => setPrinting(true)}><Icon.download />Print</button>
      </header>
      <p className="cr-muted cr-passport__how">{own ? 'You' : 'Students'} get a stamp for every extra task handed in and every new level.</p>
      <ol className="cr-passport__page">
        {Array.from({ length: slots }, (_, i) => {
          const s = stamps[i]
          return s ? (
            <li key={i} className="cr-passport__slot is-on">
              <Stamp place={s.place} date={short(s.t)} kind={s.kind} rot={ROT[i % ROT.length]} />
              <b>{s.kind === 'level' ? s.label : s.label}</b>
              <small>{s.place.fact}</small>
            </li>
          ) : (
            <li key={i} className="cr-passport__slot"><span className="cr-passport__empty">{i === stamps.length ? 'Next stamp' : ''}</span></li>
          )
        })}
      </ol>
      {printing && <PrintPassport stamps={stamps} events={events} name={name} classLabel={classLabel} onDone={() => setPrinting(false)} />}
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

// Nyomtatható év végi útlevél / oklevél (A4), a lap többi része nyomtatáskor rejtve
function PrintPassport({ stamps, events, name, classLabel, onDone }) {
  useEffect(() => {
    document.body.classList.add('cr-printing')
    const done = () => { document.body.classList.remove('cr-printing'); onDone() }
    window.addEventListener('afterprint', done)
    const id = setTimeout(() => window.print(), 150)
    return () => { clearTimeout(id); window.removeEventListener('afterprint', done); document.body.classList.remove('cr-printing') }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const lv = levelInfo(events)
  const now = new Date()
  const y = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
  return createPortal(
    <div className="cr-print" aria-hidden="true">
      <div className="cr-print__head">
        <PassportCrest className="cr-print__crest" />
        <div>
          <small>English Passport · School year {y}/{String(y + 1).slice(2)}</small>
          <h1>{name}</h1>
          <p>{classLabel ? `Class ${classLabel} · ` : ''}{lv.level ? `Level: ${lv.level.name}` : 'Just starting'} · {stamps.length} stamp{stamps.length === 1 ? '' : 's'}</p>
        </div>
        {lv.level && <LevelBadge id={lv.level.id} className="cr-print__badge" />}
      </div>
      <p className="cr-print__lead">This passport belongs to <b>{name}</b>, who travelled through the English-speaking world one extra task and one level at a time.</p>
      <ol className="cr-print__stamps">
        {stamps.map((s, i) => (
          <li key={i}>
            <Stamp place={s.place} date={short(s.t)} kind={s.kind} className="cr-print__stamp" />
            <span><b>{s.place.city}</b> – {s.label}<small>{s.place.fact}</small></span>
          </li>
        ))}
      </ol>
      <p className="cr-print__foot">{now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · Well done!</p>
    </div>,
    document.body,
  )
}
