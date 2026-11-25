import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1]

function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose?.() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
}

function useBodyLock() {
  useEffect(() => {
    const prev = document.body.style.overflow
    const prevFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      prevFocus?.focus?.({ preventScroll: true })
    }
  }, [])
}

// Középre nyíló, fehér panel (opcionálisan színes fejléccel)
export function Sheet({ title, color, icon, onClose, onBack, wide, children, className = '' }) {
  useEscape(onClose)
  useBodyLock()
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])
  return createPortal(
    <motion.div
      className="cr-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.() }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`cr-sheet ${wide ? 'cr-sheet--wide' : ''} ${className}`}
        initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.3, ease }}
      >
        {color ? (
          <header className="cr-sheet__hero" style={{ '--tool': color }}>
            {onBack && <button className="cr-iconbtn cr-sheet__back" onClick={onBack} aria-label="Vissza"><Icon.back /></button>}
            {icon && <span className="cr-sheet__heroicon">{icon}</span>}
            <h2>{title}</h2>
          </header>
        ) : (
          title && (
            <header className="cr-sheet__head">
              {onBack && <button className="cr-iconbtn" onClick={onBack} aria-label="Vissza"><Icon.back /></button>}
              <h2>{title}</h2>
            </header>
          )
        )}
        <button className="cr-iconbtn cr-sheet__close" onClick={onClose} aria-label="Bezárás"><Icon.close /></button>
        <div className="cr-sheet__body">{children}</div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}

// Teljes képernyős eszköznézet (időzítő, véletlen választó stb.) – kivetítőre
export function FullScreen({ color, onClose, children, className = '' }) {
  useEscape(onClose)
  useBodyLock()
  return createPortal(
    <motion.div
      className={`cr-full ${className}`}
      style={{ '--tool': color }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
    >
      <button className="cr-iconbtn cr-full__close" onClick={onClose} aria-label="Bezárás"><Icon.close /></button>
      {children}
    </motion.div>,
    document.body,
  )
}

// ── Vonalas ikonok ──
const svg = (d, extra) => (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {typeof d === 'string' ? <path d={d} /> : d}
    {extra}
  </svg>
)

export const Icon = {
  close: svg('M6 6l12 12M18 6L6 18'),
  back: svg('M15 18l-6-6 6-6'),
  plus: svg('M12 5v14M5 12h14'),
  grid: svg(<><circle cx="6" cy="6" r="1.4" /><circle cx="12" cy="6" r="1.4" /><circle cx="18" cy="6" r="1.4" /><circle cx="6" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="18" cy="12" r="1.4" /><circle cx="6" cy="18" r="1.4" /><circle cx="12" cy="18" r="1.4" /><circle cx="18" cy="18" r="1.4" /></>),
  clock: svg(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
  check: svg('M5 12.5l4.5 4.5L19 7.5'),
  checkbox: svg(<><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 12.2l2.8 2.8L16 9.5" /></>),
  shuffle: svg('M4 7h3.5c4.5 0 4.5 10 9 10H20M17 14l3 3-3 3M4 17h3.5c1.6 0 2.6-1.3 3.4-3M13.1 10C13.9 8.3 14.9 7 16.5 7H20M17 4l3 3-3 3'),
  timer: svg(<><circle cx="12" cy="13.5" r="7.5" /><path d="M12 9.5v4l2.5 1.5M9.5 3h5" /></>),
  people: svg(<><circle cx="8" cy="9" r="3" /><circle cx="16.5" cy="9" r="3" /><path d="M2.5 19c.6-3 2.8-4.7 5.5-4.7S12.9 16 13.5 19M11.5 15.3c1.2-.7 2.9-1 5-1 2.7 0 4.9 1.7 5.5 4.7" /></>),
  list: svg(<><path d="M9 6.5h11M9 12h11M9 17.5h11" /><circle cx="4.5" cy="6.5" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="17.5" r="1" /></>),
  bubbles: svg(<><path d="M10 4.5c3.6 0 6.5 2.4 6.5 5.4s-2.9 5.4-6.5 5.4c-.8 0-1.6-.1-2.3-.3L4.5 16.5l.9-3c-1.2-1-1.9-2.2-1.9-3.6 0-3 2.9-5.4 6.5-5.4z" /><path d="M18.5 10.5c1.8.9 3 2.4 3 4.2 0 1.1-.5 2.2-1.4 3l.7 2.4-2.6-1.1c-.6.2-1.3.3-2 .3-2.1 0-3.9-.9-4.9-2.3" /></>),
  sun: svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" /></>),
  pause: svg('M9 6v12M15 6v12'),
  play: svg('M8 5.5v13l10.5-6.5z'),
  reset: svg('M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4'),
  pencil: svg('M15.5 5.5l3 3L8 19H5v-3zM13.5 7.5l3 3'),
  trash: svg('M5 7h14M10 11v6M14 11v6M6.5 7l1 12.5h9l1-12.5M9.5 7V4.5h5V7'),
  download: svg('M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14'),
  sound: svg('M4 9.5v5h3.5L12 18.5V5.5L7.5 9.5zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11'),
  mute: svg('M4 9.5v5h3.5L12 18.5V5.5L7.5 9.5zM16 9.5l5 5M21 9.5l-5 5'),
  next: svg('M9 6l6 6-6 6'),
  expand: svg('M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5'),
  compact: svg('M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5'),
  music: svg(<><path d="M9 18V5.5l11-2V16" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></>),
}

// ── Hangok (WebAudio, nincs külső fájl) ──
let ctx = null
let muted = (() => { try { return localStorage.getItem('cr-muted') === '1' } catch { return false } })()
export const isMuted = () => muted
export const setMuted = (m) => { muted = m; try { localStorage.setItem('cr-muted', m ? '1' : '0') } catch { /* */ } }

function tone(freq, start, dur, type = 'sine', gain = 0.18) {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  const t = ctx.currentTime + start
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(ctx.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

export function play(kind) {
  if (muted) return
  try {
    if (kind === 'positive') { tone(784, 0, 0.18); tone(1046.5, 0.09, 0.32) }
    else if (kind === 'negative') { tone(220, 0, 0.32, 'triangle', 0.22); tone(174.6, 0.12, 0.38, 'triangle', 0.2) }
    else if (kind === 'tick') tone(1200, 0, 0.05, 'square', 0.04)
    else if (kind === 'pick') { tone(660, 0, 0.12); tone(880, 0.1, 0.12); tone(1320, 0.2, 0.35) }
    else if (kind === 'alarm') { for (let i = 0; i < 3; i++) { tone(880, i * 0.5, 0.25); tone(1174.7, i * 0.5 + 0.12, 0.3) } }
    else if (kind === 'phase') { tone(523.3, 0, 0.2); tone(659.3, 0.15, 0.2); tone(784, 0.3, 0.4) }
  } catch { /* hang nélkül is működik */ }
}
