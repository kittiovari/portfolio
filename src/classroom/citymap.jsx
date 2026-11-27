import { Sheet } from './ui.jsx'
import { CITY_SIGHTS } from './cities.js'

/*
  Sematikus várostérkép az útlevélhez: a nevezetességek valós elhelyezéssel (szélesség/hosszúság
  egyszerű vetítéssel), folyó vagy vízfelület, a megtett útvonal. A felfedezett helyeknél név és
  érdekesség; a még hátralévők kérdőjellel – a következő kiemelve.
*/
const INK = '#241422'
const W = 420

function project(points) {
  const lats = points.map((p) => p[0]), lons = points.map((p) => p[1])
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLon = Math.min(...lons), maxLon = Math.max(...lons)
  const k = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180) // hosszúsági fok rövidülése
  const spanX = Math.max(1e-4, (maxLon - minLon) * k), spanY = Math.max(1e-4, maxLat - minLat)
  const pad = 56
  const H = Math.round(Math.min(560, Math.max(260, (W - 2 * pad) * (spanY / spanX) + 2 * pad)))
  const s = Math.min((W - 2 * pad) / spanX, (H - 2 * pad) / spanY)
  const ox = (W - spanX * s) / 2, oy = (H - spanY * s) / 2
  return { H, xy: ([lat, lon]) => [ox + (lon - minLon) * k * s, oy + (maxLat - lat) * s] }
}

const LAB = { r: [9, 3.5, 'start'], l: [-9, 3.5, 'end'], t: [0, -11, 'middle'], b: [0, 17, 'middle'] }

export function CityMap({ place, visited = [], complete = false, onClose }) {
  const city = CITY_SIGHTS[place.id]
  if (!city) return null
  const sights = city.sights
  const n = visited.length
  // a vízvonalak csak a vetítés kereténél számítanak, ha a nevezetességek közelében vannak
  const { H, xy } = project(sights.map((s) => s.at))
  const route = sights.slice(0, Math.max(1, n)).map((s) => xy(s.at))
  const ahead = sights.slice(Math.max(0, n - 1)).map((s) => xy(s.at))
  const fmt = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <Sheet title={`${place.city} – ${complete ? 'all sights visited' : `${n} / ${sights.length} sights`}`} onClose={onClose} wide className="cr-citymap">
      <div className="cr-citymap__layout">
        <figure className="cr-citymap__map">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Map of ${place.city}`}>
            <defs>
              <clipPath id={`clip-${place.id}`}><rect x="0" y="0" width={W} height={H} rx="18" /></clipPath>
              <pattern id={`grid-${place.id}`} width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0H0V28" fill="none" stroke="#E9DFCF" strokeWidth="1" />
              </pattern>
            </defs>
            <g clipPath={`url(#clip-${place.id})`}>
              <rect width={W} height={H} fill="#FBF6EC" />
              <rect width={W} height={H} fill={`url(#grid-${place.id})`} />
              {(city.water || []).map((w) => (
                <g key={w.name}>
                  <polyline points={w.line.map((p) => xy(p).join(',')).join(' ')} fill="none" stroke="#BFD9EE" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={w.line.map((p) => xy(p).join(',')).join(' ')} fill="none" stroke="#9CC4E4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity=".7" />
                  <text x={xy(w.at)[0]} y={xy(w.at)[1]} textAnchor="middle" fontSize="9" fontStyle="italic" fill="#5B87AE" fontFamily="Georgia, serif">{w.name}</text>
                </g>
              ))}
              {(city.labels || []).map((l) => (
                <text key={l.name} x={xy(l.at)[0]} y={xy(l.at)[1]} textAnchor="middle" fontSize="10" fontStyle="italic" fill="#5B87AE" fontFamily="Georgia, serif">{l.name}</text>
              ))}
              {/* hátralévő út: halvány szaggatott */}
              {!complete && ahead.length > 1 && <polyline points={ahead.map((p) => p.join(',')).join(' ')} fill="none" stroke="#C9B8C6" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />}
              {/* megtett út */}
              {n > 1 && <polyline points={route.map((p) => p.join(',')).join(' ')} fill="none" stroke={place.color} strokeWidth="3" strokeDasharray="7 5" strokeLinecap="round" strokeLinejoin="round" />}
              {sights.map((s, i) => {
                const [x, y] = xy(s.at)
                const seen = i < n
                const isNext = i === n && !complete
                const label = seen ? s.name : isNext ? 'Next stop' : ''
                // a felirat ne lógjon ki a térképről: szükség esetén a másik oldalra kerül
                const w = label.length * 5.4
                let side = s.lab || 'r'
                if (side === 'l' && x - 9 - w < 4) side = 'r'
                else if (side === 'r' && x + 9 + w > W - 4) side = 'l'
                else if ((side === 't' || side === 'b') && (x - w / 2 < 4 || x + w / 2 > W - 4)) side = x < W / 2 ? 'r' : 'l'
                const [dx, dy, anchor] = LAB[side]
                return (
                  <g key={s.name}>
                    {isNext && <circle cx={x} cy={y} r="14" fill={place.color} opacity=".18"><animate attributeName="r" values="10;16;10" dur="2.4s" repeatCount="indefinite" /></circle>}
                    <circle cx={x} cy={y} r="8.5" fill={seen ? place.color : '#FFFDF8'} stroke={seen ? INK : '#B9A9B6'} strokeWidth="1.4" strokeDasharray={seen ? undefined : '2 2'} />
                    <text x={x} y={y + 3.3} textAnchor="middle" fontSize="9" fontWeight="800" fill={seen ? '#fff' : '#9A8A97'} fontFamily="system-ui, sans-serif">{seen ? i + 1 : '?'}</text>
                    <text x={x + dx} y={y + dy} textAnchor={anchor} fontSize="9.5" fontWeight={seen ? 700 : 600} fill={seen ? INK : '#A797A4'} fontFamily="system-ui, sans-serif"
                      stroke="#FBF6EC" strokeWidth="3" paintOrder="stroke">{label}</text>
                  </g>
                )
              })}
              {/* észak-jel */}
              <g transform={`translate(${W - 26} 28)`}>
                <circle r="13" fill="#FFFDF8" stroke="#D9CBB6" />
                <path d="M0 -8L4 4L0 1.5L-4 4Z" fill={INK} />
                <text y="-15.5" textAnchor="middle" fontSize="8" fontWeight="800" fill={INK} fontFamily="system-ui, sans-serif">N</text>
              </g>
            </g>
          </svg>
          <figcaption className="cr-muted">Schematic map – the sights are in their real places.</figcaption>
        </figure>
        <ol className="cr-citymap__list">
          {sights.map((s, i) => {
            const seen = i < n
            return (
              <li key={s.name} className={seen ? 'is-seen' : i === n && !complete ? 'is-next' : ''} style={{ '--pc': place.color }}>
                <span className="cr-citymap__no">{seen ? i + 1 : '?'}</span>
                {seen ? (
                  <span>
                    <b>{s.name}</b>
                    <small>{s.fact}</small>
                    {visited[i] && <em>{visited[i].title} · {fmt(visited[i].t)}</em>}
                  </span>
                ) : (
                  <span><b>{i === n ? 'Next stop' : 'Still to discover'}</b><small>{i === n ? 'Hand in your next extra task to get here.' : 'Keep going!'}</small></span>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </Sheet>
  )
}
