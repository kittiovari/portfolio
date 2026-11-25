import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Sheet, Icon, play } from './ui.jsx'
import { useCountdown } from './tools.jsx'
import { fmtTime } from './model.js'
import { api, connect, disconnect, finishLogin, getToken, isConfigured, isConnected, loadSdk } from './spotify.js'

/*
  „Időzítő és zene” – egy eszköz, három választással:
  - zene: nincs | Relax | Active (a Spotify-műsorlistáid)
  - idő: nincs | percek (meghosszabbítható)
  - nézet: teljes képernyő | kompakt (a kettő között futás közben is váltható)
  Lejártkor a zene megáll és megszólal a jelzés.
*/

export const COLOR = '#6A4BC4'

// link: alapértelmezett műsorlista (Classroom music – Relax / Active); az appban felülírható
export const MUSIC_CHANNELS = [
  { id: 'relax', label: 'Relax', icon: '🌿', color: '#7FA88A', link: 'https://open.spotify.com/playlist/4ltbNjjpM1Z8VXryyIwmCx' },
  { id: 'active', label: 'Active', icon: '⚡', color: '#E0915A', link: 'https://open.spotify.com/playlist/6bbuItAD2mIe0hdOfBDi8g' },
]
const linkOf = (doc, id) => doc.music?.[id] || MUSIC_CHANNELS.find((c) => c.id === id)?.link || ''
export function playlistId(link = '') {
  const m = String(link).match(/playlist[/:]([A-Za-z0-9]{10,})/)
  return m ? m[1] : null
}

const MINUTES = [1, 3, 5, 10, 15, 20]

// ── Beállító panel ──
export function SessionSetup({ doc, update, onStart, onClose, onBack }) {
  const [music, setMusic] = useState('relax')
  const [minutes, setMinutes] = useState(5)
  const [custom, setCustom] = useState('')
  const [mode, setMode] = useState('full')
  const [editLink, setEditLink] = useState(null)
  const [draft, setDraft] = useState('')

  const seconds = custom ? Math.round(Number(custom) * 60) : minutes ? minutes * 60 : null
  const canStart = Boolean(music || seconds)

  const saveLink = (e) => {
    e.preventDefault()
    if (!playlistId(draft)) return
    update((d) => ({ ...d, music: { ...(d.music || {}), [editLink]: draft.trim() } }))
    setEditLink(null)
  }

  if (editLink) {
    const ch = MUSIC_CHANNELS.find((c) => c.id === editLink)
    return (
      <Sheet title="Időzítő és zene" color={COLOR} icon={<Icon.timer />} onClose={onClose} onBack={() => setEditLink(null)} className="cr-sheet--compact">
        <form className="cr-form" onSubmit={saveLink}>
          <label className="cr-field">
            <span>{ch.icon} {ch.label} – Spotify-műsorlista linkje</span>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="https://open.spotify.com/playlist/…" autoFocus />
          </label>
          {draft && !playlistId(draft) && <p className="cr-hint is-neg">Ez nem Spotify-műsorlista link.</p>}
          <div className="cr-form__actions">
            <span className="cr-spacer" />
            <button type="button" className="cr-btn" onClick={() => setEditLink(null)}>Mégse</button>
            <button type="submit" className="cr-btn cr-btn--primary" disabled={!playlistId(draft)}>Mentés</button>
          </div>
        </form>
      </Sheet>
    )
  }

  return (
    <Sheet title="Időzítő és zene" color={COLOR} icon={<Icon.timer />} onClose={onClose} onBack={onBack} className="cr-sheet--compact cr-setup">
      <div className="cr-setup__row">
        <h3>Zene</h3>
        <div className="cr-choice">
          <button className={!music ? 'is-active' : ''} onClick={() => setMusic(null)}>Nincs</button>
          {MUSIC_CHANNELS.map((c) => (
            <button key={c.id} className={music === c.id ? 'is-active' : ''} onClick={() => setMusic(c.id)} style={{ '--ch': c.color }}>
              <span aria-hidden="true">{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
        <div className="cr-setup__links">
          {music && (
            <button className="cr-link cr-setup__edit" onClick={() => { setEditLink(music); setDraft(linkOf(doc, music)) }}>
              <Icon.pencil />Lista cseréje
            </button>
          )}
          <SpotifyStatus />
        </div>
      </div>

      <div className="cr-setup__row">
        <h3>Időzítő</h3>
        <div className="cr-choice cr-choice--wrap">
          <button className={!minutes && !custom ? 'is-active' : ''} onClick={() => { setMinutes(null); setCustom('') }}>Nincs</button>
          {MINUTES.map((m) => (
            <button key={m} className={minutes === m && !custom ? 'is-active' : ''} onClick={() => { setMinutes(m); setCustom('') }}>{m} perc</button>
          ))}
          <label className={`cr-choice__custom ${custom ? 'is-active' : ''}`}>
            <input type="number" min="0.5" max="180" step="0.5" value={custom} placeholder="egyéni" onChange={(e) => setCustom(e.target.value)} aria-label="Egyéni idő percben" /> perc
          </label>
        </div>
      </div>

      <div className="cr-setup__row">
        <h3>Nézet</h3>
        <div className="cr-choice">
          <button className={mode === 'full' ? 'is-active' : ''} onClick={() => setMode('full')}><Icon.expand />Teljes képernyő</button>
          <button className={mode === 'compact' ? 'is-active' : ''} onClick={() => setMode('compact')}><Icon.compact />Kompakt</button>
        </div>
      </div>

      <button className="cr-btn cr-btn--primary cr-setup__go" disabled={!canStart}
        onClick={() => onStart({ music, link: music ? linkOf(doc, music) : null, seconds, mode, key: Date.now() })}>
        <Icon.play />Indítás
      </button>
    </Sheet>
  )
}

// Spotify-fiók kapcsolat (saját lejátszó: léptetés, hangerő)
function SpotifyStatus() {
  const [on, setOn] = useState(isConnected())
  if (!isConfigured()) return null
  return on ? (
    <span className="cr-spotify is-on">
      <span className="cr-spotify__dot" />Spotify csatlakozva
      <button className="cr-link" onClick={() => { disconnect(); setOn(false) }}>Bontás</button>
    </span>
  ) : (
    <button className="cr-spotify" onClick={() => connect()}>
      <span className="cr-spotify__dot" />Csatlakozás a Spotify-fiókhoz
    </button>
  )
}

// Visszatérés a Spotify bejelentkezés után (/osztalyterem/spotify)
export function SpotifyCallback() {
  const [msg, setMsg] = useState('Kapcsolódás a Spotify-hoz…')
  useEffect(() => {
    finishLogin(window.location.search).then(({ ok, back, error }) => {
      if (ok) window.location.replace(back)
      else setMsg(error === 'access_denied' ? 'A Spotify-kapcsolatot nem engedélyezted.' : 'Nem sikerült csatlakozni a Spotify-hoz.')
    })
  }, [])
  return (
    <div className="cr cr-callback">
      <p>{msg}</p>
      <a className="cr-btn" href="/osztalyterem">Vissza az Osztályterembe</a>
    </div>
  )
}

// ── Spotify IFrame API (hivatalos beágyazott lejátszó, programozható vezérléssel) ──
let apiPromise = null
function loadSpotifyApi() {
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      window.onSpotifyIframeApiReady = resolve
      const s = document.createElement('script')
      s.src = 'https://open.spotify.com/embed/iframe-api/v1'
      s.async = true
      s.onerror = () => { apiPromise = null; reject(new Error('spotify')) }
      document.body.appendChild(s)
    })
  }
  return apiPromise
}

function useSpotify(hostRef, uri) {
  const ctl = useRef(null)
  const [paused, setPaused] = useState(true)
  const [error, setError] = useState(false)
  useEffect(() => {
    if (!uri || !hostRef.current) return
    let alive = true
    loadSpotifyApi().then((API) => {
      if (!alive || !hostRef.current) return
      const el = document.createElement('div')
      hostRef.current.replaceChildren(el)
      API.createController(el, { uri, width: '100%', height: 80 }, (c) => {
        if (!alive) { c.destroy(); return }
        ctl.current = c
        c.addListener('ready', () => c.play())
        c.addListener('playback_update', (e) => setPaused(Boolean(e.data?.isPaused)))
      })
    }).catch(() => alive && setError(true))
    return () => {
      alive = false
      try { ctl.current?.destroy() } catch { /* */ }
      ctl.current = null
    }
  }, [uri, hostRef])
  return {
    paused,
    error,
    toggle: () => ctl.current?.togglePlay(),
    pause: () => ctl.current?.pause(),
    resume: () => ctl.current?.resume(),
  }
}

// ── Saját lejátszó: Spotify Web Playback SDK (Premium) ──
// A böngésző maga lesz egy Spotify-eszköz („Kittipedia Osztályterem”); a
// műsorlistát véletlen sorrendben indítjuk, és saját gombokkal vezéreljük.
const VOL_KEY = 'cr-volume'
const savedVolume = () => { try { return Number(localStorage.getItem(VOL_KEY)) || 0.6 } catch { return 0.6 } }

function useSdkPlayer(uri, playlist) {
  const player = useRef(null)
  const [st, setSt] = useState({ ready: false, paused: true, track: null, volume: savedVolume(), error: null })
  const set = (patch) => setSt((s) => ({ ...s, ...patch }))

  useEffect(() => {
    if (!uri) return
    let alive = true
    let p = null
    loadSdk().then((Spotify) => {
      if (!alive) return
      p = new Spotify.Player({
        name: 'Kittipedia Osztályterem',
        getOAuthToken: (cb) => { getToken().then(cb).catch(() => alive && set({ error: 'auth' })) },
        volume: savedVolume(),
      })
      player.current = p
      p.addListener('ready', async ({ device_id: device }) => {
        try {
          // véletlen kezdőszám, utána keverés
          let offset
          try {
            const info = await api(`/playlists/${playlist}?fields=tracks.total`)
            const total = info?.tracks?.total || 0
            if (total > 1) offset = { position: Math.floor(Math.random() * total) }
          } catch { /* nem baj, az elejéről indul */ }
          await api(`/me/player/play?device_id=${device}`, { method: 'PUT', body: { context_uri: uri, ...(offset ? { offset } : {}) } })
          api(`/me/player/shuffle?state=true&device_id=${device}`, { method: 'PUT' }).catch(() => {})
          if (alive) set({ ready: true, error: null })
        } catch {
          if (alive) set({ error: 'play' })
        }
      })
      p.addListener('player_state_changed', (s) => {
        if (!s || !alive) return
        const t = s.track_window?.current_track
        set({
          paused: s.paused,
          track: t ? { name: t.name, artist: t.artists.map((a) => a.name).join(', '), image: t.album?.images?.[0]?.url } : null,
        })
      })
      p.addListener('initialization_error', () => alive && set({ error: 'init' }))
      p.addListener('authentication_error', () => alive && set({ error: 'auth' }))
      p.addListener('account_error', () => alive && set({ error: 'premium' }))
      p.connect()
    }).catch(() => alive && set({ error: 'sdk' }))
    return () => {
      alive = false
      try { p?.disconnect() } catch { /* */ }
      player.current = null
    }
  }, [uri, playlist])

  const call = (fn) => { try { player.current?.activateElement?.() } catch { /* */ } return player.current && fn(player.current) }
  return {
    ...st,
    toggle: () => call((p) => p.togglePlay()),
    pause: () => call((p) => p.pause()),
    resume: () => call((p) => p.resume()),
    next: () => call((p) => p.nextTrack()),
    prev: () => call((p) => p.previousTrack()),
    setVolume: (v) => {
      set({ volume: v })
      try { localStorage.setItem(VOL_KEY, String(v)) } catch { /* */ }
      call((p) => p.setVolume(v))
    },
  }
}

const SDK_ERRORS = {
  auth: 'Lejárt a Spotify-kapcsolat – csatlakozz újra.',
  premium: 'A saját lejátszóhoz Spotify Premium kell.',
  play: 'Nem sikerült elindítani a lejátszást. Próbáld a lejátszás gombbal.',
  init: 'Ez a böngésző nem támogatja a Spotify lejátszót.',
  sdk: 'A Spotify lejátszó nem töltődött be. Ellenőrizd az internetkapcsolatot.',
}

function MusicBar({ m }) {
  if (m.error && m.error !== 'play') {
    return (
      <div className="cr-mbar cr-mbar--error">
        <span>{SDK_ERRORS[m.error] || SDK_ERRORS.sdk}</span>
        {m.error === 'auth' && <button className="cr-pillbtn cr-pillbtn--sm" onClick={() => connect()}>Csatlakozás</button>}
      </div>
    )
  }
  return (
    <div className="cr-mbar">
      <span className="cr-mbar__art">{m.track?.image ? <img src={m.track.image} alt="" /> : <Icon.music />}</span>
      <span className="cr-mbar__text">
        <b>{m.track?.name || (m.ready ? '…' : 'Kapcsolódás a Spotify-hoz…')}</b>
        <small>{m.track?.artist || (m.error === 'play' ? SDK_ERRORS.play : '')}</small>
      </span>
      <span className="cr-mbar__ctrls">
        <button className="cr-mbtn" onClick={m.prev} aria-label="Előző szám"><Icon.prev /></button>
        <button className="cr-mbtn cr-mbtn--main" onClick={m.toggle} aria-label={m.paused ? 'Zene indítása' : 'Zene szüneteltetése'}>
          {m.paused ? <Icon.play /> : <Icon.pause />}
        </button>
        <button className="cr-mbtn" onClick={m.next} aria-label="Következő szám"><Icon.skip /></button>
      </span>
      <label className="cr-mbar__vol" title="Hangerő">
        <Icon.sound />
        <input type="range" min="0" max="1" step="0.05" value={m.volume} onChange={(e) => m.setVolume(Number(e.target.value))} aria-label="Hangerő" />
      </label>
    </div>
  )
}

// ── Futó nézet: egyetlen elem, ami teljes képernyő és kompakt között vált ──
// (így a zene váltáskor sem szakad meg)
export function SessionPlayer({ session, onMode, onClose }) {
  const ch = MUSIC_CHANNELS.find((c) => c.id === session.music)
  const id = playlistId(session.link)
  const host = useRef(null)
  // Ha Spotify-fiókkal csatlakozva vagy: saját lejátszó; különben a beágyazott Spotify-sáv
  const [useSdk] = useState(() => isConfigured() && isConnected())
  const uri = id ? `spotify:playlist:${id}` : null
  const sdk = useSdkPlayer(useSdk ? uri : null, id)
  const embed = useSpotify(host, useSdk ? null : uri)
  const music = useSdk ? sdk : embed
  const [done, setDone] = useState(false)
  const full = session.mode === 'full'

  const timer = useCountdown(session.seconds || 0, () => {
    setDone(true)
    music.pause()
    play('alarm')
  })
  const hasTimer = Boolean(session.seconds)
  const extend = (s) => {
    if (done) music.resume()
    setDone(false)
    timer.add(s)
  }

  useEffect(() => {
    if (!full) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onMode('compact') }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey) }
  }, [full, onMode])

  return createPortal(
    <motion.div
      role="region"
      className={`cr-session ${full ? 'cr-session--full' : 'cr-session--compact'} ${done ? 'is-done' : ''}`}
      style={{ '--tool': COLOR, '--ch': ch?.color || COLOR }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      aria-label="Időzítő és zene"
    >
      <div className="cr-session__top">
        {ch && <span className="cr-session__ch"><span aria-hidden="true">{ch.icon}</span> {ch.label}</span>}
        <span className="cr-spacer" />
        <button className="cr-iconbtn cr-session__btn" onClick={() => onMode(full ? 'compact' : 'full')}
          aria-label={full ? 'Kompakt nézet' : 'Teljes képernyő'} title={full ? 'Kompakt nézet' : 'Teljes képernyő'}>
          {full ? <Icon.compact /> : <Icon.expand />}
        </button>
        <button className="cr-iconbtn cr-session__btn" onClick={onClose} aria-label="Leállítás és bezárás" title="Leállítás"><Icon.close /></button>
      </div>

      <div className="cr-session__main">
        {hasTimer ? (
          <>
            <div className="cr-session__time" aria-live="polite">{fmtTime(timer.left)}</div>
            {done && <p className="cr-session__msg">Lejárt az idő!</p>}
            <div className="cr-session__ctrls">
              <button className="cr-sbtn" onClick={() => { setDone(false); timer.reset() }} aria-label="Időzítő újra" title="Újra"><Icon.reset /></button>
              <button className="cr-sbtn cr-sbtn--main" onClick={() => (done ? extend(60) : timer.toggle())}
                aria-label={timer.running ? 'Időzítő szünet' : 'Időzítő indítása'}>
                {timer.running ? <Icon.pause /> : <Icon.play />}
              </button>
              <button className="cr-sbtn cr-sbtn--text" onClick={() => extend(60)} title="Meghosszabbítás 1 perccel">+1 perc</button>
              <button className="cr-sbtn cr-sbtn--text" onClick={() => extend(300)} title="Meghosszabbítás 5 perccel">+5 perc</button>
            </div>
          </>
        ) : (
          full && ch && <div className="cr-session__icon" aria-hidden="true">{ch.icon}</div>
        )}
      </div>

      {id && (
        <div className="cr-session__music">
          {useSdk ? <MusicBar m={sdk} />
            : embed.error
              ? <p className="cr-hint">A Spotify-lejátszó nem töltődött be. Ellenőrizd az internetkapcsolatot.</p>
              : <div ref={host} className="cr-session__embed" />}
        </div>
      )}
    </motion.div>,
    document.body,
  )
}
