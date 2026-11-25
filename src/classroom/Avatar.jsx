import { createContext, useContext } from 'react'
import { AVATAR } from './model.js'

// Saját, vonalrajzos avatarok (a Kittipedia illusztrációinak stílusában).
// a = { c: szín, b: test, e: szem, m: száj, x: kiegészítő, t?: stílus } – mind index.
// Családok (osztályonként választható): szörnyecskék, állatok, gyümölcsök-zöldségek,
// ételek-italok, mesevilág – vagy „vegyes”, ahol mindenki maga választ.
// Minden családban 10 test, 4 kiegészítő és 8 szín; az arc (6 szem, 6 száj, pír,
// karocskák) közös → egy diák avatarja családváltáskor a „párjára” vált.
const INK = '#241422'
const CREAM = '#FBF6EC'
const LEAF = '#7FA88A'
const GOLD = '#E0B33A'
const PINK = '#F2A7B6'

// gyakori testformák
const ROUND = { d: 'M50 32C78 32 87 56 85 77C83 97 69 102 50 102C31 102 17 97 15 77C13 56 22 32 50 32Z', top: 32, eyeY: 58, w: [15, 85] }
const BEAN = { d: 'M24 100C20 64 24 26 50 22C76 26 80 64 76 100Z', top: 22, eyeY: 50, w: [24, 76] }
const TALL = { d: 'M30 100C27 68 30 36 50 16C70 36 73 68 70 100Z', top: 16, eyeY: 50, w: [30, 70] }
const whiskers = (y) => <path d={`M22 ${y}h-12M23 ${y + 5}l-11 3M78 ${y}h12M77 ${y + 5}l11 3`} strokeWidth="1.6" />

// ── testek családonként: d = körvonal, top / eyeY / w = arc- és kar-elhelyezés,
//    back / front = a test mögé / elé rajzolt részletek, legs = vannak-e lábak ──
const THEME_BODIES = {
  monsters: [
    { key: 'bean', ...BEAN },
    { key: 'round', ...ROUND },
    { key: 'tall', ...TALL },
    { key: 'ghost', d: 'M22 104V54C22 34 34 22 50 22C66 22 78 34 78 54V104L70 97L62 104L54 97L46 104L38 97L30 104Z', top: 22, eyeY: 50, w: [22, 78], legs: false },
    { key: 'block', d: 'M22 34Q22 26 30 26H70Q78 26 78 34V96Q78 102 72 102H28Q22 102 22 96Z', top: 26, eyeY: 52, w: [22, 78] },
    {
      key: 'octopus', d: 'M50 20C74 20 84 40 82 60C80 74 70 80 50 80C30 80 20 74 18 60C16 40 26 20 50 20Z', top: 20, eyeY: 46, w: [18, 82], legs: false,
      back: (f) => <g fill={f}><path d="M24 70C16 84 12 96 20 100C26 92 28 84 32 76Z" /><path d="M38 76C34 90 34 100 42 102C44 92 44 84 46 78Z" /><path d="M62 76C66 90 66 100 58 102C56 92 56 84 54 78Z" /><path d="M76 70C84 84 88 96 80 100C74 92 72 84 68 76Z" /></g>,
    },
    { key: 'fluffy', d: 'M50 26C56 20 66 22 68 30C76 28 82 36 80 44C88 48 88 60 82 64C88 70 86 82 78 84C80 94 70 100 62 96C58 104 42 104 38 96C30 100 20 94 22 84C14 82 12 70 18 64C12 60 12 48 20 44C18 36 24 28 32 30C34 22 44 20 50 26Z', top: 22, eyeY: 56, w: [16, 84] },
    { key: 'twin', d: 'M24 100C20 70 20 40 30 22C36 32 44 34 50 34C56 34 64 32 70 22C80 40 80 70 76 100Z', top: 22, eyeY: 54, w: [23, 77] },
    { key: 'drop', d: 'M50 14C62 34 80 52 80 74C80 92 66 102 50 102C34 102 20 92 20 74C20 52 38 34 50 14Z', top: 14, eyeY: 62, w: [20, 80] },
    { key: 'wide', d: 'M10 100C8 72 20 50 50 48C80 50 92 72 90 100Z', top: 48, eyeY: 70, w: [12, 88] },
  ],
  animals: [
    {
      key: 'fox', ...BEAN,
      back: (f) => <g fill={f}><path d="M30 38L24 10L46 28Z" /><path d="M70 38L76 10L54 28Z" /><path d="M74 92C94 92 98 70 90 58C88 76 82 84 72 86Z" /><path d="M90 58C94 64 95 70 93 76C90 72 88 66 90 58Z" fill={CREAM} /></g>,
      front: () => <><path d="M30 30L28 18L38 26Z" fill={PINK} strokeWidth="1.4" /><path d="M70 30L72 18L62 26Z" fill={PINK} strokeWidth="1.4" /><path d="M30 60Q50 86 70 60Q62 76 50 76Q38 76 30 60Z" fill={CREAM} strokeWidth="1.6" /></>,
    },
    {
      key: 'dino', ...ROUND,
      back: (f) => <g fill={f}><path d="M80 84C96 86 100 76 100 66C94 74 88 76 82 74Z" /></g>,
      front: () => <><path d="M30 40l5-12 5 9M44 34l6-13 6 13M60 37l5-9 5 12" fill={GOLD} strokeWidth="1.8" /><path d="M34 82Q50 96 66 82" opacity=".3" /></>,
    },
    {
      key: 'cat', ...ROUND,
      back: (f) => <g fill={f}><path d="M22 50L20 24L42 38Z" /><path d="M78 50L80 24L58 38Z" /><path d="M82 92C96 88 98 70 92 62C94 74 90 82 80 86Z" /></g>,
      front: () => <><path d="M24 44L23 31L35 39Z" fill={PINK} strokeWidth="1.3" /><path d="M76 44L77 31L65 39Z" fill={PINK} strokeWidth="1.3" />{whiskers(72)}</>,
    },
    {
      key: 'mouse', ...ROUND,
      back: (f) => <g><circle cx="22" cy="38" r="15" fill={f} /><circle cx="78" cy="38" r="15" fill={f} /><circle cx="22" cy="38" r="8" fill={PINK} strokeWidth="1.4" /><circle cx="78" cy="38" r="8" fill={PINK} strokeWidth="1.4" /><path d="M82 90C98 92 98 104 88 104" fill="none" /></g>,
      front: () => whiskers(72),
    },
    {
      key: 'elephant', ...ROUND,
      back: (f) => <g fill={f}><ellipse cx="14" cy="62" rx="14" ry="20" /><ellipse cx="86" cy="62" rx="14" ry="20" /></g>,
      front: (f) => <path d="M45 66C45 82 46 90 40 96C38 99 42 103 47 99C55 92 55 80 55 66Z" fill={f} />,
    },
    {
      key: 'tiger', ...ROUND,
      back: (f) => <g fill={f}><circle cx="27" cy="38" r="9" /><circle cx="73" cy="38" r="9" /></g>,
      front: () => <g strokeWidth="2.4"><path d="M50 33v8M41 35l2 6M59 35l-2 6M16 70h9M17 79h8M84 70h-9M83 79h-8" /><path d="M36 64Q50 80 64 64Q58 72 50 72Q42 72 36 64Z" fill={CREAM} strokeWidth="1.5" /></g>,
    },
    {
      key: 'monkey', ...ROUND,
      back: (f) => <g><circle cx="14" cy="58" r="10" fill={f} /><circle cx="86" cy="58" r="10" fill={f} /><circle cx="14" cy="58" r="5" fill="#F6D2B5" strokeWidth="1.4" /><circle cx="86" cy="58" r="5" fill="#F6D2B5" strokeWidth="1.4" /></g>,
      front: () => <path d="M50 42C62 42 70 50 68 62C66 76 58 84 50 84C42 84 34 76 32 62C30 50 38 42 50 42Z" fill="#F6D2B5" strokeWidth="1.6" />,
    },
    {
      key: 'bear', ...ROUND,
      back: (f) => <g><circle cx="26" cy="38" r="10" fill={f} /><circle cx="74" cy="38" r="10" fill={f} /><circle cx="26" cy="38" r="5" fill="#F6D2B5" strokeWidth="1.3" /><circle cx="74" cy="38" r="5" fill="#F6D2B5" strokeWidth="1.3" /></g>,
      front: () => <ellipse cx="50" cy="76" rx="13" ry="9" fill={CREAM} strokeWidth="1.5" />,
    },
    {
      key: 'rabbit', ...BEAN, top: 26,
      back: (f) => <g fill={f}><path d="M36 30C30 10 34 2 40 4C46 8 46 20 44 28Z" /><path d="M64 30C70 10 66 2 60 4C54 8 54 20 56 28Z" /></g>,
      front: () => <><path d="M39 26C36 14 38 9 40 10C43 12 43 20 42 26Z" fill={PINK} strokeWidth="1.2" /><path d="M61 26C64 14 62 9 60 10C57 12 57 20 58 26Z" fill={PINK} strokeWidth="1.2" />{whiskers(64)}</>,
    },
    {
      key: 'penguin', ...BEAN,
      front: () => <><path d="M50 36C66 36 70 62 68 86C66 98 58 100 50 100C42 100 34 98 32 86C30 62 34 36 50 36Z" fill="#fff" strokeWidth="1.6" /><path d="M46 64l4 4 4-4Z" fill={GOLD} strokeWidth="1.4" /></>,
    },
  ],
  fruits: [
    {
      key: 'apple', d: 'M50 36C56 30 70 28 80 40C90 54 87 80 76 94C68 104 58 102 50 98C42 102 32 104 24 94C13 80 10 54 20 40C30 28 44 30 50 36Z', top: 30, eyeY: 58, w: [16, 84],
      front: () => <><path d="M50 36C50 30 51 25 54 20" /><path d="M54 26C60 18 70 18 74 22C68 28 60 29 54 26Z" fill={LEAF} /></>,
    },
    {
      key: 'carrot', d: 'M24 34C40 27 60 27 76 34C74 64 63 90 50 106C37 90 26 64 24 34Z', top: 30, eyeY: 50, w: [27, 73], legs: false,
      front: () => <g fill={LEAF}><path d="M50 31C44 20 38 14 34 12C42 13 48 19 50 26Z" /><path d="M50 31C50 18 52 10 56 6C57 14 55 22 50 31Z" /><path d="M50 31C56 20 64 15 69 14C64 20 57 26 50 31Z" /></g>,
    },
    {
      key: 'pear', d: 'M50 20C60 20 64 32 64 42C64 52 82 62 80 82C78 100 64 104 50 104C36 104 22 100 20 82C18 62 36 52 36 42C36 32 40 20 50 20Z', top: 20, eyeY: 54, w: [21, 79],
      front: () => <><path d="M50 20C50 15 52 11 55 8" /><path d="M53 13C58 8 65 9 67 12C62 16 57 16 53 13Z" fill={LEAF} /></>,
    },
    {
      key: 'strawberry', d: 'M50 104C30 90 16 70 18 52C20 36 34 32 50 36C66 32 80 36 82 52C84 70 70 90 50 104Z', top: 30, eyeY: 56, w: [19, 81], legs: false,
      front: () => <><path d="M32 38L40 28L50 35L60 28L68 38L58 41L50 38L42 41Z" fill={LEAF} /><g fill={CREAM} stroke="none">{[[34, 80], [50, 88], [66, 80], [42, 94], [58, 94]].map(([x, y]) => <ellipse key={x + y} cx={x} cy={y} rx="1.6" ry="2.3" />)}</g></>,
    },
    {
      key: 'eggplant', d: 'M50 30C64 30 70 44 70 60C72 84 64 104 50 104C36 104 28 84 30 60C30 44 36 30 50 30Z', top: 22, eyeY: 56, w: [30, 70], legs: false,
      front: () => <><path d="M36 36Q50 22 64 36Q57 31 50 36Q43 31 36 36Z" fill={LEAF} /><path d="M50 28V18" strokeWidth="3" /></>,
    },
    {
      key: 'broccoli', d: 'M50 16C60 16 66 22 68 28C78 28 84 36 82 46C88 54 84 64 76 66C72 72 28 72 24 66C16 64 12 54 18 46C16 36 22 28 32 28C34 22 40 16 50 16Z', top: 16, eyeY: 42, w: [20, 80], legs: false,
      back: () => <path d="M40 64V100C40 105 60 105 60 100V64Z" fill="#CFE3C3" />,
    },
    {
      key: 'avocado', d: 'M50 18C62 18 66 32 68 44C70 56 82 64 80 82C78 100 64 104 50 104C36 104 22 100 20 82C18 64 30 56 32 44C34 32 38 18 50 18Z', top: 18, eyeY: 50, w: [21, 79],
      front: () => <><path d="M50 62C64 62 70 74 68 86C66 96 58 98 50 98C42 98 34 96 32 86C30 74 36 62 50 62Z" fill="#E9EFB0" strokeWidth="1.4" /><circle cx="50" cy="84" r="8" fill="#9C6B47" strokeWidth="1.6" /></>,
    },
    {
      key: 'lemon', d: 'M14 68C14 52 30 40 50 40C70 40 86 52 86 68C86 84 70 96 50 96C30 96 14 84 14 68Z', top: 40, eyeY: 62, w: [16, 84],
      front: () => <><path d="M14 68h-6M86 68h6" strokeWidth="3" /><path d="M50 40C50 34 54 30 58 30C60 34 56 38 50 40Z" fill={LEAF} /></>,
    },
    {
      key: 'mushroom', d: 'M14 56C14 30 32 18 50 18C68 18 86 30 86 56C86 61 14 61 14 56Z', top: 18, eyeY: 74, w: [36, 64], armY: 66,
      back: () => <path d="M36 56V96C36 104 64 104 64 96V56Z" fill={CREAM} />,
      front: () => <g fill="#fff" strokeWidth="1.4"><circle cx="34" cy="38" r="5" /><circle cx="56" cy="30" r="6" /><circle cx="72" cy="44" r="4" /></g>,
    },
    {
      key: 'tomato', ...ROUND,
      front: () => <><path d="M36 34L44 30L50 22L56 30L64 34L56 38L50 36L44 38Z" fill={LEAF} /><path d="M50 22V16" strokeWidth="2.4" /></>,
    },
  ],
  food: [
    {
      key: 'mug', d: 'M22 38H78V92C78 100 71 104 63 104H37C29 104 22 100 22 92Z', top: 38, eyeY: 60, w: [22, 78],
      back: () => <path d="M78 50C94 50 94 80 78 80" strokeWidth="6" />,
      front: () => <path d="M22 46H78" opacity=".35" />,
    },
    {
      key: 'cupcake', d: 'M20 58C20 34 35 22 50 22C65 22 80 34 80 58L72 104H28Z', top: 22, eyeY: 42, w: [20, 80],
      front: () => <><path d="M21 62H79" /><path d="M35 62L38 103M50 62V103M65 62L62 103" opacity=".35" /></>,
    },
    {
      key: 'onigiri', d: 'M50 18C60 18 88 70 88 88C88 100 77 104 50 104C23 104 12 100 12 88C12 70 40 18 50 18Z', top: 18, eyeY: 62, w: [16, 84],
      front: () => <path d="M36 86H64V104H36Z" fill="#35503F" />,
    },
    {
      key: 'icecream', d: 'M24 60C18 40 32 24 50 24C68 24 82 40 76 60C70 66 30 66 24 60Z', top: 24, eyeY: 44, w: [24, 76], legs: false,
      back: () => <><path d="M30 60L50 106L70 60Z" fill="#E9B872" /><path d="M36 66L58 92M48 64L64 80M64 66L42 92" strokeWidth="1.3" opacity=".45" /></>,
    },
    {
      key: 'donut', ...ROUND,
      front: () => <><path d="M18 64C18 44 32 36 50 36C68 36 82 44 82 64C78 70 74 64 70 72C66 64 60 74 54 68C48 76 42 66 36 72C32 64 24 70 18 64Z" fill="#F4AFC4" strokeWidth="1.8" /><g strokeWidth="2.2">{[['#6E9CCB', 30, 46], ['#7FA88A', 70, 48], [GOLD, 26, 58], ['#D9675F', 74, 60]].map(([c, x, y]) => <path key={x} d={`M${x} ${y}l3 -2`} stroke={c} />)}</g></>,
    },
    {
      key: 'carton', d: 'M26 104V42L34 26H66L74 42V104Z', top: 16, eyeY: 58, w: [26, 74],
      front: () => <><path d="M26 42H74" /><path d="M34 26L50 16L66 26" fill="#fff" /><rect x="32" y="80" width="36" height="14" rx="3" fill="#fff" strokeWidth="1.4" /></>,
    },
    {
      key: 'burger', d: 'M18 70C18 46 32 34 50 34C68 34 82 46 82 70Z', top: 34, eyeY: 54, w: [18, 82], legs: false,
      front: (f) => <><path d="M16 72q6 6 12 0t12 0t12 0t12 0t12 0t12 0" stroke={LEAF} strokeWidth="3.4" /><path d="M18 78H82V88H18Z" fill="#8B5A3C" /><path d="M20 88H80V96C80 102 74 104 68 104H32C26 104 20 102 20 96Z" fill={f} /><g fill={CREAM} stroke="none"><ellipse cx="36" cy="42" rx="1.5" ry="2.4" /><ellipse cx="62" cy="40" rx="1.5" ry="2.4" /><ellipse cx="72" cy="50" rx="1.5" ry="2.4" /></g></>,
    },
    {
      key: 'toast', d: 'M24 104V50C12 46 14 24 30 24C38 16 62 16 70 24C86 24 88 46 76 50V104Z', top: 18, eyeY: 54, w: [24, 76],
      front: () => <path d="M30 98V52C22 48 24 32 34 30C40 24 60 24 66 30C76 32 78 48 70 52V98Z" fill="#FBE9C4" strokeWidth="1.4" opacity=".9" />,
    },
    {
      key: 'pizza', d: 'M14 30Q50 16 86 30L50 104Z', top: 22, eyeY: 44, w: [27, 73], legs: false,
      front: () => <><path d="M14 30Q50 16 86 30" stroke="#C98A4B" strokeWidth="7" /><g fill="#D9675F" strokeWidth="1.4"><circle cx="58" cy="66" r="5" /><circle cx="44" cy="80" r="4.5" /><circle cx="32" cy="36" r="3.5" /></g></>,
    },
    {
      key: 'teapot', ...ROUND,
      back: (f) => <g fill={f}><path d="M18 72C4 66 2 54 4 48C8 56 12 62 20 64Z" /><path d="M82 56C96 54 98 80 82 84" fill="none" strokeWidth="5" /></g>,
      front: () => <><path d="M36 34Q50 22 64 34Z" fill={CREAM} /><circle cx="50" cy="24" r="3" fill={GOLD} /></>,
    },
  ],
  tales: [
    {
      key: 'princess', d: 'M32 70C30 42 37 24 50 24C63 24 70 42 68 70L84 104H16Z', top: 24, eyeY: 46, w: [31, 69], legs: false,
      front: () => <><path d="M34 70Q50 78 66 70" /><path d="M30 86Q50 94 70 86" opacity=".35" /><path d="M40 24L38 14L45 19L50 11L55 19L62 14L60 24Z" fill={GOLD} strokeWidth="1.8" /></>,
    },
    {
      key: 'prince', ...BEAN,
      front: () => <><path d="M28 52L72 92" stroke="#D9675F" strokeWidth="6" /><path d="M24 76H76" opacity=".35" /><path d="M24 36q-6 4 -4 10M76 36q6 4 4 10" stroke={GOLD} strokeWidth="3" /></>,
    },
    {
      key: 'wizard', d: 'M30 100C27 70 30 44 50 34C70 44 73 70 70 100Z', top: 6, eyeY: 54, w: [30, 70],
      front: () => <><path d="M28 36L50 2L72 36Z" fill="#6250D6" /><path d="M22 36H78" strokeWidth="3.2" /><circle cx="54" cy="20" r="2.2" fill={GOLD} stroke="none" /><circle cx="44" cy="28" r="1.6" fill={GOLD} stroke="none" /></>,
    },
    {
      key: 'knight', d: 'M50 30C78 30 87 56 85 77C83 97 69 102 50 102C31 102 17 97 15 77C13 56 22 30 50 30Z', top: 22, eyeY: 64, w: [15, 85],
      front: () => <><path d="M17 56C18 38 32 26 50 26C68 26 82 38 83 56Z" fill="#DCDAE0" /><path d="M50 26V56" opacity=".4" /><path d="M50 26C52 16 58 12 64 12C60 18 56 22 52 26" fill="#D9675F" /></>,
    },
    {
      key: 'unicorn', ...ROUND,
      back: (f) => <g><path d="M30 40L28 22L42 34Z" fill={f} /><path d="M70 40L72 22L58 34Z" fill={f} /><path d="M66 32C80 30 90 40 90 54C84 50 80 52 80 58C76 52 72 54 72 60C68 52 64 44 66 32Z" fill="#C3B0EA" /></g>,
      front: () => <><path d="M45 34L50 8L55 34Z" fill={GOLD} /><path d="M47 26l6-3M46 30l8-3M48 21l4-2" strokeWidth="1.3" /></>,
    },
    {
      key: 'frog', palette: ['#A9D18E', '#8FD6C3', '#C9DE7A', '#7FA88A', '#BFD8C2', '#9FD3E8', '#E9D772', '#C3B0EA'], d: 'M14 92C10 62 24 46 50 46C76 46 90 62 86 92C84 100 70 104 50 104C30 104 16 100 14 92Z', top: 32, eyeY: 44, w: [14, 86], legs: false,
      back: (f) => <g fill={f}><circle cx="38" cy="44" r="12" /><circle cx="62" cy="44" r="12" /></g>,
      front: () => <path d="M26 102q-8 4 -14 0M74 102q8 4 14 0" strokeWidth="3" />,
    },
    {
      key: 'dragon', ...ROUND,
      back: (f) => <g><path d="M22 58C4 44 4 28 12 26C14 38 20 46 28 50Z" fill="#C3B0EA" /><path d="M78 58C96 44 96 28 88 26C86 38 80 46 72 50Z" fill="#C3B0EA" /><path d="M80 86C96 88 100 78 100 68C94 76 88 78 82 76Z" fill={f} /></g>,
      front: () => <><path d="M38 34l-4-10 9 6M62 34l4-10-9 6" fill={GOLD} strokeWidth="1.8" /><path d="M34 84Q50 96 66 84" opacity=".3" /></>,
    },
    {
      key: 'mountain', d: 'M50 12L92 104H8Z', top: 12, eyeY: 68, w: [27, 73], legs: false,
      front: () => <path d="M50 12L63 40L56 36L50 43L44 36L37 40Z" fill="#fff" />,
    },
    {
      key: 'lake', arms: false, palette: ['#9FD3E8', '#A7C4E5', '#8FD6C3', '#C7DDF0', '#B5C7D9', '#BFD8C2', '#C3B0EA', '#9FC9E0'], d: 'M6 86C6 72 26 64 50 64C74 64 94 72 94 86C94 98 74 104 50 104C26 104 6 98 6 86Z', top: 40, eyeY: 78, w: [10, 90], legs: false,
      back: () => <g><path d="M12 78V48M18 76V54M86 78V50" /><g fill="#9C6B47"><rect x="9" y="44" width="6" height="12" rx="3" /><rect x="83" y="46" width="6" height="12" rx="3" /></g></g>,
      front: () => <path d="M18 92q6 -3 12 0M64 96q6 -3 12 0M70 82q5 -2 10 0" stroke="#fff" strokeWidth="2.2" />,
    },
    {
      key: 'tree', palette: ['#A9D18E', '#8FD6C3', '#C9DE7A', '#7FA88A', '#F7C873', '#F2A283', '#F4AFC4', '#E9D772'], d: 'M50 12C70 12 82 26 80 44C84 58 72 70 56 68H44C28 70 16 58 20 44C18 26 30 12 50 12Z', top: 12, eyeY: 40, w: [20, 80], legs: false,
      back: () => <path d="M42 64V104H58V64Z" fill="#9C6B47" />,
      front: () => <g fill="#D9675F" strokeWidth="1.3"><circle cx="30" cy="30" r="3.4" /><circle cx="70" cy="28" r="3.4" /><circle cx="68" cy="56" r="3.4" /></g>,
    },
  ],
}

export const AVATAR_THEMES = [
  { id: 'monsters', label: 'Monsters', colors: AVATAR.colors },
  { id: 'animals', label: 'Animals', colors: ['#F7A35C', '#A9D18E', '#C9C2D6', '#F6D2B5', '#B5C7D9', '#F7C873', '#C9A27E', '#F4AFC4'] },
  { id: 'fruits', label: 'Fruits & veg', colors: ['#F28B82', '#A9D18E', '#F7A35C', '#F7D774', '#B59CD9', '#F4AFC4', '#C9DE7A', '#F6C1A0'] },
  { id: 'food', label: 'Food & drinks', colors: ['#F6D2B5', '#F4AFC4', '#F7E3A3', '#C9A27E', '#A9D18E', '#9FD3E8', '#FBF6EC', '#E9B872'] },
  { id: 'tales', label: 'Fairy tales', colors: ['#F4AFC4', '#C3B0EA', '#9FD3E8', '#A9D18E', '#F7C873', '#F2A283', '#8FD6C3', '#E9D772'] },
]
export const EXTRA_LABELS = {
  monsters: ['None', 'Horns', 'Antenna', 'Ears'],
  animals: ['None', 'Bow', 'Glasses', 'Scarf'],
  fruits: ['None', 'Big leaf', 'Seeds', 'Shine'],
  food: ['None', 'Cherry', 'Sprinkles', 'Steam'],
  tales: ['None', 'Crown', 'Wand', 'Cape'],
}

// Az osztály avatar-családja (a lapon egyszer állítjuk be, minden avatar ezt követi)
export const AvatarThemeContext = createContext('monsters')
export const useAvatarTheme = () => useContext(AvatarThemeContext)
export const themeOf = (ctx, a = {}) => (ctx === 'mixed' ? (a.t && THEME_BODIES[a.t] ? a.t : 'monsters') : THEME_BODIES[ctx] ? ctx : 'monsters')
export const themeColors = (theme) => (AVATAR_THEMES.find((t) => t.id === theme) || AVATAR_THEMES[0]).colors
export const themeBodies = (theme) => THEME_BODIES[theme] || THEME_BODIES.monsters

function Eyes({ kind, y }) {
  const eye = (cx, cy, r, key) => (
    <g key={key}>
      <circle cx={cx} cy={cy} r={r} fill="#fff" />
      <circle cx={cx + r * 0.12} cy={cy + r * 0.1} r={r * 0.45} fill={INK} stroke="none" />
      <circle cx={cx + r * 0.3} cy={cy - r * 0.15} r={r * 0.14} fill="#fff" stroke="none" />
    </g>
  )
  const closed = (cx, cy, key) => <path key={key} d={`M${cx - 6} ${cy}Q${cx} ${cy + 6} ${cx + 6} ${cy}`} fill="none" />
  if (kind === 'one') return eye(50, y, 11, 'o')
  if (kind === 'three') return [eye(37, y + 2, 6, 'a'), eye(50, y - 4, 6, 'b'), eye(63, y + 2, 6, 'c')]
  if (kind === 'sleepy') return [closed(40, y, 'l'), closed(60, y, 'r'), <path key="lash" d={`M34 ${y + 2}l-3 2M66 ${y + 2}l3 2`} strokeWidth="1.6" />]
  if (kind === 'wink') return [eye(40, y, 7.5, 'l'), <path key="w" d={`M54 ${y}Q60 ${y - 5} 66 ${y}`} fill="none" />]
  if (kind === 'big') return [eye(39, y, 9.5, 'l'), eye(61, y, 9.5, 'r')]
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
  if (kind === 'tongue') return <g><path d={`M40 ${y}Q50 ${y + 10} 60 ${y}`} fill="none" /><path d={`M46 ${y + 5}q4 7 8 0`} fill="#F08A9B" strokeWidth="1.8" /></g>
  if (kind === 'cat') return <path d={`M41 ${y + 1}q4.5 5 9 0q4.5 5 9 0`} fill="none" />
  if (kind === 'teeth') return <g><path d={`M38 ${y}Q50 ${y + 14} 62 ${y}Z`} fill={INK} /><path d={`M43 ${y + 0.8}h5v3.6h-5zM52 ${y + 0.8}h5v3.6h-5z`} fill="#fff" stroke="none" /></g>
  return <path d={`M40 ${y}Q50 ${y + 10} 60 ${y}`} fill="none" />
}

// kiegészítők: x = 1, 2, 3 családonként; layer: 'back' (test mögött) vagy 'front'
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
      <g fill={CREAM}>
        <path d={`M38 ${t + 8}C33 ${t - 2} 34 ${t - 9} 37 ${t - 12}C40 ${t - 6} 43 ${t} 45 ${t + 4}`} />
        <path d={`M62 ${t + 8}C67 ${t - 2} 66 ${t - 9} 63 ${t - 12}C60 ${t - 6} 57 ${t} 55 ${t + 4}`} />
      </g>
    )
    if (x === 2) return <g><path d={`M50 ${t + 2}C49 ${t - 6} 53 ${t - 9} 55 ${t - 13}`} fill="none" /><circle cx="56" cy={t - 15} r="3.6" fill={fill} /></g>
    return null
  }
  if (theme === 'animals') {
    if (layer !== 'front') return null
    if (x === 1) return <g fill="#F08A9B"><path d={`M${l + 8} ${t + 4}l-10 -6v12z`} /><path d={`M${l + 8} ${t + 4}l10 -6v12z`} /><circle cx={l + 8} cy={t + 4} r="2.6" /></g>
    if (x === 2) return <g fill="rgba(255,255,255,.25)"><circle cx="40" cy={body.eyeY} r="10" /><circle cx="60" cy={body.eyeY} r="10" /><path d={`M50 ${body.eyeY}h0M30 ${body.eyeY - 2}l-8 -3M70 ${body.eyeY - 2}l8 -3`} /></g>
    if (x === 3) { const y = body.eyeY + 27; return <g><path d={`M${l + 6} ${y}Q50 ${y + 8} ${r - 6} ${y}V${y + 7}Q50 ${y + 15} ${l + 6} ${y + 7}Z`} fill="#D9675F" /><path d={`M${r - 14} ${y + 8}l4 14 7 -2 -3 -13`} fill="#D9675F" /></g> }
    return null
  }
  if (theme === 'fruits') {
    if (layer === 'back' && x === 1) return <path d={`M${r - 6} ${t + 14}C${r + 14} ${t + 4} ${r + 18} ${t + 22} ${r + 2} ${t + 32}C${r - 2} ${t + 24} ${r - 4} ${t + 20} ${r - 6} ${t + 14}Z`} fill={LEAF} />
    if (layer !== 'front') return null
    if (x === 2) return <g fill={CREAM} stroke="none">{[[36, 82], [50, 88], [64, 82], [43, 94], [57, 94]].map(([cx, cy]) => <ellipse key={cx + cy} cx={cx} cy={cy} rx="1.6" ry="2.4" />)}</g>
    if (x === 3) return <g><path d={`M${l + 10} ${body.eyeY - 2}C${l + 10} ${body.eyeY - 14} ${l + 18} ${body.eyeY - 20} ${l + 24} ${body.eyeY - 20}`} stroke="#fff" strokeWidth="4.4" /><circle cx={r - 10} cy={body.eyeY + 30} r="3" fill="#BFE3F2" strokeWidth="1.3" /></g>
    return null
  }
  if (theme === 'food') {
    if (layer !== 'front') return null
    if (x === 1) return <g><path d={`M50 ${t + 2}C50 ${t - 6} 54 ${t - 10} 58 ${t - 12}`} fill="none" /><circle cx="50" cy={t - 2} r="6" fill="#D9675F" /></g>
    if (x === 2) return <g strokeWidth="2.4">{[['#D9675F', 34, 30], ['#6E9CCB', 46, 26], ['#7FA88A', 58, 30], [GOLD, 66, 36], ['#B59CD9', 40, 36]].map(([c, cx, cy]) => <path key={cx} d={`M${cx} ${t + cy - 22}l3 -2`} stroke={c} />)}</g>
    if (x === 3) return <path d={`M40 ${t - 4}C36 ${t - 10} 44 ${t - 14} 40 ${t - 20}M52 ${t - 4}C48 ${t - 10} 56 ${t - 14} 52 ${t - 20}M64 ${t - 4}C60 ${t - 10} 68 ${t - 14} 64 ${t - 20}`} opacity=".55" />
    return null
  }
  if (theme === 'tales') {
    if (x === 3 && layer === 'back') return <path d={`M${l + 4} ${body.eyeY + 10}C${l - 10} ${body.eyeY + 40} ${l - 8} 100 ${l + 2} 104H${r - 2}C${r + 8} 100 ${r + 10} ${body.eyeY + 40} ${r - 4} ${body.eyeY + 10}Z`} fill="#D9675F" />
    if (layer !== 'front') return null
    if (x === 1) {
      const cy = body.key === 'wizard' ? 37 : body.key === 'knight' ? 26 : t
      return <path d={`M36 ${cy}L33 ${cy - 15}L42 ${cy - 7}L50 ${cy - 17}L58 ${cy - 7}L67 ${cy - 15}L64 ${cy}Z`} fill={GOLD} />
    }
    if (x === 2) return <g><path d={`M${r + 1} ${body.eyeY + 36}L${r + 12} ${body.eyeY + 14}`} strokeWidth="3" /><path d={`M${r + 12} ${body.eyeY + 6}l2 5 5 .5-4 3.5 1.2 5-4.2-2.7-4.2 2.7 1.2-5-4-3.5 5-.5z`} fill={GOLD} strokeWidth="1.6" /></g>
    return null
  }
  return null
}


// ── Haj, fejdísz, fejfedő (minden családban; 0 = nincs) ──
export const HEADWEAR = ['None', 'Fringe', 'Curly', 'Long hair', 'Bun', 'Ponytail', 'Cap', 'Beanie', 'Top hat', 'Flower crown', 'Party hat', 'Headphones', 'Beret', 'Bandana']
export const HAIR_COLORS = ['#6B4A3A', '#2F2430', '#E9C46A', '#D9774F', '#F4AFC4', '#8FB8E0']
function Head({ h, hc, body, layer }) {
  if (!h) return null
  const t = body.top
  const hw = Math.max(13, Math.min(26, (body.w[1] - body.w[0]) / 2 - 3))
  const L = 50 - hw, R = 50 + hw
  const hair = HAIR_COLORS[hc] ?? HAIR_COLORS[0]
  const fringe = <path d={`M${L} ${t + 13}C${L} ${t - 5} ${R} ${t - 5} ${R} ${t + 13}C${R - 6} ${t + 5} ${56} ${t + 11} 50 ${t + 5}C${44} ${t + 11} ${L + 6} ${t + 5} ${L} ${t + 13}Z`} fill={hair} />
  if (layer === 'back') {
    if (h === 3) return <path d={`M${L - 1} ${t + 8}C${L - 9} ${t + 34} ${L - 8} ${t + 56} ${L + 1} ${t + 64}C${L + 3} ${t + 44} ${L + 4} ${t + 26} ${L + 6} ${t + 14}ZM${R + 1} ${t + 8}C${R + 9} ${t + 34} ${R + 8} ${t + 56} ${R - 1} ${t + 64}C${R - 3} ${t + 44} ${R - 4} ${t + 26} ${R - 6} ${t + 14}Z`} fill={hair} />
    if (h === 5) return <path d={`M${R - 4} ${t + 2}C${R + 14} ${t - 2} ${R + 16} ${t + 22} ${R + 8} ${t + 36}C${R + 6} ${t + 24} ${R + 2} ${t + 14} ${R - 6} ${t + 10}Z`} fill={hair} />
    return null
  }
  switch (h) {
    case 1: case 3: case 5: return fringe
    case 2: return <g fill={hair}>{[-0.85, -0.45, 0, 0.45, 0.85].map((k, i) => <circle key={i} cx={50 + k * hw} cy={t + 4 + Math.abs(k) * 6} r={7.5 - Math.abs(k) * 1.5} />)}</g>
    case 4: return <>{fringe}<circle cx="50" cy={t - 7} r="7.5" fill={hair} /></>
    case 6: return <><path d={`M${L} ${t + 10}C${L} ${t - 9} ${R} ${t - 9} ${R} ${t + 10}Z`} fill="#6E9CCB" /><path d={`M${R - 6} ${t + 10}H${R + 12}`} strokeWidth="4.4" /><circle cx="50" cy={t - 4} r="2" fill={INK} stroke="none" /></>
    case 7: return <><path d={`M${L} ${t + 10}C${L} ${t - 11} ${R} ${t - 11} ${R} ${t + 10}Z`} fill="#D9675F" /><path d={`M${L - 1} ${t + 4}H${R + 1}V${t + 11}H${L - 1}Z`} fill="#F2A283" /><circle cx="50" cy={t - 9} r="5" fill={CREAM} /></>
    case 8: return <><path d={`M38 ${t + 3}V${t - 22}H62V${t + 3}Z`} fill="#3A2B38" /><path d={`M38 ${t - 5}H62V${t - 1}H38Z`} fill={GOLD} stroke="none" /><path d={`M30 ${t + 3}H70`} strokeWidth="4.4" /></>
    case 9: return <g strokeWidth="1.4">{[-0.8, -0.4, 0, 0.4, 0.8].map((k, i) => { const cx = 50 + k * hw, cy = t + 3 + Math.abs(k) * 6, c = ['#F4AFC4', '#F7D774', '#B59CD9', '#F2A283', '#9FD3E8'][i]; return <g key={i}>{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={cx + 3.6 * Math.cos(a * Math.PI / 180)} cy={cy + 3.6 * Math.sin(a * Math.PI / 180)} r="2.6" fill={c} />)}<circle cx={cx} cy={cy} r="1.8" fill={GOLD} /></g> })}<path d={`M${L + 2} ${t + 9}Q50 ${t - 2} ${R - 2} ${t + 9}`} stroke={LEAF} strokeWidth="2" fill="none" /></g>
    case 10: return <><path d={`M41 ${t + 4}L50 ${t - 24}L59 ${t + 4}Z`} fill="#B59CD9" /><path d={`M44 ${t - 6}l9 4M42 ${t + 1}l14 0M47 ${t - 14}l5 2`} stroke={GOLD} strokeWidth="2" /><circle cx="50" cy={t - 25} r="3.4" fill="#F4AFC4" /></>
    case 11: return <><path d={`M${L - 2} ${body.eyeY - 2}C${L - 4} ${t - 8} ${R + 4} ${t - 8} ${R + 2} ${body.eyeY - 2}`} strokeWidth="3.6" fill="none" /><rect x={L - 8} y={body.eyeY - 8} width="9" height="15" rx="4" fill="#D9675F" /><rect x={R - 1} y={body.eyeY - 8} width="9" height="15" rx="4" fill="#D9675F" /></>
    case 12: return <><path d={`M${L - 4} ${t + 6}C${L - 2} ${t - 8} ${R + 6} ${t - 10} ${R + 4} ${t + 4}C${R} ${t + 9} ${L} ${t + 11} ${L - 4} ${t + 6}Z`} fill="#D9675F" /><path d={`M52 ${t - 6}l2 -5`} strokeWidth="2.4" /></>
    case 13: return <><path d={`M${L} ${t + 6}C${L + 4} ${t - 6} ${R - 4} ${t - 6} ${R} ${t + 6}L${R} ${t + 11}H${L}Z`} fill="#6E9CCB" /><g fill="#fff" stroke="none">{[-0.5, 0, 0.5].map((k) => <circle key={k} cx={50 + k * hw} cy={t + 3} r="1.5" />)}</g><path d={`M${R} ${t + 8}l8 -4 1 8z`} fill="#6E9CCB" /></>
    default: return null
  }
}

export default function Avatar({ a = {}, className = 'cr-avatar', title, theme: forced, ...rest }) {
  const ctx = useAvatarTheme()
  const theme = forced || themeOf(ctx, a)
  const colors = themeColors(theme)
  const bodies = themeBodies(theme)
  const body = bodies[a.b] ?? bodies[0]
  // néhány testnek saját, természetes színskálája van (fa, tó, béka)
  const pal = body.palette || colors
  const fill = pal[a.c] ?? pal[0]
  const eyes = AVATAR.eyes[a.e] ?? 'two'
  const mouth = AVATAR.mouths[a.m] ?? 'smile'
  const x = Number.isInteger(a.x) ? a.x : 0
  const h = Number.isInteger(a.h) ? a.h : 0
  const mouthY = body.eyeY + (eyes === 'one' ? 20 : eyes === 'big' ? 19 : 17)

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
      <Head h={h} hc={a.hc} body={body} layer="back" />
      {body.back?.(fill)}
      {/* lábak */}
      {body.legs !== false && <path d="M36 100v5h9v-5M55 100v5h9v-5" fill={fill} />}
      <path d={body.d} fill={fill} />
      {/* karocskák */}
      {body.arms !== false && (() => {
        const y = body.armY ?? body.eyeY + 22
        return <>
          <path d={`M${body.w[0] + 3} ${y}C${body.w[0] - 6} ${y + 6} ${body.w[0] - 6} ${y + 12} ${body.w[0] + 1} ${y + 16}`} />
          <path d={`M${body.w[1] - 3} ${y}C${body.w[1] + 6} ${y + 6} ${body.w[1] + 6} ${y + 12} ${body.w[1] - 1} ${y + 16}`} />
        </>
      })()}
      {body.front?.(fill)}
      <Extra theme={theme} x={x} body={body} fill={fill} layer="front" />
      <Head h={h} hc={a.hc} body={body} layer="front" />
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

// ── Class settings: az osztály avatar-családja ──
const PICK_CREW = {
  monsters: [3, 5, 8], animals: [0, 4, 2], fruits: [3, 8, 4], food: [3, 7, 8], tales: [4, 5, 9],
}
export function AvatarThemePicker({ value = 'monsters', onChange }) {
  const opts = [...AVATAR_THEMES.map((t) => ({ id: t.id, label: t.label })), { id: 'mixed', label: 'Mixed – each student picks' }]
  const crew = (theme, bs) => (
    <svg className="cr-avatar" viewBox="0 0 100 112" aria-hidden="true">
      <Avatar a={{ c: 0, b: bs[0], e: 0, m: 0, x: 0 }} theme={theme} className="" x={0} y={6} width={52} height={58} />
      <Avatar a={{ c: 2, b: bs[1], e: 1, m: 1, x: 0 }} theme={theme} className="" x={46} y={0} width={54} height={60} />
      <Avatar a={{ c: 4, b: bs[2], e: 0, m: 2, x: 0 }} theme={theme} className="" x={22} y={44} width={58} height={64} />
    </svg>
  )
  return (
    <div className="cr-themes" role="radiogroup" aria-label="Avatar style">
      {opts.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={`cr-theme ${value === o.id ? 'is-active' : ''}`} onClick={() => onChange(o.id)}>
          {o.id === 'mixed' ? (
            <svg className="cr-avatar" viewBox="0 0 100 112" aria-hidden="true">
              <Avatar a={{ c: 0, b: 0, e: 0, m: 0, x: 0 }} theme="animals" className="" x={0} y={6} width={52} height={58} />
              <Avatar a={{ c: 2, b: 4, e: 1, m: 1, x: 0 }} theme="tales" className="" x={46} y={0} width={54} height={60} />
              <Avatar a={{ c: 4, b: 3, e: 0, m: 2, x: 0 }} theme="food" className="" x={22} y={44} width={58} height={64} />
            </svg>
          ) : crew(o.id, PICK_CREW[o.id])}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  )
}
