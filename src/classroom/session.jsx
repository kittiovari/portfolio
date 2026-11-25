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

const PRESETS = [15, 30, 60, 300, 600] // másodperc – nagyobb nem kell
const fmtPreset = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// Relax / Active – vonalrajzos babszem-figurák az oldal illusztrációinak stílusában
export function ChannelArt({ id, className = 'cr-chart' }) {
  const body = (cx, base, w, h, fill) => {
    const l = cx - w / 2, r = cx + w / 2, t = base - h
    return <path d={`M${l} ${base}C${l - 0.3} ${base - h * 0.6} ${l + w * 0.06} ${t + h * 0.12} ${cx} ${t}C${r - w * 0.06} ${t + h * 0.12} ${r + 0.3} ${base - h * 0.6} ${r} ${base}Z`} fill={fill} />
  }
  return (
    <svg className={className} viewBox="0 0 48 40" fill="none" stroke="#241422" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {id === 'relax' ? (
        <>
          {/* csukott szemmel pihenő figura, mellette levél */}
          {body(20, 36, 18, 26, '#CFE3D3')}
          <path d="M14.5 21.5q2 1.6 4 0M21.5 21.5q2 1.6 4 0" />
          <path d="M17.5 27q2.5 1.8 5 0" />
          <path d="M33 34c-1-6 2-11 9-12-1 7-4 11-9 12z" fill="#A9D18E" />
          <path d="M33 34c2-3.5 4.5-6.5 8-10.5" strokeWidth="1.3" />
          <path d="M6 37h34" opacity=".3" />
          <path d="M30 9c1.2-1 2.6-1 3.6 0M35 6c1.2-1 2.6-1 3.6 0" strokeWidth="1.3" opacity=".6" />
        </>
      ) : (
        <>
          {/* ugró figura mozgásvonalakkal */}
          {body(24, 31, 17, 25, '#F7D2B5')}
          <circle cx="20.3" cy="15.5" r="1.3" fill="#241422" stroke="none" />
          <circle cx="27.7" cy="15.5" r="1.3" fill="#241422" stroke="none" />
          <path d="M20 20.5q4 4 8 0" fill="#241422" />
          <path d="M15.5 17l-5-5M32.5 17l5-5" />
          <path d="M20 31l-2 5M28 31l2 5" />
          <path d="M5 22h5M4 27h4M38 22h5M40 27h4" strokeWidth="1.3" opacity=".6" />
        </>
      )}
    </svg>
  )
}

// ── Beállító panel: időzítő (alapból be) és zene (alapból ki) kapcsolóval ──
export function SessionSetup({ doc, onStart, onClose, onBack }) {
  const [timerOn, setTimerOn] = useState(true)
  const [secs, setSecs] = useState(300)
  const [customOpen, setCustomOpen] = useState(false)
  const [custom, setCustom] = useState({ m: 3, s: 0 })
  const [musicOn, setMusicOn] = useState(false)
  const [music, setMusic] = useState('relax')

  const seconds = timerOn ? (customOpen ? custom.m * 60 + custom.s : secs) : null
  const canStart = Boolean((timerOn && seconds > 0) || musicOn)

  return (
    <Sheet title="Timer & music" color={COLOR} icon={<Icon.timer />} onClose={onClose} onBack={onBack} className="cr-sheet--compact cr-setup">
      <div className="cr-setup__row">
        <label className="cr-setup__toggle">
          <span className={`cr-switch ${timerOn ? 'is-on' : ''}`}><input type="checkbox" checked={timerOn} onChange={(e) => setTimerOn(e.target.checked)} /><i /></span>
          <b>Timer</b>
        </label>
        {timerOn && (
          <>
            <div className="cr-presets cr-presets--sm">
              {PRESETS.map((p) => (
                <button key={p} className={`cr-preset ${!customOpen && secs === p ? 'is-active' : ''}`} onClick={() => { setSecs(p); setCustomOpen(false) }}>{fmtPreset(p)}</button>
              ))}
              <button className={`cr-preset cr-preset--plus ${customOpen ? 'is-active' : ''}`} onClick={() => setCustomOpen(true)} aria-label="Custom time"><Icon.plus /></button>
            </div>
            {customOpen && (
              <div className="cr-custom">
                <input type="number" min="0" max="10" value={custom.m} onChange={(e) => setCustom({ ...custom, m: Math.max(0, Math.min(10, Number(e.target.value) || 0)) })} aria-label="Minutes" /> min
                <input type="number" min="0" max="59" value={custom.s} onChange={(e) => setCustom({ ...custom, s: Math.max(0, Math.min(59, Number(e.target.value) || 0)) })} aria-label="Seconds" /> sec
              </div>
            )}
          </>
        )}
      </div>

      <div className="cr-setup__row">
        <label className="cr-setup__toggle">
          <span className={`cr-switch ${musicOn ? 'is-on' : ''}`}><input type="checkbox" checked={musicOn} onChange={(e) => setMusicOn(e.target.checked)} /><i /></span>
          <b>Music</b>
        </label>
        {musicOn && (
          <>
            <div className="cr-chans">
              {MUSIC_CHANNELS.map((c) => (
                <button key={c.id} className={`cr-chan ${music === c.id ? 'is-active' : ''}`} onClick={() => setMusic(c.id)} style={{ '--ch': c.color }}>
                  <ChannelArt id={c.id} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
            <div className="cr-setup__links"><SpotifyStatus /></div>
          </>
        )}
      </div>

      <button className="cr-btn cr-btn--primary cr-setup__go" disabled={!canStart}
        onClick={() => onStart({ music: musicOn ? music : null, link: musicOn ? linkOf(doc, music) : null, seconds, mode: 'full', key: Date.now() })}>
        <Icon.play />Start
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
      <span className="cr-spotify__dot" />Spotify connected
      <button className="cr-link" onClick={() => { disconnect(); setOn(false) }}>Disconnect</button>
    </span>
  ) : (
    <button className="cr-spotify" onClick={() => connect()}>
      <span className="cr-spotify__dot" />Connect your Spotify account
    </button>
  )
}

// Visszatérés a Spotify bejelentkezés után (/osztalyterem/spotify)
export function SpotifyCallback() {
  const [msg, setMsg] = useState('Connecting to Spotify…')
  useEffect(() => {
    finishLogin(window.location.search).then(({ ok, back, error }) => {
      if (ok) window.location.replace(back)
      else setMsg(error === 'access_denied' ? 'You didn\'t allow the Spotify connection.' : 'Couldn\'t connect to Spotify.')
    })
  }, [])
  return (
    <div className="cr cr-callback">
      <p>{msg}</p>
      <a className="cr-btn" href="/osztalyterem">Back to the Classroom</a>
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
        name: 'Kittipedia Classroom',
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
  auth: 'Spotify connection expired – please reconnect.',
  premium: 'The built-in player needs Spotify Premium.',
  play: 'Couldn\'t start playback. Try the play button.',
  init: 'This browser doesn\'t support the Spotify player.',
  sdk: 'The Spotify player didn\'t load. Check your internet connection.',
}

function MusicBar({ m }) {
  if (m.error && m.error !== 'play') {
    return (
      <div className="cr-mbar cr-mbar--error">
        <span>{SDK_ERRORS[m.error] || SDK_ERRORS.sdk}</span>
        {m.error === 'auth' && <button className="cr-pillbtn cr-pillbtn--sm" onClick={() => connect()}>Connect</button>}
      </div>
    )
  }
  return (
    <div className="cr-mbar">
      <span className="cr-mbar__art">{m.track?.image ? <img src={m.track.image} alt="" /> : <Icon.music />}</span>
      <span className="cr-mbar__text">
        <b>{m.track?.name || (m.ready ? '…' : 'Connecting to Spotify…')}</b>
        <small>{m.track?.artist || (m.error === 'play' ? SDK_ERRORS.play : '')}</small>
      </span>
      <span className="cr-mbar__ctrls">
        <button className="cr-mbtn" onClick={m.prev} aria-label="Previous track"><Icon.prev /></button>
        <button className="cr-mbtn cr-mbtn--main" onClick={m.toggle} aria-label={m.paused ? 'Play music' : 'Pause music'}>
          {m.paused ? <Icon.play /> : <Icon.pause />}
        </button>
        <button className="cr-mbtn" onClick={m.next} aria-label="Next track"><Icon.skip /></button>
      </span>
      <label className="cr-mbar__vol" title="Volume">
        <Icon.sound />
        <input type="range" min="0" max="1" step="0.05" value={m.volume} onChange={(e) => m.setVolume(Number(e.target.value))} aria-label="Volume" />
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
      aria-label="Timer & music"
    >
      <div className="cr-session__top">
        {ch && <span className="cr-session__ch"><ChannelArt id={ch.id} className="cr-chart cr-chart--sm" /> {ch.label}</span>}
        <span className="cr-spacer" />
        <button className="cr-iconbtn cr-session__btn" onClick={() => onMode(full ? 'compact' : 'full')}
          aria-label={full ? 'Compact view' : 'Full screen'} title={full ? 'Compact view' : 'Full screen'}>
          {full ? <Icon.compact /> : <Icon.expand />}
        </button>
        <button className="cr-iconbtn cr-session__btn" onClick={onClose} aria-label="Stop and close" title="Stop"><Icon.close /></button>
      </div>

      <div className="cr-session__main">
        {hasTimer ? (
          <>
            <div className="cr-session__time" aria-live="polite">{fmtTime(timer.left)}</div>
            {done && <p className="cr-session__msg">Time's up!</p>}
            <div className="cr-session__ctrls">
              <button className="cr-sbtn" onClick={() => { setDone(false); timer.reset() }} aria-label="Restart timer" title="Restart"><Icon.reset /></button>
              <button className="cr-sbtn cr-sbtn--main" onClick={() => (done ? extend(60) : timer.toggle())}
                aria-label={timer.running ? 'Pause timer' : 'Start timer'}>
                {timer.running ? <Icon.pause /> : <Icon.play />}
              </button>
              <button className="cr-sbtn cr-sbtn--text" onClick={() => extend(60)} title="Add 1 minute">+1 min</button>
              <button className="cr-sbtn cr-sbtn--text" onClick={() => extend(300)} title="Add 5 minutes">+5 min</button>
            </div>
          </>
        ) : (
          full && ch && <div className="cr-session__icon" aria-hidden="true"><ChannelArt id={ch.id} className="cr-chart cr-chart--xl" /></div>
        )}
      </div>

      {id && (
        <div className="cr-session__music">
          {useSdk ? <MusicBar m={sdk} />
            : embed.error
              ? <p className="cr-hint">The Spotify player didn't load. Check your internet connection.</p>
              : <div ref={host} className="cr-session__embed" />}
        </div>
      )}
    </motion.div>,
    document.body,
  )
}
