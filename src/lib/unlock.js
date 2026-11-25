// A területi oldalak feloldása – a böngésző oldaláról.
// Itt NINCS jelszó, hash vagy védett tartalom: minden ellenőrzés a szerveren
// (Netlify Functions) történik, a feloldást egy HttpOnly süti tartja nyilván,
// amit a JavaScript nem is lát. Ez a modul csak kérdez és megjegyzi a választ.

export const AREAS = {
  'language-9b': { path: '/nyelvoktatas/9b' },
  'language-9d': { path: '/nyelvoktatas/9d' },
  arttherapy: { path: '/muveszetterapia' },
  ux: { path: '/ux' },
  teacher: { path: '/osztalyterem' },
}

// A Nyelvoktatás csempe mögötti csoportok (profilválasztó a jelszómodalban)
export const LANGUAGE_PROFILES = [
  { area: 'language-9b', id: '9b', label: 'NYEK9B' },
  { area: 'language-9d', id: '9d', label: 'NYEK9D' },
  // Tanári belépés ugyanitt (külön tanári jelszóval) → Osztályterem
  { area: 'teacher', id: 'tanar', label: 'Teacher' },
]
export const isLanguageArea = (area) => area === 'language' || area.startsWith('language-')
export const unlockedLanguageAreas = () => LANGUAGE_PROFILES.filter((p) => p.area.startsWith('language-') && isUnlocked(p.area)).map((p) => p.area)

// A szervertől utoljára kapott állapot (csak a lakat ikonokhoz / gyors navigációhoz)
let known = new Set()
const listeners = new Set()
const emit = () => listeners.forEach((fn) => fn())

export const isUnlocked = (area) => known.has(area)

export function onSessionChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function markUnlocked(area) {
  known.add(area)
  emit()
}

export async function refreshSession() {
  try {
    const res = await fetch('/api/session', { credentials: 'same-origin', cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      known = new Set(Array.isArray(data.unlocked) ? data.unlocked : [])
      emit()
    }
  } catch {
    /* hálózati hiba: marad a korábbi állapot */
  }
  return known
}

// Jelszó ellenőrzése a szerveren.
// Visszatérés: { ok: true } vagy { ok: false, reason: 'wrong'|'locked'|'unavailable', retryAfter? }
export async function checkPassword(area, password) {
  if (!password.trim()) return { ok: false, reason: 'wrong' }
  try {
    const res = await fetch('/api/unlock', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ area, password }),
    })
    if (res.ok) {
      markUnlocked(area)
      return { ok: true }
    }
    const data = await res.json().catch(() => ({}))
    if (res.status === 429) return { ok: false, reason: 'locked', retryAfter: data.retryAfter }
    if (res.status === 401) return { ok: false, reason: 'wrong' }
    return { ok: false, reason: 'unavailable' }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
}

// Védett tartalom lekérése. { status: 200, data } | { status: 401 } | { status: 0 }
export async function fetchContent(area) {
  try {
    const res = await fetch(`/api/content/${area}`, { credentials: 'same-origin', cache: 'no-store' })
    if (res.status === 401) {
      known.delete(area)
      emit()
      return { status: 401 }
    }
    if (!res.ok) return { status: res.status }
    markUnlocked(area)
    return { status: 200, data: await res.json() }
  } catch {
    return { status: 0 }
  }
}
