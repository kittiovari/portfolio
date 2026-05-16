const W = 22
const H = 15
const R = 2.5
const S = 1.2

function FlagHU() {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" aria-hidden="true">
      <defs>
        <clipPath id="c-hu">
          <rect x="0.6" y="0.6" width={W - 1.2} height={H - 1.2} rx={R} />
        </clipPath>
      </defs>
      <rect x="0.6" y="0.6" width={W - 1.2} height={H - 1.2} rx={R}
        stroke="currentColor" strokeWidth={S} />
      <g clipPath="url(#c-hu)">
        <line x1="0" y1={H / 3} x2={W} y2={H / 3} stroke="currentColor" strokeWidth="0.9" />
        <line x1="0" y1={(H / 3) * 2} x2={W} y2={(H / 3) * 2} stroke="currentColor" strokeWidth="0.9" />
      </g>
    </svg>
  )
}

function FlagGB() {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" aria-hidden="true">
      <defs>
        <clipPath id="c-gb">
          <rect x="0.6" y="0.6" width={W - 1.2} height={H - 1.2} rx={R} />
        </clipPath>
      </defs>
      <rect x="0.6" y="0.6" width={W - 1.2} height={H - 1.2} rx={R}
        stroke="currentColor" strokeWidth={S} />
      <g clipPath="url(#c-gb)" opacity="0.9">
        <line x1="0" y1="0" x2={W} y2={H} stroke="currentColor" strokeWidth="1" />
        <line x1={W} y1="0" x2="0" y2={H} stroke="currentColor" strokeWidth="1" />
        <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="currentColor" strokeWidth="1.4" />
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="currentColor" strokeWidth="1.4" />
      </g>
    </svg>
  )
}

function FlagES() {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" aria-hidden="true">
      <defs>
        <clipPath id="c-es">
          <rect x="0.6" y="0.6" width={W - 1.2} height={H - 1.2} rx={R} />
        </clipPath>
      </defs>
      <rect x="0.6" y="0.6" width={W - 1.2} height={H - 1.2} rx={R}
        stroke="currentColor" strokeWidth={S} />
      <g clipPath="url(#c-es)">
        <line x1="0" y1={H * 0.27} x2={W} y2={H * 0.27} stroke="currentColor" strokeWidth="0.9" />
        <line x1="0" y1={H * 0.73} x2={W} y2={H * 0.73} stroke="currentColor" strokeWidth="0.9" />
      </g>
    </svg>
  )
}

const flags = { HU: FlagHU, GB: FlagGB, ES: FlagES }

export default function Flag({ code }) {
  const Component = flags[code]
  return Component ? <Component /> : null
}
