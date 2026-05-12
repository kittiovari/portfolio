const W = 20
const H = 14
const R = 3

function clip(id) {
  return (
    <clipPath id={id}>
      <rect width={W} height={H} rx={R} ry={R} />
    </clipPath>
  )
}

function FlagHU() {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <defs>{clip('c-hu')}</defs>
      <g clipPath="url(#c-hu)">
        <rect width={W} height={H / 3} fill="#CE2939" />
        <rect y={H / 3} width={W} height={H / 3} fill="#FFFFFF" />
        <rect y={(H / 3) * 2} width={W} height={H / 3} fill="#477050" />
      </g>
    </svg>
  )
}

function FlagGB() {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <defs>{clip('c-gb')}</defs>
      <g clipPath="url(#c-gb)">
        <rect width={W} height={H} fill="#012169" />
        {/* X diagonals white */}
        <line x1="0" y1="0" x2={W} y2={H} stroke="white" strokeWidth="3.5" />
        <line x1={W} y1="0" x2="0" y2={H} stroke="white" strokeWidth="3.5" />
        {/* X diagonals red */}
        <line x1="0" y1="0" x2={W} y2={H} stroke="#C8102E" strokeWidth="2" />
        <line x1={W} y1="0" x2="0" y2={H} stroke="#C8102E" strokeWidth="2" />
        {/* + cross white */}
        <rect x={(W - 4) / 2} y="0" width="4" height={H} fill="white" />
        <rect x="0" y={(H - 4) / 2} width={W} height="4" fill="white" />
        {/* + cross red */}
        <rect x={(W - 2.5) / 2} y="0" width="2.5" height={H} fill="#C8102E" />
        <rect x="0" y={(H - 2.5) / 2} width={W} height="2.5" fill="#C8102E" />
      </g>
    </svg>
  )
}

function FlagES() {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <defs>{clip('c-es')}</defs>
      <g clipPath="url(#c-es)">
        <rect width={W} height={H} fill="#AA151B" />
        <rect y={H * 0.25} width={W} height={H * 0.5} fill="#F1BF00" />
      </g>
    </svg>
  )
}

const flags = { HU: FlagHU, GB: FlagGB, ES: FlagES }

export default function Flag({ code }) {
  const Component = flags[code]
  return Component ? <Component /> : null
}
