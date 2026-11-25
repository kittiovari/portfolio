// Évszakos tájkép az Osztályterem aljára – vonalrajzos babszem-figurák és
// kis lények, az oldal illusztrációinak stílusában. Évszakváltáskor magától cserélődik.
//   tél: nov. 15. – febr. vége · tavasz: márc.–máj. · nyár: jún.–aug. · ősz: szept. 1. – nov. 14.

const INK = '#241422'

export function seasonOf(d = new Date()) {
  const m = d.getMonth() + 1
  const day = d.getDate()
  if (m === 12 || m <= 2 || (m === 11 && day >= 15)) return 'winter'
  if (m <= 5) return 'spring'
  if (m <= 8) return 'summer'
  return 'autumn'
}

// Babszem-test (cx: közép, base: talp, w/h: méret)
const beanD = (cx, base, w, h) => {
  const l = cx - w / 2, r = cx + w / 2, t = base - h
  return `M${l} ${base}C${l - 0.5} ${base - h * 0.6} ${l + w * 0.06} ${t + h * 0.12} ${cx} ${t}C${r - w * 0.06} ${t + h * 0.12} ${r + 0.5} ${base - h * 0.6} ${r} ${base}Z`
}
function Bean({ cx, base, w, h, fill, eyes = 'open', mouth = 'smile' }) {
  const ey = base - h * 0.62
  const dx = w * 0.17
  return (
    <g>
      <path d={beanD(cx, base, w, h)} fill={fill} />
      {eyes === 'closed'
        ? <path d={`M${cx - dx - 3} ${ey}q3 2.5 6 0M${cx + dx - 3} ${ey}q3 2.5 6 0`} />
        : <><circle cx={cx - dx} cy={ey} r="2" fill={INK} stroke="none" /><circle cx={cx + dx} cy={ey} r="2" fill={INK} stroke="none" /></>}
      <circle cx={cx - dx - 4} cy={ey + 7} r="3" fill="#F08A9B" stroke="none" opacity=".45" />
      <circle cx={cx + dx + 4} cy={ey + 7} r="3" fill="#F08A9B" stroke="none" opacity=".45" />
      {mouth === 'o'
        ? <ellipse cx={cx} cy={ey + 9} rx="2.2" ry="2.6" fill={INK} stroke="none" />
        : <path d={`M${cx - 5} ${ey + 7}q5 5 10 0`} />}
    </g>
  )
}

const Ground = ({ fill, d = 'M0 134C140 122 280 142 430 131S730 120 880 133S1080 124 1200 130V250H0Z' }) => <path d={d} fill={fill} />

// ── Tél ──
function Pine({ x, base, h }) {
  return (
    <g>
      <path d={`M${x} ${base}v8`} />
      <path d={`M${x} ${base - h}L${x - h * 0.3} ${base - h * 0.5}H${x - h * 0.16}L${x - h * 0.4} ${base}H${x + h * 0.4}L${x + h * 0.16} ${base - h * 0.5}H${x + h * 0.3}Z`} fill="#A9C9B4" />
      <path d={`M${x - h * 0.22} ${base - h * 0.52}q${h * 0.22} -6 ${h * 0.44} 0M${x - h * 0.32} ${base - 2}q${h * 0.32} -7 ${h * 0.64} 0`} stroke="#fff" strokeWidth="3" />
      <path d={`M${x} ${base - h}l-${h * 0.12} ${h * 0.16}h${h * 0.24}z`} fill="#fff" />
    </g>
  )
}
function Winter() {
  const flakes = [[60, 20], [180, 50], [260, 15], [380, 40], [470, 10], [610, 30], [700, 55], [820, 18], [930, 45], [1010, 12], [1110, 38], [1170, 60], [560, 70], [330, 80], [880, 85]]
  return (
    <>
      <g className="ss-snow">
        {flakes.map(([x, y], i) => (
          <g key={i} style={{ '--d': `${(i % 5) * 0.9}s`, '--x': `${x}px` }} className="ss-flake">
            <path d={`M${x} ${y - 4}v8M${x - 4} ${y}h8M${x - 3} ${y - 3}l6 6M${x + 3} ${y - 3}l-6 6`} strokeWidth="1.3" opacity=".55" />
          </g>
        ))}
      </g>
      <Pine x={70} base={130} h={86} /><Pine x={140} base={134} h={60} /><Pine x={1080} base={128} h={92} /><Pine x={1150} base={132} h={64} />
      <Ground fill="#FBF8F4" />
      {/* hóember-figura sállal és sapkával */}
      <g>
        <path d="M318 130l-22-14M362 130l22-16" />
        <Bean cx={340} base={136} w={46} h={58} fill="#fff" />
        <path d="M322 106q18 9 36 0l1 7q-19 9-38 0z" fill="#E07A72" />
        <path d="M352 112l4 16" stroke="#E07A72" strokeWidth="5" />
        <path d="M325 83q15-16 30 0z" fill="#6A4BC4" />
        <circle cx="340" cy="68" r="5" fill="#fff" />
        <path d="M338 95l10 2-10 2z" fill="#F2A283" />
      </g>
      {/* nyuszi */}
      <g>
        <path d="M512 104c-4-18-1-28 4-29 4 2 3 14 1 29M524 104c1-18 6-27 11-26 3 4-1 15-6 27" fill="#fff" />
        <Bean cx={522} base={134} w={30} h={34} fill="#fff" eyes="closed" />
        <circle cx="537" cy="128" r="5" fill="#fff" />
      </g>
      {/* kötött sapkás figura bögrével */}
      <g>
        <Bean cx={760} base={136} w={38} h={50} fill="#9FD3E8" />
        <path d="M742 93q18-22 36 0z" fill="#F7C873" /><circle cx="760" cy="72" r="5" fill="#F7C873" />
        <path d="M778 116h12v12h-12zM790 119q6 0 5 5-1 3-5 3" fill="#fff" />
        <path d="M782 112q2-4 0-7M786 112q2-4 0-7" strokeWidth="1.2" opacity=".6" />
      </g>
      {/* vörösbegy a karón */}
      <g>
        <path d="M955 134V96" strokeWidth="2.4" />
        <path d="M944 96q11-3 22 0" fill="#fff" />
        <path d="M942 90c2-12 22-14 26-2-3 6-21 7-26 2z" fill="#B08A6E" />
        <path d="M948 91c5-1 9 0 11 4-5 1-9 0-11-4z" fill="#E07A72" stroke="none" />
        <circle cx="962" cy="85" r="1.4" fill={INK} stroke="none" /><path d="M967 86l5 1-5 1" />
      </g>
      <g opacity=".45"><circle cx="600" cy="140" r="2" fill={INK} stroke="none" /><circle cx="612" cy="146" r="2" fill={INK} stroke="none" /><circle cx="626" cy="141" r="2" fill={INK} stroke="none" /><circle cx="639" cy="148" r="2" fill={INK} stroke="none" /></g>
    </>
  )
}

// ── Tavasz ──
const Tulip = ({ x, base, h, c }) => (
  <g>
    <path d={`M${x} ${base}V${base - h}`} /><path d={`M${x} ${base - 8}q-12-6-14-18q10 2 14 14`} fill="#A9D18E" />
    <path d={`M${x - 7} ${base - h}q0 -14 7 -16q7 2 7 16q-7 6 -14 0z`} fill={c} />
  </g>
)
function Spring() {
  return (
    <>
      <circle cx="1080" cy="38" r="20" fill="#FBE7A1" />
      <Ground fill="#D7EBC8" />
      {[[60, 136, 34, '#F4AFC4'], [90, 138, 26, '#F7C873'], [230, 134, 30, '#E07A72'], [880, 132, 32, '#C3B0EA'], [910, 134, 24, '#F4AFC4'], [1150, 132, 30, '#F7C873']].map(([x, b, h, c], i) => <Tulip key={i} x={x} base={b} h={h} c={c} />)}
      {/* locsoló figura */}
      <g>
        <Bean cx={420} base={136} w={40} h={52} fill="#F7C873" />
        <path d="M442 114h22l-4 18h-16z" fill="#8FD6C3" /><path d="M464 118l16-8" /><path d="M444 114q8-10 18 0" fill="none" />
        <g className="ss-drops" opacity=".6"><path d="M486 112v5M492 116v5M498 113v5" strokeWidth="1.4" stroke="#5B8DB8" /></g>
        <path d="M506 134q2-10 6-12M512 134q2-6 8-8" stroke="#4E9A6A" />
      </g>
      {/* pillangók */}
      {[[640, 60, '#C3B0EA'], [720, 40, '#F4AFC4']].map(([x, y, c], i) => (
        <g key={i} className="ss-flutter" style={{ '--d': `${i * 0.4}s` }}>
          <path d={`M${x} ${y}c-10-12-20-4-12 6 8 6 12 0 12-6zM${x} ${y}c10-12 20-4 12 6-8 6-12 0-12-6z`} fill={c} />
          <path d={`M${x} ${y - 6}v14`} />
        </g>
      ))}
      {/* katica a levélen */}
      <g><path d="M600 132q20-24 46-8q-24 18-46 8z" fill="#A9D18E" /><circle cx="624" cy="121" r="7" fill="#E07A72" /><path d="M624 114v14" /><circle cx="620" cy="119" r="1.3" fill={INK} stroke="none" /><circle cx="628" cy="124" r="1.3" fill={INK} stroke="none" /></g>
      {/* méhecske */}
      <g className="ss-flutter" style={{ '--d': '0.8s' }}><ellipse cx="300" cy="70" rx="10" ry="7" fill="#F7D569" /><path d="M297 64v12M303 64v12" /><path d="M296 63q-4-9 3-8M304 63q4-9-3-8" fill="#fff" /></g>
      <path d="M760 136q3-14 8-16M768 136q4-8 10-10" stroke="#4E9A6A" />
    </>
  )
}

// ── Nyár ──
const Sunflower = ({ x, base, h }) => (
  <g>
    <path d={`M${x} ${base}V${base - h}`} /><path d={`M${x} ${base - h * 0.4}q14-8 18 2q-12 6-18-2`} fill="#A9D18E" />
    <g>{Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={x} cy={base - h - 14} rx="4.5" ry="10" fill="#F7C873" transform={`rotate(${i * 36} ${x} ${base - h})`} />)}</g>
    <circle cx={x} cy={base - h} r="9" fill="#B08A6E" />
  </g>
)
function Summer() {
  return (
    <>
      <g className="ss-sun"><circle cx="1090" cy="44" r="22" fill="#F7D569" />
        {Array.from({ length: 10 }, (_, i) => <path key={i} d="M1090 10v-8" transform={`rotate(${i * 36} 1090 44)`} strokeWidth="2" />)}</g>
      <Ground fill="#CFE3B5" />
      <Sunflower x={80} base={136} h={70} /><Sunflower x={130} base={138} h={52} /><Sunflower x={1160} base={132} h={60} />
      {/* napszemüveges figura fagyival */}
      <g>
        <Bean cx={480} base={136} w={42} h={54} fill="#F4AFC4" />
        <path d="M466 102h11v6q-6 4-11 0zM483 102h11v6q-6 4-11 0zM477 104h6" fill={INK} />
        <path d="M500 118l8-20" /><path d="M502 100l12 6 4-12-12-5z" fill="#F2A283" /><circle cx="512" cy="92" r="7" fill="#fff" /><circle cx="506" cy="86" r="6" fill="#F4AFC4" />
      </g>
      {/* csiga */}
      <g><path d="M700 136h40q8 0 8-8" fill="#D7EBC8" /><circle cx="716" cy="124" r="12" fill="#F7C873" /><path d="M716 124m-6 0a6 6 0 1 1 6 6" /><path d="M744 128l4-10M738 128l-1-9" /></g>
      {/* szitakötő */}
      <g className="ss-flutter" style={{ '--d': '0.3s' }}><path d="M820 66h30" strokeWidth="2.2" /><ellipse cx="832" cy="60" rx="9" ry="4" fill="#C8E6F0" /><ellipse cx="832" cy="72" rx="9" ry="4" fill="#C8E6F0" /><circle cx="852" cy="66" r="3" fill="#8FD6C3" /></g>
      <path d="M300 136q4-16 10-18M310 136q4-10 12-12M600 136q3-12 9-14M960 136q4-14 10-16" stroke="#4E9A6A" />
    </>
  )
}

// ── Ősz ──
const Tree = ({ x, base, r, c }) => (
  <g>
    <path d={`M${x} ${base}V${base - r * 1.3}M${x} ${base - r * 0.8}l-9 -9M${x} ${base - r}l8 -7`} strokeWidth="2.4" />
    <circle cx={x - r * 0.55} cy={base - r * 1.45} r={r * 0.62} fill={c} />
    <circle cx={x + r * 0.55} cy={base - r * 1.45} r={r * 0.62} fill={c} />
    <circle cx={x} cy={base - r * 1.95} r={r * 0.72} fill={c} />
  </g>
)
function Autumn() {
  const leaves = [[200, 30, '#E0915A'], [380, 15, '#F7C873'], [560, 40, '#E07A72'], [690, 10, '#E0915A'], [860, 35, '#F7C873'], [990, 20, '#E07A72']]
  return (
    <>
      <Tree x={90} base={132} r={34} c="#F2A283" /><Tree x={1110} base={130} r={38} c="#F7C873" />
      <g>
        {leaves.map(([x, y, c], i) => (
          <path key={i} className="ss-leaf" style={{ '--d': `${i * 0.8}s` }} d={`M${x} ${y}q8-8 14 0q-6 8-14 0z`} fill={c} />
        ))}
      </g>
      <Ground fill="#EFD9B8" />
      {/* rókagomba és légyölő galóca */}
      <g><path d="M250 136q2-12 4-18" strokeWidth="5" stroke="#F7C873" /><path d="M236 118q18-14 36 0q-18 6-36 0z" fill="#F7C873" /></g>
      <g><path d="M290 136v-16" strokeWidth="6" stroke="#FBF6EC" /><path d="M276 122q14-20 28 0z" fill="#E07A72" /><circle cx="284" cy="116" r="1.8" fill="#fff" stroke="none" /><circle cx="294" cy="113" r="1.8" fill="#fff" stroke="none" /></g>
      {/* sün almával */}
      <g>
        <path d="M520 134c-4-24 34-34 50-12l8 4-8 8z" fill="#B08A6E" />
        <path d="M528 116l-4-6M538 110l-2-7M550 108l1-7M560 112l4-6" />
        <circle cx="572" cy="124" r="1.6" fill={INK} stroke="none" /><circle cx="580" cy="128" r="2" fill={INK} stroke="none" />
        <circle cx="540" cy="104" r="7" fill="#E07A72" /><path d="M540 97l2-4" />
      </g>
      {/* esernyős figura sállal */}
      <g>
        <Bean cx={800} base={136} w={40} h={52} fill="#C3B0EA" />
        <path d="M784 110q16 8 32 0l1 6q-17 8-34 0z" fill="#E0915A" />
        <path d="M820 120V70" /><path d="M790 72q30-30 60 0q-7-4-15 0q-7-5-15 0q-8-5-15 0q-8-4-15 0z" fill="#8FD6C3" />
      </g>
      <ellipse cx="660" cy="144" rx="26" ry="4" fill="#C8E6F0" />
      <path d="M380 136q6-6 12-2M970 138q6-6 12-2" stroke="#E0915A" />
    </>
  )
}

const SCENES = { winter: Winter, spring: Spring, summer: Summer, autumn: Autumn }

export default function SeasonScene({ season = seasonOf() }) {
  const Scene = SCENES[season] || Winter
  return (
    <div className={`season season--${season}`} aria-hidden="true">
      <svg viewBox="0 0 1200 240" preserveAspectRatio="xMidYMax slice" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Scene />
      </svg>
    </div>
  )
}
