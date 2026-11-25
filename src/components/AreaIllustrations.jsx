// Vonalrajzos jelenetek a három területhez, a portfólió „thinking”
// karaktereinek stílusában: babszem alakú figurák, hullámos hajszálak,
// egyszerű arc, vastag, lekerekített vonal. Mind currentColor-t használ.
// Az „a-…” osztályú részek animálódnak (lásd AreaIllustrations.css):
// a csempén hoverre / kijelölésre, a jelszómodalban folyamatosan.
import './AreaIllustrations.css'

const common = {
  viewBox: '0 0 200 160',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const dot = { fill: 'currentColor', stroke: 'none' }
const label = {
  fill: 'currentColor',
  stroke: 'none',
  fontFamily: "'Outfit', 'Inter', sans-serif",
  fontWeight: 700,
  textAnchor: 'middle',
}
const delay = (s) => ({ style: { '--d': `${s}s` } })

// Nyelvoktatás: kontyos tanár „Hello!”-val, a kis diák jelentkezik: „¡Hola!”
function LanguageArt(props) {
  return (
    <svg {...common} {...props}>
      {/* talaj */}
      <path d="M8 156H192" opacity=".5" />

      {/* tanár */}
      <path d="M24 156C20 118 24 74 46 58C60 48 82 50 92 64C102 80 100 118 102 156" />
      <circle cx="64" cy="44.5" r="7.5" />
      <path d="M50 86q4-4 8 0M70 86q4-4 8 0" />
      <path d="M56 98q8 7 16 0" />
      {/* magyarázó kar – integet */}
      <g className="a-wave">
        <path d="M100 106C108 102 114 96 119 89M101 119C110 114 118 105 125 96" />
        <path d="M118 89q1-8 9-7q7 2 3 10q-2 3-5 4" />
      </g>

      {/* nagy buborék */}
      <g className="a-pop">
        <path d="M120 8h58a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8h-40l-10 9 1-9h-9a8 8 0 0 1-8-8V16a8 8 0 0 1 8-8z" />
        <text x="149" y="30.5" fontSize="15" {...label}>Hello!</text>
      </g>

      {/* diák */}
      <path d="M134 156C132 132 136 110 150 102C162 96 176 100 182 114C187 127 186 142 188 156" />
      <path d="M156 100c-3-5 2-8-1-14M163 99c0-6 4-7 3-13M169 101c3-4 6-5 9-9" />
      <circle cx="153" cy="124" r="1.9" {...dot} />
      <circle cx="167" cy="124" r="1.9" {...dot} />
      <circle cx="160" cy="133" r="2.6" />
      {/* jelentkező kar – lelkesen nyújtózik */}
      <g className="a-raise">
        <path d="M185 120C189 111 190 104 190 97M188 131C193 120 196 109 196 98" />
        <circle cx="193" cy="92" r="5" />
      </g>

      {/* kis buborék */}
      <g className="a-pop" {...delay(0.45)}>
        <path d="M140 56h34a7 7 0 0 1 7 7v10a7 7 0 0 1-7 7h-18l-6 7v-7h-10a7 7 0 0 1-7-7V63a7 7 0 0 1 7-7z" />
        <text x="157" y="72" fontSize="11.5" {...label}>¡Hola!</text>
      </g>
    </svg>
  )
}

// Babszem alakú figura körvonala (cx: közép, base: alja, w/h: méret)
const r1 = (n) => Math.round(n * 10) / 10
function bean(cx, base, w, h) {
  const l = cx - w / 2
  const r = cx + w / 2
  const t = base - h
  return `M${r1(l)} ${base}` +
    `C${r1(l - 0.5)} ${r1(base - h * 0.55)} ${r1(l + w * 0.02)} ${r1(t + h * 0.25)} ${r1(cx - w * 0.18)} ${r1(t + h * 0.05)}` +
    `C${r1(cx - w * 0.02)} ${r1(t - h * 0.02)} ${r1(cx + w * 0.24)} ${r1(t + h * 0.02)} ${r1(cx + w * 0.34)} ${r1(t + h * 0.2)}` +
    `C${r1(r + 0.5)} ${r1(t + h * 0.4)} ${r1(r)} ${r1(base - h * 0.45)} ${r1(r + 0.5)} ${base}`
}

// Asztal mögött ülő, szemből látszó résztvevők (a vezető középen külön)
const backRow = [
  { cx: 24, hair: 'bun', face: 'calm' },
  { cx: 60, hair: 'wisp', face: 'smile' },
  { cx: 140, hair: 'bun', face: 'smile' },
  { cx: 176, hair: 'wisp', face: 'calm' },
]
// Asztal előtt ülő, háttal látszó résztvevők
const frontRow = [
  { cx: 22, hair: 'wisp' },
  { cx: 61, hair: 'bun' },
  { cx: 100, hair: 'wisp' },
  { cx: 139, hair: 'bun' },
  { cx: 178, hair: 'wisp' },
]

function Hair({ cx, top, type, small }) {
  if (type === 'bun') return <circle cx={cx + 1} cy={top - (small ? 2.4 : 3)} r={small ? 2.6 : 3.6} />
  return small
    ? <path d={`M${cx - 2} ${top + 1}c-1-2 1-3 0-5M${cx + 3} ${top + 1}c0-2 2-3 2-5`} />
    : <path d={`M${cx - 3} ${top + 1}c-2-4 1-6-1-10M${cx + 2} ${top}c0-4 3-5 3-9M${cx + 6} ${top + 2}c2-3 4-4 6-6`} />
}

// Kis virág: öt szirom egy pötty körül
function Flower({ x, y, r = 1.7 }) {
  const petals = [0, 72, 144, 216, 288].map((deg) => {
    const a = ((deg - 90) * Math.PI) / 180
    return <circle key={deg} cx={r1(x + Math.cos(a) * r * 1.35)} cy={r1(y + Math.sin(a) * r * 1.35)} r={r} />
  })
  return (
    <g strokeWidth="1.1">
      {petals}
      <circle cx={x} cy={y} r={r * 0.55} {...dot} />
    </g>
  )
}

// Antalfai művészetterápia: 9 résztvevő és a vezető együtt ül az asztal körül.
// A vezető középen, virágkoszorúval, csukott szemmel, nyugodtan egymásra tett
// kézzel; a többiek agyagoznak, festenek, a levegőben hangjegyek – szól a zene.
function ArtTherapyArt(props) {
  const bh = 36 // hátsó sor magassága
  const bBase = 108 // hátsó sor alja = asztal hátsó éle
  const top = bBase - bh
  const ey = top + 14
  return (
    <svg {...common} {...props}>
      <g strokeWidth="1.8">
        {/* hangjegyek – lebegnek */}
        <g className="a-note">
          <path d="M44 34v-12l12-3v12" />
          <ellipse cx="41.5" cy="34.5" rx="3" ry="2.2" />
          <ellipse cx="53.5" cy="31.5" rx="3" ry="2.2" />
        </g>
        <g className="a-note" {...delay(0.6)}>
          <path d="M152 30v-11" />
          <ellipse cx="149.5" cy="30.5" rx="3" ry="2.2" />
          <path d="M152 19q5 2 5 7" />
        </g>
        <g className="a-note" {...delay(1.1)}>
          <path d="M178 44v-9" />
          <ellipse cx="175.8" cy="44.4" rx="2.6" ry="1.9" />
        </g>
        <g className="a-note" {...delay(0.3)}>
          <path d="M18 42v-9" />
          <ellipse cx="15.8" cy="42.4" rx="2.6" ry="1.9" />
        </g>
        <path className="a-flow" d="M62 24q6-6 12 0M128 26q6-5 12 0M26 30q5-5 10 0M162 34q5-4 9 0" opacity=".5" />

        {/* hátsó sor: 4 résztvevő szemből */}
        {backRow.map((p) => (
          <g key={p.cx}>
            <path d={bean(p.cx, bBase, 24, bh)} />
            <Hair cx={p.cx} top={top} type={p.hair} />
            {p.face === 'calm'
              ? <path d={`M${p.cx - 7} ${ey}q2.5 2.5 5 0M${p.cx + 2} ${ey}q2.5 2.5 5 0`} />
              : <>
                  <circle cx={p.cx - 4} cy={ey} r="1.3" {...dot} />
                  <circle cx={p.cx + 4} cy={ey} r="1.3" {...dot} />
                </>}
            <path d={`M${p.cx - 3} ${ey + 7}q3 3 6 0`} />
          </g>
        ))}

        {/* a vezető: középen ül, virágkoszorú, csukott szem, békés mosoly */}
        <path className="a-aura" d="M84 80q-6-10 3-19M116 80q6-10-3-19" opacity=".35" />
        <path d={bean(100, bBase, 26, 39)} />
        <g className="a-sway">
          <Flower x={90.5} y={72} />
          <Flower x={100} y={68} r={2} />
          <Flower x={109.5} y={72} />
        </g>
        <path d="M92 84q2.5 2.5 5 0M103 84q2.5 2.5 5 0" />
        <path d="M96 91q4 3.5 8 0" />

        {/* asztal */}
        <path d="M6 108H194L199 124H1Z" />
        <path d="M4 124v28M196 124v28" />

        {/* agyagozás – a kezek formázzák az edényt */}
        <path d="M19 120q-2-7 5-8q7 1 5 8z M20 112.5h8" />
        <g className="a-knead">
          <circle cx="16.5" cy="116" r="2.4" />
          <circle cx="31.5" cy="116" r="2.4" />
        </g>
        {/* festés – ecsetvonások */}
        <path d="M49 121l15-2l-1-8l-15 2z" />
        <path d="M51 117q3-3 5 0t6-1" />
        <g className="a-brush">
          <circle cx="68" cy="113" r="2.4" />
          <path d="M66.5 114.5l-5 4" />
        </g>
        {/* a vezető nyugodtan egymásra tett keze */}
        <ellipse cx="97.5" cy="114" rx="3.2" ry="2.4" />
        <ellipse cx="102.5" cy="114.6" rx="3.2" ry="2.4" />
        {/* agyagozás */}
        <path d="M135 120q-2-7 5-8q7 1 5 8z M136 116q5 2 9 0" />
        <g className="a-knead" {...delay(0.35)}>
          <circle cx="131.5" cy="116" r="2.4" />
          <circle cx="148.5" cy="116" r="2.4" />
        </g>
        {/* festés */}
        <path d="M165 121l15-1l-1-8l-15 1z" />
        <circle cx="172" cy="116.5" r="2.2" />
        <g className="a-brush" {...delay(0.4)}>
          <circle cx="184" cy="113" r="2.4" />
          <path d="M182.5 114.5l-5 3.5" />
        </g>

        {/* első sor: 5 résztvevő háttal */}
        {frontRow.map((p) => (
          <g key={p.cx}>
            <path d={bean(p.cx, 157, 28, 24)} />
            <Hair cx={p.cx} top={133} type={p.hair} small />
          </g>
        ))}
      </g>
    </svg>
  )
}

// UX/UI design: töprengő figura kérdőjelekkel; laptopon drótváz,
// a falon post-itek és egy folyamatskicc, az asztalon papírskicc ceruzával.
function UXArt(props) {
  return (
    <svg {...common} {...props}>
      <g strokeWidth="2">
        {/* kérdőjelek – fel-le billegnek */}
        <g className="a-q"><text x="22" y="44" fontSize="20" {...label} transform="rotate(-10 22 44)">?</text></g>
        <g className="a-q" {...delay(0.35)}><text x="46" y="28" fontSize="14" {...label} transform="rotate(8 46 28)">?</text></g>
        <g className="a-q" {...delay(0.7)}><text x="66" y="48" fontSize="11" {...label}>?</text></g>

        {/* post-itek a falon – lengenek */}
        <g className="a-swing">
          <g transform="rotate(-6 106 24)">
            <rect x="96" y="14" width="20" height="20" rx="1.5" />
            <path d="M100 21h12M100 26h8" opacity=".6" />
          </g>
        </g>
        <g className="a-swing" {...delay(0.5)}>
          <g transform="rotate(5 132 20)">
            <rect x="122" y="10" width="20" height="20" rx="1.5" />
            <path d="M126 17h12M126 22h9" opacity=".6" />
          </g>
        </g>
        <g className="a-swing" {...delay(0.25)}>
          <g transform="rotate(-3 110 50)">
            <rect x="100" y="40" width="20" height="20" rx="1.5" />
            <path d="M104 47h12M104 52h7" opacity=".6" />
          </g>
        </g>

        {/* folyamatskicc a falon – a nyilak „kirajzolódnak” */}
        <rect x="150" y="12" width="42" height="48" rx="2" />
        <rect x="156" y="18" width="12" height="9" rx="1.5" />
        <rect x="174" y="30" width="12" height="9" rx="1.5" />
        <rect x="156" y="44" width="12" height="9" rx="1.5" />
        <path className="a-draw" d="M168 23q8 0 9 6M174 37q-8 2-9 6" opacity=".7" />

        {/* asztal */}
        <path d="M76 130H198" />
        <path d="M84 130v26M190 130v26" />

        {/* laptop drótvázzal */}
        <rect x="92" y="78" width="64" height="46" rx="4" />
        <path d="M86 124h76l-4 6H90z" />
        <path d="M98 85h22" opacity=".7" />
        <rect x="98" y="90" width="22" height="17" rx="2" />
        <path d="M98 90l22 17M120 90l-22 17" opacity=".45" />
        <path className="a-type" d="M125 92h24M125 98h18M125 104h22" opacity=".7" />
        <rect className="a-pulse" x="98" y="111" width="18" height="7" rx="3.5" />

        {/* papírskicc + ceruza */}
        <path d="M164 128l28-3l-2.5-22l-28 3z" />
        <rect x="168" y="108" width="9" height="14" rx="2" transform="rotate(-6 172 115)" />
        <path d="M180 112q3-2 6 0M180 117h6M180 121h4" opacity=".7" />
        <path className="a-pencil" d="M150 128l10-12l3 2.5l-10 12z" />

        {/* töprengő figura, kéz az állán – ütögeti */}
        <path d={bean(40, 156, 54, 88)} />
        <path d="M30 70c-3-6 2-9-1-15M38 68c0-6 5-8 4-14M45 70c3-5 8-6 10-11" />
        <path d="M27 88q4-3 8 0M45 87q4-3 8 0" />
        <circle cx="32" cy="95" r="1.9" {...dot} />
        <circle cx="50" cy="94" r="1.9" {...dot} />
        <path d="M34 107q3-2 6 0t6 0" />
        <g className="a-tap">
          <path d="M66 136C64 126 60 119 54 114M58 140C56 130 52 122 46 117" />
          <circle cx="50" cy="113" r="5" />
        </g>
      </g>
    </svg>
  )
}

// ── Nyelvoktatás profilválasztó: kör alakú ikonok (négyzetes vászon) ──
const profileCommon = { ...common, viewBox: '0 0 120 120' }

// NYEK9B: lapos olasz sapkás (coppola) babszem-figura, aki egy tányér
// spagettiből éppen egy hosszú szálat szippant be; kezében feltekert villa
function SpaghettiArt(props) {
  return (
    <svg {...profileCommon} {...props}>
      <defs>
        {/* a fej teteje a sapka alatt ne látsszon */}
        <clipPath id="nyek9b-under-cap">
          <rect x="0" y="37" width="120" height="90" />
        </clipPath>
      </defs>
      <g strokeWidth="2.2">
        {/* figura a tányér mögött, a fej teteje a sapka alá bújik */}
        <path d={bean(60, 104, 56, 80)} clipPath="url(#nyek9b-under-cap)" />

        {/* olasz lapos sapka (coppola): lapos, előre dőlő tető, ellenző, gomb */}
        <path d="M32 38C31 31 42 25 58 24C75 23 88 28 89 35C89 37 88 38 87 38" />
        <path d="M32 38C46 35 74 35 87 38" />
        <path d="M41 38C47 46 72 46 79 38" />
        <circle cx="60" cy="24" r="1.8" {...dot} />

        {/* élvezettől csukott szem, kipirult arc */}
        <path d="M43 53q4.5 3.5 9 0M68 53q4.5 3.5 9 0" />
        <path d="M39 62q2.5 2 5 0M76 62q2.5 2 5 0" opacity=".5" />
        {/* csücsörítő, szürcsölő száj */}
        <ellipse cx="60" cy="67" rx="3.4" ry="3" />

        {/* a beszippantott hosszú spagettiszál – kijelöléskor felfelé kúszik */}
        <g className="a-slurp" strokeWidth="1.8">
          <path d="M60 70C55 74 64 78 59.5 82.5C55 87 64 90 60 93" />
        </g>

        {/* villa a jobb kézben, feltekert tésztával */}
        <g className="a-bob">
          <path d="M87 72C92 77 92 84 88 88" />
          <circle cx="86" cy="91" r="4" />
          <path d="M83 94L75.5 99" />
          <g strokeWidth="1.6">
            <path d="M69 96q5-3.5 7.5 1q-5 3.5-7.5-1M69 99q5-3 7.5 1" />
          </g>
        </g>

        {/* tányér */}
        <ellipse cx="58" cy="110" rx="32" ry="6.5" />
        <ellipse cx="58" cy="109" rx="23" ry="3.8" opacity=".4" />

        {/* bőséges spagettikupac: magas halom, hosszú, vékony, hullámzó szálak */}
        <path d="M33 107C33 97 41 92 47 95C49 87 58 86 63 91C67 86 76 88 77 94C82 92 87 98 85 107" />
        <g strokeWidth="1.5">
          <path d="M36 104C40 99 44 103 48 99S56 101 60 97S68 100 72 96S80 100 82 103" />
          <path d="M39 100C43 95 47 99 51 95S59 97 63 93S71 95 75 93" opacity=".8" />
          <path d="M44 96C47 92 51 95 54 92S60 93 63 90" opacity=".7" />
          {/* a tányér széléről lelógó szálak */}
          <path d="M35 106C31 108 33 111 29.5 114M84 106C88 108 86 111 89.5 114M46 108C45 111 47 113 45 116M70 108C71 111 69 113 71 116" />
        </g>
        {/* húsgombócok */}
        <circle cx="69" cy="92" r="3.2" />
        <circle cx="48.5" cy="97.5" r="2.6" />
      </g>
    </svg>
  )
}

// NYEK9D: salsát táncoló figura fodros ruhában, legyezővel, virággal a hajában
function SalsaDancerArt(props) {
  return (
    <svg {...profileCommon} {...props}>
      <g strokeWidth="2.2">
        {/* felemelt, ívelt kar */}
        <g className="a-raise">
          <path d="M72 54C82 46 86 34 80 22M73 63C88 52 94 34 85 18" />
          <circle cx="82" cy="17" r="3.6" />
        </g>
        {/* fej + felsőtest (babszem) */}
        <path d="M44 80C42 62 43 44 51 35C56 29 66 29 70 35C76 44 76 62 74 80" />
        <circle cx="62" cy="28" r="4.6" />
        <g className="a-sway">
          <Flower x={46} y={38} r={2.2} />
        </g>
        <path d="M52 50q2.5 2.5 5 0M63 50q2.5 2.5 5 0" />
        <path d="M56 58q4 3.5 8 0" />
        {/* fodros szoknya */}
        <g className="a-ruffle">
          <path d="M44 78C38 90 30 102 22 112M74 78C80 90 88 102 96 112" />
          <path d="M22 112q6-5 12 0t12 0t12 0t12 0t12 0t12 0" />
          <path d="M33 98q5-4 10 0t10 0t10 0t10 0t10 0" opacity=".7" />
          <path d="M40 87q4-3 8 0t8 0t8 0t8 0" opacity=".55" />
        </g>
        {/* legyező a másik kézben */}
        <path d="M45 62C38 66 33 70 30 74" />
        <g className="a-fan">
          <path d="M30 74L14 62A20 20 0 0 1 36 54Z" />
          <path d="M30 74L20 57M30 74L27 54" opacity=".6" />
        </g>
        <circle cx="30" cy="74" r="3.2" />
      </g>
    </svg>
  )
}

export const profileArt = {
  'language-9b': SpaghettiArt,
  'language-9d': SalsaDancerArt,
}

export const areaArt = {
  language: LanguageArt,
  arttherapy: ArtTherapyArt,
  ux: UXArt,
  teacher: LanguageArt,
}
