import { createContext, useContext } from 'react'
import { AVATAR } from './model.js'

// Saját, vonalrajzos avatarok (a Kittipedia illusztrációinak stílusában).
// a = { c: szín, b: test, e: szem, m: száj, x: kiegészítő, t?: stílus } – mind index.
// Stílusok (osztályonként választható): szörnyecskék, gyümölcsök-zöldségek,
// ételek-italok, nagyvárosok, mesealakok – vagy „vegyes”, ahol mindenki maga választ.
// Minden stílusban 3 test, 4 kiegészítő és 8 szín van, az arc (szem, száj, pír,
// karocskák, lábak) közös → egy diák avatarja stílusváltáskor a „párjára” vált.
const INK = '#241422'

// ── testek stílusonként: d = körvonal, top / eyeY / w = arc- és kar-elhelyezés,
//    back / front = a test mögé / elé rajzolt részletek, legs = vannak-e lábak ──
const THEME_BODIES = {
  monsters: [
    { key: 'bean', label: 'Bean', d: 'M24 100C20 64 24 26 50 22C76 26 80 64 76 100Z', top: 22, eyeY: 50, w: [24, 76] },
    { key: 'round', label: 'Round', d: 'M50 32C78 32 87 56 85 77C83 97 69 102 50 102C31 102 17 97 15 77C13 56 22 32 50 32Z', top: 32, eyeY: 58, w: [15, 85] },
    { key: 'tall', label: 'Tall', d: 'M30 100C27 68 30 36 50 16C70 36 73 68 70 100Z', top: 16, eyeY: 50, w: [30, 70] },
  ],
  fruits: [
    {
      key: 'apple', label: 'Apple', d: 'M50 36C56 30 70 28 80 40C90 54 87 80 76 94C68 104 58 102 50 98C42 102 32 104 24 94C13 80 10 54 20 40C30 28 44 30 50 36Z', top: 30, eyeY: 58, w: [16, 84],
      front: () => <><path d="M50 36C50 30 51 25 54 20" /><path d="M54 26C60 18 70 18 74 22C68 28 60 29 54 26Z" fill="#7FA88A" /></>,
    },
    {
      key: 'carrot', label: 'Carrot', d: 'M24 34C40 27 60 27 76 34C74 64 63 90 50 106C37 90 26 64 24 34Z', top: 30, eyeY: 50, w: [27, 73], legs: false,
      front: () => <g fill="#7FA88A"><path d="M50 31C44 20 38 14 34 12C42 13 48 19 50 26Z" /><path d="M50 31C50 18 52 10 56 6C57 14 55 22 50 31Z" /><path d="M50 31C56 20 64 15 69 14C64 20 57 26 50 31Z" /></g>,
    },
    {
      key: 'pear', label: 'Pear', d: 'M50 20C60 20 64 32 64 42C64 52 82 62 80 82C78 100 64 104 50 104C36 104 22 100 20 82C18 62 36 52 36 42C36 32 40 20 50 20Z', top: 20, eyeY: 54, w: [21, 79],
      front: () => <><path d="M50 20C50 15 52 11 55 8" /><path d="M53 13C58 8 65 9 67 12C62 16 57 16 53 13Z" fill="#7FA88A" /></>,
    },
  ],
  food: [
    {
      key: 'mug', label: 'Mug', d: 'M22 38H78V92C78 100 71 104 63 104H37C29 104 22 100 22 92Z', top: 38, eyeY: 60, w: [22, 78],
      back: () => <path d="M78 50C94 50 94 80 78 80" strokeWidth="6" />,
      front: () => <path d="M22 46H78" opacity=".35" />,
    },
    {
      key: 'cupcake', label: 'Cupcake', d: 'M20 58C20 34 35 22 50 22C65 22 80 34 80 58L72 104H28Z', top: 22, eyeY: 42, w: [20, 80],
      front: () => <><path d="M21 62H79" /><path d="M35 62L38 103M50 62V103M65 62L62 103" opacity=".35" /></>,
    },
    {
      key: 'onigiri', label: 'Rice ball', d: 'M50 18C60 18 88 70 88 88C88 100 77 104 50 104C23 104 12 100 12 88C12 70 40 18 50 18Z', top: 18, eyeY: 62, w: [16, 84],
      front: () => <path d="M36 86H64V104H36Z" fill="#35503F" />,
    },
  ],
  cities: [
    {
      key: 'tower', label: 'Tower', d: 'M32 104V46L50 16L68 46V104Z', top: 16, eyeY: 60, w: [32, 68],
      front: () => <><path d="M50 16V6" /><path d="M32 46H68" opacity=".4" /><path d="M42 92h16v12H42z" fill="#fff" opacity=".7" /></>,
    },
    {
      key: 'dome', label: 'Dome', d: 'M20 104V62C20 44 33 32 50 32C67 32 80 44 80 62V104Z', top: 26, eyeY: 62, w: [20, 80],
      front: () => <><path d="M45 32V25H55V32" fill="#E0B33A" /><path d="M29 88V104M39 88V104M61 88V104M71 88V104" opacity=".4" /><path d="M20 86H80" opacity=".4" /></>,
    },
    {
      key: 'skyscraper', label: 'Skyscraper', d: 'M28 104V22H72V104Z', top: 22, eyeY: 46, w: [28, 72],
      front: () => <g fill="#fff" stroke="none" opacity=".7">{[78, 88].map((y) => [34, 44, 54, 62].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="5" height="6" rx="1" />))}</g>,
    },
  ],
  tales: [
    {
      key: 'princess', label: 'Princess', d: 'M32 70C30 42 37 24 50 24C63 24 70 42 68 70L84 104H16Z', top: 24, eyeY: 46, w: [31, 69],
      front: () => <><path d="M34 70Q50 78 66 70" /><path d="M30 86Q50 94 70 86" opacity=".35" /></>,
    },
    {
      key: 'knight', label: 'Knight', d: 'M50 30C78 30 87 56 85 77C83 97 69 102 50 102C31 102 17 97 15 77C13 56 22 30 50 30Z', top: 22, eyeY: 64, w: [15, 85],
      front: () => <><path d="M17 56C18 38 32 26 50 26C68 26 82 38 83 56Z" fill="#DCDAE0" /><path d="M50 26V56" opacity=".4" /><path d="M50 26C52 16 58 12 64 12C60 18 56 22 52 26" fill="#D9675F" /></>,
    },
    {
      key: 'wizard', label: 'Wizard', d: 'M30 100C27 70 30 44 50 34C70 44 73 70 70 100Z', top: 6, eyeY: 54, w: [30, 70],
      front: () => <><path d="M28 36L50 2L72 36Z" fill="#6250D6" /><path d="M22 36H78" strokeWidth="3.2" /><circle cx="54" cy="20" r="2.2" fill="#E0B33A" stroke="none" /><circle cx="44" cy="28" r="1.6" fill="#E0B33A" stroke="none" /></>,
    },
  ],
}

export const AVATAR_THEMES = [
  { id: 'monsters', label: 'Monsters', colors: AVATAR.colors },
  { id: 'fruits', label: 'Fruits & veg', colors: ['#F28B82', '#A9D18E', '#F7A35C', '#F7D774', '#B59CD9', '#F4AFC4', '#C9DE7A', '#F6C1A0'] },
  { id: 'food', label: 'Food & drinks', colors: ['#F6D2B5', '#F4AFC4', '#F7E3A3', '#C9A27E', '#A9D18E', '#9FD3E8', '#FBF6EC', '#E9B872'] },
  { id: 'cities', label: 'Big cities', colors: ['#C7DDF0', '#F2C4C0', '#E9D772', '#BFD8C2', '#D9CBE6', '#F6D2B5', '#DCDAE0', '#A7C4E5'] },
  { id: 'tales', label: 'Fairy tales', colors: ['#F4AFC4', '#C3B0EA', '#9FD3E8', '#A9D18E', '#F7C873', '#F2A283', '#8FD6C3', '#E9D772'] },
]
export const EXTRA_LABELS = {
  monsters: ['None', 'Horns', 'Antenna', 'Ears'],
  fruits: ['None', 'Big leaf', 'Seeds', 'Shine'],
  food: ['None', 'Cherry', 'Sprinkles', 'Steam'],
  cities: ['None', 'Flag', 'Lights', 'Cloud'],
  tales: ['None', 'Crown', 'Wand', 'Cape'],
}

// Az osztály avatar-stílusa (a lapon egyszer állítjuk be, minden avatar ezt követi)
export const AvatarThemeContext = createContext('monsters')
export const useAvatarTheme = () => useContext(AvatarThemeContext)
export const themeOf = (ctx, a = {}) => (ctx === 'mixed' ? (a.t && THEME_BODIES[a.t] ? a.t : 'monsters') : THEME_BODIES[ctx] ? ctx : 'monsters')
export const themeColors = (theme) => (AVATAR_THEMES.find((t) => t.id === theme) || AVATAR_THEMES[0]).colors

function Eyes({ kind, y }) {
  const eye = (cx, cy, r, key) => (
    <g key={key}>
      <circle cx={cx} cy={cy} r={r} fill="#fff" />
      <circle cx={cx + r * 0.12} cy={cy + r * 0.1} r={r * 0.45} fill={INK} stroke="none" />
      <circle cx={cx + r * 0.3} cy={cy - r * 0.15} r={r * 0.14} fill="#fff" stroke="none" />
    </g>
  )
  if (kind === 'one') return eye(50, y, 11, 'o')
  if (kind === 'three') return [eye(37, y + 2, 6, 'a'), eye(50, y - 4, 6, 'b'), eye(63, y + 2, 6, 'c')]
  return [eye(40, y, 7.5, 'l'), eye(60, y, 7.5, 'r')]
}

function Mouth({ kind, y }) {
  if (kind === 'grin') {
    return (
      <g>
        <path d={`M37 ${y}Q50 ${y + 15} 63 ${y}Z`} fill={INK} />
        <path d={`M45 ${y + 0.5}h4v4h-4z`} fill="#fff" stroke="none" />
      </g>
    )
  }
  if (kind === 'o') return <ellipse cx="50" cy={y + 4} rx="4" ry="4.6" fill={INK} />
  return <path d={`M40 ${y}Q50 ${y + 10} 60 ${y}`} fill="none" />
}

// kiegészítők: x = 1, 2, 3 stílusonként; layer: 'back' (test mögött) vagy 'front'
function Extra({ theme, x, body, fill, layer }) {
  const t = body.top
  const [l, r] = body.w
  if (theme === 'monsters') {
    if (x === 3 && layer === 'back') {
      const y = body.eyeY - 6
      return (
        <g fill={fill}>
          <path d={`M${l + 4} ${y}C${l - 12} ${y - 10} ${l - 14} ${y + 6} ${l + 2} ${y + 12}`} />
          <path d={`M${r - 4} ${y}C${r + 12} ${y - 10} ${r + 14} ${y + 6} ${r - 2} ${y + 12}`} />
        </g>
      )
    }
    if (layer !== 'front') return null
    if (x === 1) return (
      <g fill="#FBF6EC">
        <path d={`M38 ${t + 8}C33 ${t - 2} 34 ${t - 9} 37 ${t - 12}C40 ${t - 6} 43 ${t} 45 ${t + 4}`} />
        <path d={`M62 ${t + 8}C67 ${t - 2} 66 ${t - 9} 63 ${t - 12}C60 ${t - 6} 57 ${t} 55 ${t + 4}`} />
      </g>
    )
    if (x === 2) return <g><path d={`M50 ${t + 2}C49 ${t - 6} 53 ${t - 9} 55 ${t - 13}`} fill="none" /><circle cx="56" cy={t - 15} r="3.6" fill={fill} /></g>
    return null
  }
  if (theme === 'fruits') {
    if (layer === 'back' && x === 1) return <path d={`M${r - 6} ${t + 14}C${r + 14} ${t + 4} ${r + 18} ${t + 22} ${r + 2} ${t + 32}C${r - 2} ${t + 24} ${r - 4} ${t + 20} ${r - 6} ${t + 14}Z`} fill="#7FA88A" />
    if (layer !== 'front') return null
    if (x === 2) return <g fill="#FBF6EC" stroke="none">{[[36, 82], [50, 88], [64, 82], [43, 94], [57, 94]].map(([cx, cy]) => <ellipse key={cx + cy} cx={cx} cy={cy} rx="1.6" ry="2.4" />)}</g>
    if (x === 3) return <path d={`M${l + 10} ${body.eyeY - 2}C${l + 10} ${body.eyeY - 14} ${l + 18} ${body.eyeY - 20} ${l + 24} ${body.eyeY - 20}`} stroke="#fff" strokeWidth="3.4" opacity=".8" />
    return null
  }
  if (theme === 'food') {
    if (layer !== 'front') return null
    if (x === 1) return <g><path d={`M50 ${t + 2}C50 ${t - 6} 54 ${t - 10} 58 ${t - 12}`} fill="none" /><circle cx="50" cy={t - 2} r="6" fill="#D9675F" /></g>
    if (x === 2) return <g strokeWidth="2.4">{[['#D9675F', 34, 30], ['#6E9CCB', 46, 26], ['#7FA88A', 58, 30], ['#E0B33A', 66, 36], ['#B59CD9', 40, 36]].map(([c, cx, cy]) => <path key={cx} d={`M${cx} ${t + cy - 22}l3 -2`} stroke={c} />)}</g>
    if (x === 3) return <path d={`M40 ${t - 4}C36 ${t - 10} 44 ${t - 14} 40 ${t - 20}M52 ${t - 4}C48 ${t - 10} 56 ${t - 14} 52 ${t - 20}M64 ${t - 4}C60 ${t - 10} 68 ${t - 14} 64 ${t - 20}`} opacity=".55" />
    return null
  }
  if (theme === 'cities') {
    if (layer !== 'front') return null
    const ty = body.key === 'tower' ? t - 10 : body.key === 'dome' ? t - 1 : t
    if (x === 1) return <g><path d={`M50 ${ty}V${ty - 16}`} /><path d={`M50 ${ty - 16}H64L60 ${ty - 12}L64 ${ty - 8}H50`} fill="#D9675F" /></g>
    if (x === 2) return <g><path d={`M50 ${ty}V${ty - 10}`} /><circle cx="50" cy={ty - 13} r="3.4" fill="#E0B33A" /><path d={`M42 ${ty - 17}l-3 -3M58 ${ty - 17}l3 -3M50 ${ty - 20}v-4`} stroke="#E0B33A" strokeWidth="2" /></g>
    if (x === 3) return <path d={`M${r - 2} ${t + 10}a6 6 0 0 1 11 -3a5 5 0 0 1 8 5a4 4 0 0 1 -1 8h-17a5 5 0 0 1 -1 -10z`} fill="#fff" />
    return null
  }
  if (theme === 'tales') {
    if (x === 3 && layer === 'back') return <path d={`M${l + 4} ${body.eyeY + 10}C${l - 10} ${body.eyeY + 40} ${l - 8} 100 ${l + 2} 104H${r - 2}C${r + 8} 100 ${r + 10} ${body.eyeY + 40} ${r - 4} ${body.eyeY + 10}Z`} fill="#D9675F" />
    if (layer !== 'front') return null
    if (x === 1) {
      const cy = body.key === 'wizard' ? 37 : body.key === 'knight' ? 26 : t
      return <path d={`M38 ${cy}L36 ${cy - 12}L43 ${cy - 6}L50 ${cy - 14}L57 ${cy - 6}L64 ${cy - 12}L62 ${cy}Z`} fill="#E0B33A" />
    }
    if (x === 2) return <g><path d={`M${r + 1} ${body.eyeY + 36}L${r + 12} ${body.eyeY + 14}`} strokeWidth="3" /><path d={`M${r + 12} ${body.eyeY + 6}l2 5 5 .5-4 3.5 1.2 5-4.2-2.7-4.2 2.7 1.2-5-4-3.5 5-.5z`} fill="#E0B33A" strokeWidth="1.6" /></g>
    return null
  }
  return null
}

export default function Avatar({ a = {}, className = 'cr-avatar', title, theme: forced, ...rest }) {
  const ctx = useAvatarTheme()
  const theme = forced || themeOf(ctx, a)
  const colors = themeColors(theme)
  const fill = colors[a.c] ?? colors[0]
  const bodies = THEME_BODIES[theme]
  const body = bodies[a.b] ?? bodies[0]
  const eyes = AVATAR.eyes[a.e] ?? 'two'
  const mouth = AVATAR.mouths[a.m] ?? 'smile'
  const x = Number.isInteger(a.x) ? a.x : 0
  const mouthY = body.eyeY + (eyes === 'one' ? 20 : 17)

  return (
    <svg
      className={className}
      viewBox="0 0 100 112"
      {...rest}
      fill="none"
      stroke={INK}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* talaj-árnyék */}
      <ellipse cx="50" cy="106" rx="28" ry="3.5" fill="rgba(36,20,34,.12)" stroke="none" />
      <Extra theme={theme} x={x} body={body} fill={fill} layer="back" />
      {body.back?.(fill)}
      {/* lábak */}
      {body.legs !== false && <path d="M36 100v5h9v-5M55 100v5h9v-5" fill={fill} />}
      <path d={body.d} fill={fill} />
      {/* karocskák */}
      <path d={`M${body.w[0] + 3} ${body.eyeY + 22}C${body.w[0] - 6} ${body.eyeY + 28} ${body.w[0] - 6} ${body.eyeY + 34} ${body.w[0] + 1} ${body.eyeY + 38}`} />
      <path d={`M${body.w[1] - 3} ${body.eyeY + 22}C${body.w[1] + 6} ${body.eyeY + 28} ${body.w[1] + 6} ${body.eyeY + 34} ${body.w[1] - 1} ${body.eyeY + 38}`} />
      {body.front?.(fill)}
      <Extra theme={theme} x={x} body={body} fill={fill} layer="front" />
      {/* pír */}
      <circle cx="31" cy={mouthY - 2} r="4" fill="#F08A9B" stroke="none" opacity=".45" />
      <circle cx="69" cy={mouthY - 2} r="4" fill="#F08A9B" stroke="none" opacity=".45" />
      <Eyes kind={eyes} y={body.eyeY} />
      <Mouth kind={mouth} y={mouthY} />
    </svg>
  )
}

// Az egész osztályt jelképező „csoportkép”
const CREW = [
  { a: { c: 2, b: 0, e: 0, m: 1, x: 2 }, x: 0, y: 4, w: 56 },
  { a: { c: 4, b: 2, e: 1, m: 0, x: 0 }, x: 44, y: 0, w: 56 },
  { a: { c: 0, b: 1, e: 2, m: 2, x: 3 }, x: 20, y: 40, w: 62 },
]
export function ClassAvatar({ className = 'cr-avatar', theme }) {
  return (
    <svg className={className} viewBox="0 0 100 112" aria-hidden="true">
      {CREW.map((m, i) => (
        <Avatar key={i} a={m.a} theme={theme} className="" x={m.x} y={m.y} width={m.w} height={m.w * 1.12} />
      ))}
    </svg>
  )
}

// ── Class settings: az osztály avatar-stílusa ──
export function AvatarThemePicker({ value = 'monsters', onChange }) {
  const opts = [...AVATAR_THEMES.map((t) => ({ id: t.id, label: t.label })), { id: 'mixed', label: 'Mixed – each student picks' }]
  return (
    <div className="cr-themes" role="radiogroup" aria-label="Avatar style">
      {opts.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={`cr-theme ${value === o.id ? 'is-active' : ''}`} onClick={() => onChange(o.id)}>
          {o.id === 'mixed' ? (
            <svg className="cr-avatar" viewBox="0 0 100 112" aria-hidden="true">
              <Avatar a={{ c: 0, b: 0, e: 0, m: 0, x: 1 }} theme="fruits" className="" x={0} y={6} width={52} height={58} />
              <Avatar a={{ c: 2, b: 2, e: 1, m: 1, x: 0 }} theme="tales" className="" x={46} y={0} width={54} height={60} />
              <Avatar a={{ c: 4, b: 1, e: 0, m: 2, x: 2 }} theme="food" className="" x={22} y={44} width={58} height={64} />
            </svg>
          ) : <ClassAvatar theme={o.id} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  )
}
