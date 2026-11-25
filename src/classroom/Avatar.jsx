import { AVATAR } from './model.js'

// Saját, vonalrajzos szörnyecske-avatar (a Kittipedia illusztrációinak stílusában).
// a = { c: szín, b: test, e: szem, m: száj, x: kiegészítő } – mind index.
const INK = '#241422'

const BODY = {
  bean: { d: 'M24 100C20 64 24 26 50 22C76 26 80 64 76 100Z', top: 22, eyeY: 50, w: [24, 76] },
  round: { d: 'M50 32C78 32 87 56 85 77C83 97 69 102 50 102C31 102 17 97 15 77C13 56 22 32 50 32Z', top: 32, eyeY: 58, w: [15, 85] },
  tall: { d: 'M30 100C27 68 30 36 50 16C70 36 73 68 70 100Z', top: 16, eyeY: 50, w: [30, 70] },
}

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

function Extra({ kind, body, fill }) {
  const t = body.top
  if (kind === 'horns') {
    return (
      <g fill="#FBF6EC">
        <path d={`M38 ${t + 8}C33 ${t - 2} 34 ${t - 9} 37 ${t - 12}C40 ${t - 6} 43 ${t} 45 ${t + 4}`} />
        <path d={`M62 ${t + 8}C67 ${t - 2} 66 ${t - 9} 63 ${t - 12}C60 ${t - 6} 57 ${t} 55 ${t + 4}`} />
      </g>
    )
  }
  if (kind === 'antenna') {
    return (
      <g>
        <path d={`M50 ${t + 2}C49 ${t - 6} 53 ${t - 9} 55 ${t - 13}`} fill="none" />
        <circle cx="56" cy={t - 15} r="3.6" fill={fill} />
      </g>
    )
  }
  if (kind === 'ears') {
    const y = body.eyeY - 6
    return (
      <g fill={fill}>
        <path d={`M${body.w[0] + 4} ${y}C${body.w[0] - 12} ${y - 10} ${body.w[0] - 14} ${y + 6} ${body.w[0] + 2} ${y + 12}`} />
        <path d={`M${body.w[1] - 4} ${y}C${body.w[1] + 12} ${y - 10} ${body.w[1] + 14} ${y + 6} ${body.w[1] - 2} ${y + 12}`} />
      </g>
    )
  }
  return null
}

export default function Avatar({ a = {}, className = 'cr-avatar', title, ...rest }) {
  const fill = AVATAR.colors[a.c] ?? AVATAR.colors[0]
  const body = BODY[AVATAR.bodies[a.b]] ?? BODY.bean
  const eyes = AVATAR.eyes[a.e] ?? 'two'
  const mouth = AVATAR.mouths[a.m] ?? 'smile'
  const extra = AVATAR.extras[a.x] ?? 'none'
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
      {extra === 'ears' && <Extra kind="ears" body={body} fill={fill} />}
      {/* lábak */}
      <path d="M36 100v5h9v-5M55 100v5h9v-5" fill={fill} />
      <path d={body.d} fill={fill} />
      {/* karocskák */}
      <path d={`M${body.w[0] + 3} ${body.eyeY + 22}C${body.w[0] - 6} ${body.eyeY + 28} ${body.w[0] - 6} ${body.eyeY + 34} ${body.w[0] + 1} ${body.eyeY + 38}`} />
      <path d={`M${body.w[1] - 3} ${body.eyeY + 22}C${body.w[1] + 6} ${body.eyeY + 28} ${body.w[1] + 6} ${body.eyeY + 34} ${body.w[1] - 1} ${body.eyeY + 38}`} />
      {extra !== 'ears' && <Extra kind={extra} body={body} fill={fill} />}
      {/* pocak */}
      <path d={`M40 ${body.eyeY + 34}Q50 ${body.eyeY + 40} 60 ${body.eyeY + 34}`} opacity=".35" />
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
export function ClassAvatar({ className = 'cr-avatar' }) {
  return (
    <svg className={className} viewBox="0 0 100 112" aria-hidden="true">
      {CREW.map((m, i) => (
        <Avatar key={i} a={m.a} className="" x={m.x} y={m.y} width={m.w} height={m.w * 1.12} />
      ))}
    </svg>
  )
}
