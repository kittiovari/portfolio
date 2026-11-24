// Területi oldalak jelszavas feloldása.
// A jelszavak csak SHA-256 hash-ként szerepelnek. Ez kliensoldali „függöny”,
// nem valódi hozzáférés-védelem: a statikus oldal tartalma a letöltött JS-ben van.

export const AREAS = {
  language: { path: '/nyelvoktatas', hash: '18ebc076f4c2994303cbb3ff5244bb7ad4ee06c8ecb75dd350bb41bc671a9b08' },
  arttherapy: { path: '/muveszetterapia', hash: '79b783ee5794b1151a02d2890b9b673ad69aa01fc5db884bab7fb1407173eea4' },
  ux: { path: '/ux', hash: '91f58f872b89a6b0131b9b129bf0e98e738d1e738347cc2ef4c0734d2d84db63' },
}

// Ha a sessionStorage nem elérhető (pl. privát mód), legalább az oldal
// újratöltéséig megjegyezzük a feloldást.
const memory = new Set()
const key = (area) => `kittipedia-unlocked-${area}`

export function isUnlocked(area) {
  if (memory.has(area)) return true
  try { return sessionStorage.getItem(key(area)) === '1' } catch { return false }
}

export function markUnlocked(area) {
  memory.add(area)
  try { sessionStorage.setItem(key(area), '1') } catch { /* csak memóriában */ }
}

async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Szóközöket levágjuk, az ékezeteket egységes (NFC) alakra hozzuk,
// így a különböző billentyűzetekről bevitt „é” is egyezik.
export async function checkPassword(area, input) {
  const target = AREAS[area]?.hash
  if (!target) return false
  const value = input.trim().normalize('NFC')
  if (!value) return false
  return (await sha256(value)) === target
}
