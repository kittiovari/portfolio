// Spotify-kapcsolat az Osztályteremhez (Premium + Web Playback SDK).
// Bejelentkezés: OAuth „Authorization Code + PKCE” – nincs titkos kulcs a
// kódban, a Client ID nyilvános adat. A tokenek csak ebben a böngészőben
// (localStorage) élnek; a „Kapcsolat bontása” törli őket.

// A Spotify fejlesztői app azonosítója (developer.spotify.com → Dashboard → app → Client ID)
export const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'ffb48e0519824978ae01b97a39767e91'

const SCOPES = [
  'streaming', // lejátszás a böngészőben (Web Playback SDK)
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ')

const KEY = 'cr-spotify'
const VERIFIER = 'cr-spotify-verifier'
const STATE = 'cr-spotify-state'
const RETURN = 'cr-spotify-return'

export const redirectUri = () => `${window.location.origin}/osztalyterem/spotify`
export const isConfigured = () => Boolean(CLIENT_ID)

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null } }
const write = (v) => { try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY) } catch { /* */ } }

export const isConnected = () => Boolean(read()?.refresh)
export function disconnect() { write(null) }

const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const randomString = (n = 64) => b64url(crypto.getRandomValues(new Uint8Array(n))).slice(0, n)

// 1. lépés: átirányítás a Spotify bejelentkező oldalára
export async function connect(returnTo = window.location.pathname) {
  const verifier = randomString(64)
  const state = randomString(16)
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
  sessionStorage.setItem(VERIFIER, verifier)
  sessionStorage.setItem(STATE, state)
  sessionStorage.setItem(RETURN, returnTo)
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri(),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES,
    state,
  })
  window.location.assign(`https://accounts.spotify.com/authorize?${params}`)
}

async function tokenRequest(body) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID, ...body }),
  })
  if (!res.ok) throw new Error(`token ${res.status}`)
  const data = await res.json()
  const prev = read()
  const next = {
    access: data.access_token,
    refresh: data.refresh_token || prev?.refresh,
    exp: Date.now() + (data.expires_in - 60) * 1000,
  }
  write(next)
  return next
}

// 2. lépés: a visszairányítás után a kódot tokenre cseréljük. Visszaadja, hová menjünk tovább.
export async function finishLogin(search) {
  const q = new URLSearchParams(search)
  const back = sessionStorage.getItem(RETURN) || '/osztalyterem'
  if (q.get('error')) return { ok: false, back, error: q.get('error') }
  if (!q.get('code') || q.get('state') !== sessionStorage.getItem(STATE)) return { ok: false, back, error: 'state' }
  try {
    await tokenRequest({
      grant_type: 'authorization_code',
      code: q.get('code'),
      redirect_uri: redirectUri(),
      code_verifier: sessionStorage.getItem(VERIFIER) || '',
    })
    return { ok: true, back }
  } catch (e) {
    return { ok: false, back, error: e.message }
  } finally {
    sessionStorage.removeItem(VERIFIER)
    sessionStorage.removeItem(STATE)
  }
}

// Érvényes hozzáférési token (szükség esetén frissítve)
let refreshing = null
export async function getToken() {
  const t = read()
  if (!t?.refresh) throw new Error('not-connected')
  if (t.access && t.exp > Date.now()) return t.access
  if (!refreshing) {
    refreshing = tokenRequest({ grant_type: 'refresh_token', refresh_token: t.refresh })
      .catch((e) => { if (/token 400/.test(e.message)) disconnect(); throw e })
      .finally(() => { refreshing = null })
  }
  return (await refreshing).access
}

export async function api(path, { method = 'GET', body } = {}) {
  const token = await getToken()
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok && res.status !== 204) throw new Error(`api ${res.status}`)
  return res.status === 204 ? null : res.json().catch(() => null)
}

// Web Playback SDK betöltése (egyszer)
let sdkPromise = null
export function loadSdk() {
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      if (window.Spotify) { resolve(window.Spotify); return }
      window.onSpotifyWebPlaybackSDKReady = () => resolve(window.Spotify)
      const s = document.createElement('script')
      s.src = 'https://sdk.scdn.co/spotify-player.js'
      s.async = true
      s.onerror = () => { sdkPromise = null; reject(new Error('sdk')) }
      document.body.appendChild(s)
    })
  }
  return sdkPromise
}
