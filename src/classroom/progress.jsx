import { LEVELS, levelInfo, AV_LOCKS } from './levels.js'
import { HEADWEAR } from './Avatar.jsx'
import { AVATAR } from './model.js'

/*
  Szintek – csak a diák saját riportjában és a tanár diákonkénti nézetében.
  Rangsor, osztályösszesítő sehol nincs. A szint sosem csökken (csak a pozitív pontok számítanak).
*/
const INK = '#241422'
const LEVEL_COLORS = ['#CFE3D3', '#C7DDF0', '#F6D2B5', '#D9CBE6', '#FBE7A1']

// saját jelvény-rajzok (40×40, vonalas, pasztell)
const BADGE = {
  start: (
    <>
      <circle cx="20" cy="22" r="11" fill="#FBF4DC" />
      <path d="M20 14v8l5 3" />
      <path d="M15 6h10" strokeWidth="1.5" />
    </>
  ),
  explorer: (
    // iránytű
    <>
      <circle cx="20" cy="20" r="13" fill={LEVEL_COLORS[0]} />
      <circle cx="20" cy="20" r="9.5" strokeWidth="1.1" opacity=".45" />
      <path d="M20 9.5l3 10.5-3 10.5-3-10.5z" fill="#fff" />
      <path d="M20 9.5l3 10.5h-6z" fill="#D9675F" />
      <circle cx="20" cy="20" r="1.4" fill={INK} stroke="none" />
    </>
  ),
  traveller: (
    // bőrönd matricákkal
    <>
      <rect x="8" y="13" width="24" height="18" rx="3" fill={LEVEL_COLORS[1]} />
      <path d="M16 13v-3.5a1.5 1.5 0 0 1 1.5-1.5h5a1.5 1.5 0 0 1 1.5 1.5V13" />
      <path d="M14 13v18M26 13v18" strokeWidth="1.3" opacity=".55" />
      <circle cx="20" cy="22" r="3" fill="#FBE7A1" strokeWidth="1.2" />
      <path d="M11 34h3M26 34h3" />
    </>
  ),
  storyteller: (
    // nyitott könyv tollal
    <>
      <path d="M20 13c-3-2.5-8-3-12-2v19c4-1 9-.5 12 2 3-2.5 8-3 12-2V11c-4-1-9-.5-12 2z" fill={LEVEL_COLORS[2]} />
      <path d="M20 13v19" />
      <path d="M11 16c2.3-.4 4.6 0 6 .8M11 20c2.3-.4 4.6 0 6 .8M23 16.8c1.4-.8 3.7-1.2 6-.8" strokeWidth="1.2" opacity=".55" />
      <path d="M33 4l-6 11 1 2 2-1 5-10z" fill="#fff" strokeWidth="1.3" />
    </>
  ),
  navigator: (
    // hajókormány
    <>
      <circle cx="20" cy="20" r="9" fill={LEVEL_COLORS[3]} />
      <circle cx="20" cy="20" r="3.2" fill="#fff" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180
        return <path key={a} d={`M${20 + 3.2 * Math.cos(r)} ${20 + 3.2 * Math.sin(r)}L${20 + 14.5 * Math.cos(r)} ${20 + 14.5 * Math.sin(r)}`} strokeWidth="1.6" />
      })}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180
        return <circle key={`k${a}`} cx={20 + 15 * Math.cos(r)} cy={20 + 15 * Math.sin(r)} r="1.7" fill="#E0B33A" strokeWidth="1.1" />
      })}
    </>
  ),
  legend: (
    // csillag babérkoszorúban
    <>
      <path d="M20 8.5l3.3 6.8 7.4 1-5.4 5.2 1.3 7.4-6.6-3.5-6.6 3.5 1.3-7.4-5.4-5.2 7.4-1z" fill={LEVEL_COLORS[4]} />
      <path d="M7 16c-1 7 2 13 9 16M33 16c1 7-2 13-9 16" strokeWidth="1.4" />
      <path d="M6.5 20l2.5 1M7.5 25l2.6.3M10.5 29.5l2.2-.7M33.5 20l-2.5 1M32.5 25l-2.6.3M29.5 29.5l-2.2-.7" strokeWidth="1.4" stroke="#7FA88A" />
    </>
  ),
}
export function LevelBadge({ id = 'start', className = 'cr-art cr-art--md', locked = false }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" opacity={locked ? 0.35 : 1}>
      {BADGE[id] || BADGE.start}
    </svg>
  )
}

// kis lakat a zárolt avatar-elemekhez
export function LockMark({ className = 'cr-lockmark' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7.5" rx="1.8" fill="#241422" />
      <path d="M5.3 7V5.2a2.7 2.7 0 0 1 5.4 0V7" fill="none" stroke="#241422" strokeWidth="1.6" />
      <circle cx="8" cy="10.6" r="1.1" fill="#FBF4DC" />
    </svg>
  )
}

// mit nyit meg az adott szint
const EXTRA_NAMES = { 1: 'Horns', 2: 'Antenna', 3: 'Ears' }
export function unlocksAt(i) {
  return [
    ...Object.entries(AV_LOCKS.h).filter(([, l]) => l === i).map(([v]) => HEADWEAR[v]),
    ...Object.entries(AV_LOCKS.x).filter(([, l]) => l === i).map(([v]) => EXTRA_NAMES[v] || AVATAR.extras[v]),
  ]
}

// Szintkártya: jelenlegi szint, haladás a következőig, a feloldott avatar-elemek
export function LevelCard({ events, own = false }) {
  const info = levelInfo(events)
  const cur = info.level
  const prevMin = cur ? cur.min : 0
  const pct = info.next ? Math.round(((info.pts - prevMin) / (info.next.min - prevMin)) * 100) : 100
  return (
    <section className="cr-level" aria-label="Level">
      <div className="cr-level__head">
        <LevelBadge id={cur?.id || 'start'} className="cr-art cr-level__badge" />
        <div className="cr-level__title">
          <small>{own ? 'Your level' : 'Level'}</small>
          <b>{cur ? cur.name : 'Just starting'}</b>
          <span className="cr-muted">{info.pts} positive point{info.pts === 1 ? '' : 's'} in total · levels never go down</span>
        </div>
      </div>
      {info.next && (
        <div className="cr-level__next">
          <span className="cr-level__bar" role="progressbar" aria-valuemin={prevMin} aria-valuemax={info.next.min} aria-valuenow={info.pts}><i style={{ width: `${Math.max(4, pct)}%` }} /></span>
          <small>{info.toNext} more to <b>{info.next.name}</b>{unlocksAt(info.index + 1).length ? ` · unlocks ${unlocksAt(info.index + 1).join(', ')}` : ''}</small>
        </div>
      )}
      <ol className="cr-level__steps">
        {LEVELS.map((l, i) => (
          <li key={l.id} className={i < info.index ? 'is-on' : ''} title={`${l.name} – ${l.min} points${unlocksAt(i + 1).length ? ` · ${unlocksAt(i + 1).join(', ')}` : ''}`}>
            <LevelBadge id={l.id} className="cr-art cr-art--sm" locked={i >= info.index} />
            <span>{l.name}</span>
            <small>{l.min}</small>
          </li>
        ))}
      </ol>
    </section>
  )
}
