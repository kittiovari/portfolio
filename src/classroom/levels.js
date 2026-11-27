// Szintek és szinthez kötött avatar-elemek – a kliens ÉS a szerver is ezt használja
// (netlify/lib/studentWork.mjs), így a zárolás szabálya egy helyen van.
// A szint a pozitív pontok összegéből jön (minden tanév): negatív bejegyzés és
// kiváltság-beváltás sosem csökkenti.

export const LEVELS = [
  // egy átlagos diák ~3 XP/óra, heti 4–5 óra → a Legend nagyjából a tanév végére jön össze
  { min: 15, id: 'explorer', name: 'Explorer' },
  { min: 40, id: 'traveller', name: 'Traveller' },
  { min: 90, id: 'storyteller', name: 'Storyteller' },
  { min: 180, id: 'navigator', name: 'Navigator' },
  { min: 300, id: 'legend', name: 'Legend' },
]

export const positiveTotal = (events = []) => events.reduce((s, e) => s + (e.v > 0 ? e.v : 0), 0)
// 0 = még nincs szint, 1 = Explorer … 5 = Legend
export const levelIndex = (pts) => LEVELS.filter((l) => pts >= l.min).length
export const levelInfo = (events) => {
  const pts = positiveTotal(events)
  const i = levelIndex(pts)
  const next = LEVELS[i] || null
  return { pts, index: i, level: LEVELS[i - 1] || null, next, toNext: next ? next.min - pts : 0 }
}

// Avatar-elemek zárolása: { mező: { érték: szükséges szint } }
// h – Hair & hats (Avatar.jsx HEADWEAR), x – Extra (model.js AVATAR.extras)
// A frizurák mindig szabadok (önábrázolás); jutalom csak a díszítés, szintenként kettő, a csúcson három.
export const AV_LOCKS = {
  h: { 6: 1, 7: 2, 11: 3, 13: 4, 12: 4, 9: 5, 10: 5, 8: 5 }, // Cap, Beanie, Headphones, Bandana, Beret, Flower crown, Party hat, Top hat
  x: { 1: 1, 2: 2, 3: 3 }, // Horns, Antenna, Ears
}
export const lockLevel = (k, v) => AV_LOCKS[k]?.[v] || 0
// diák saját mentése: zárolt elem csak akkor maradhat, ha már most is az övé (a tanár adta)
export function avatarAllowed(a, level, current = {}) {
  for (const k of Object.keys(AV_LOCKS)) {
    const need = lockLevel(k, a?.[k])
    if (need > level && a?.[k] !== current?.[k]) return false
  }
  return true
}

// az egyes szintek elérésének időpontja (a pozitív pontok időrendjében)
export function levelMoments(events = []) {
  const out = []
  let sum = 0
  for (const e of [...events].filter((x) => x.v > 0).sort((a, b) => a.t - b.t)) {
    sum += e.v
    while (out.length < LEVELS.length && sum >= LEVELS[out.length].min) out.push({ ...LEVELS[out.length], t: e.t })
  }
  return out
}
