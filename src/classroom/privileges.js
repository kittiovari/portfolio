// Kiváltság-menü – a kliens ÉS a szerver is ezt használja (netlify/lib/privileges.mjs).
// A diák a saját riportjából kéri, a tanár jóváhagyja; a jóváhagyás egy beváltás-esemény
// (redeem, negatív pont), ami a szintet nem csökkenti és az E-Kréta-szövegbe sem kerül.
export const DEFAULT_PRIVILEGES = [
  { id: 'dj', name: 'Choose the warmer music (DJ)', cost: 5, art: 'headphones', dj: true },
  { id: 'hwpass', name: 'Homework pass', cost: 15, art: 'hwpass' },
  { id: 'seat', name: 'Sit anywhere for a lesson', cost: 5, art: 'seat' },
]
export const PRIV_ARTS = ['headphones', 'hwpass', 'seat', 'ticket', 'star', 'trophy', 'relax', 'energy']

export function privilegesOf(doc) {
  const list = Array.isArray(doc?.privileges) ? doc.privileges : DEFAULT_PRIVILEGES
  return list.filter((p) => p && typeof p.id === 'string' && p.name).slice(0, 20).map((p) => ({
    id: String(p.id).slice(0, 24), name: String(p.name).slice(0, 60), cost: Math.max(1, Math.min(200, Math.round(Number(p.cost) || 1))),
    art: PRIV_ARTS.includes(p.art) ? p.art : 'ticket', ...(p.dj ? { dj: true } : {}),
  }))
}
