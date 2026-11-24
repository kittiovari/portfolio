import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useAnimationControls } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext.jsx'
import { checkPassword } from '../lib/unlock.js'
import { areaArt } from './AreaIllustrations.jsx'
import './PasswordModal.css'

const ease = [0.22, 1, 0.36, 1]

// Középre nyíló, üveghatású jelszómodal homályosított háttérrel.
// Bezárás: X gomb, Esc, vagy kattintás a háttérre.
function PasswordModal({ area, title, onSuccess, onClose }) {
  const t = useTranslation()
  const [value, setValue] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)
  const dialogRef = useRef(null)
  const shake = useAnimationControls()
  const Art = areaArt[area]

  // Görgetés tiltása a modal alatt, fókusz vissza a korábbi elemre bezáráskor
  useEffect(() => {
    const prevFocus = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const id = setTimeout(() => inputRef.current?.focus(), 60)
    return () => {
      clearTimeout(id)
      document.body.style.overflow = prevOverflow
      if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true })
    }
  }, [])

  // Esc = bezárás, Tab a modalon belül marad
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      if (e.key === 'Tab' && dialogRef.current) {
        const items = dialogRef.current.querySelectorAll('button, input, [href], [tabindex]:not([tabindex="-1"])')
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    const res = await checkPassword(area, value)
    setBusy(false)
    if (res.ok) {
      onSuccess()
      return
    }
    // Hibaüzenet a hiba okától függően (a szerver dönt, nem a böngésző)
    if (res.reason === 'locked') {
      const minutes = Math.max(1, Math.ceil((res.retryAfter || 900) / 60))
      setError(t.gate.locked.replace('{n}', minutes))
    } else if (res.reason === 'unavailable') {
      setError(t.gate.unavailable)
    } else {
      setError(t.gate.wrong)
    }
    shake.start({ x: [0, -10, 10, -7, 7, -3, 0], transition: { duration: 0.45 } })
    inputRef.current?.select()
  }

  return createPortal(
    <motion.div
      className="pw-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease }}
    >
      <motion.div
        ref={dialogRef}
        className={`pw-dialog pw-dialog--${area}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pw-title"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.45, ease }}
      >
        <button type="button" className="pw-close" onClick={onClose} aria-label={t.gate.close}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
        </button>

        <div className="pw-art" aria-hidden="true">{Art && <Art />}</div>
        <h2 id="pw-title" className="pw-title">{title}</h2>
        <p className="pw-prompt">{t.gate.prompt}</p>

        <motion.form className="pw-form" onSubmit={submit} animate={shake}>
          <div className={`pw-field ${error ? 'pw-field--error' : ''}`}>
            <svg className="pw-field__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <rect x="3.5" y="7" width="9" height="6.5" rx="1.8" />
              <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" />
            </svg>
            <input
              ref={inputRef}
              type={show ? 'text' : 'password'}
              className="pw-input"
              placeholder={t.gate.placeholder}
              aria-label={t.gate.placeholder}
              aria-invalid={!!error}
              aria-describedby={error ? 'pw-error' : undefined}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={value}
              onChange={(e) => { setValue(e.target.value); setError('') }}
            />
            <button
              type="button"
              className="pw-eye"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? t.gate.hide : t.gate.show}
              aria-pressed={show}
            >
              {show ? (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" /><circle cx="10" cy="10" r="2.5" /><path d="M3 17L17 3" /></svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" /><circle cx="10" cy="10" r="2.5" /></svg>
              )}
            </button>
          </div>
          <p id="pw-error" className="pw-error" role="alert">{error}</p>
          <button type="submit" className="pw-submit" disabled={busy || !value.trim()}>
            {busy ? t.gate.checking : t.gate.submit}
            {!busy && <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>}
          </button>
        </motion.form>
      </motion.div>
    </motion.div>,
    document.body
  )
}

export default PasswordModal
