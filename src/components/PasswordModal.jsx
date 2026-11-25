import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext.jsx'
import { checkPassword, isUnlocked } from '../lib/unlock.js'
import { areaArt, profileArt } from './AreaIllustrations.jsx'
import './PasswordModal.css'

const ease = [0.22, 1, 0.36, 1]

/*
  Középre nyíló, üveghatású jelszómodal homályosított háttérrel.
  Bezárás: X gomb, Esc, vagy kattintás a háttérre.

  Két mód:
  - egy terület (area): rögtön a jelszómező látszik;
  - profilválasztó (profiles: [{ area, label }]): előbb kör alakú profilok
    egy sorban, kiválasztás után a kiválasztott profil jelszómezője.
    initialProfile: előre kijelölt profil (pl. közvetlen URL esetén).
  onSuccess(area): a sikeresen feloldott terület azonosítójával hívódik.
*/
function PasswordModal({ area, title, profiles = null, initialProfile = null, onSuccess, onClose }) {
  const t = useTranslation()
  const [selected, setSelected] = useState(profiles ? initialProfile : area)
  const [value, setValue] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)
  const dialogRef = useRef(null)
  const shake = useAnimationControls()
  const Art = profiles ? null : areaArt[area]
  const selectedProfile = profiles?.find((p) => p.area === selected)

  // Görgetés tiltása a modal alatt, fókusz vissza a korábbi elemre bezáráskor
  useEffect(() => {
    const prevFocus = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // A mögöttes oldal elmosása (lásd PasswordModal.css: body.pw-open #root)
    document.body.classList.add('pw-open')
    const id = setTimeout(() => {
      if (selected) inputRef.current?.focus()
      else dialogRef.current?.querySelector('.pw-profile')?.focus()
    }, 60)
    return () => {
      clearTimeout(id)
      document.body.classList.remove('pw-open')
      document.body.style.overflow = prevOverflow
      if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true })
    }
    // csak megnyitáskor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Esc = bezárás, Tab a modalon belül marad
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      if (e.key === 'Tab' && dialogRef.current) {
        const items = dialogRef.current.querySelectorAll('button:not([disabled]), input, [href], [tabindex]:not([tabindex="-1"])')
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

  const chooseProfile = (profileArea) => {
    // Ha ez a csoport már fel van oldva ebben a böngészőben, nem kell jelszó
    if (isUnlocked(profileArea)) {
      onSuccess(profileArea)
      return
    }
    setSelected(profileArea)
    setValue('')
    setError('')
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (busy || !selected) return
    setBusy(true)
    const res = await checkPassword(selected, value)
    setBusy(false)
    if (res.ok) {
      onSuccess(selected)
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

  const prompt = profiles
    ? (selectedProfile
      ? (selectedProfile.area === 'teacher' ? t.gate.promptTeacher : t.gate.promptFor.replace('{name}', selectedProfile.label))
      : t.gate.choose)
    : t.gate.prompt

  return createPortal(
    <motion.div
      className="pw-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease }}
    >
      <motion.div
        ref={dialogRef}
        className={`pw-dialog pw-dialog--${profiles ? 'language' : area}`}
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

        {Art && <div className="pw-art" aria-hidden="true"><Art /></div>}
        <h2 id="pw-title" className="pw-title">{title}</h2>
        <p className="pw-prompt" aria-live="polite">{prompt}</p>

        {/* Profilválasztó: körök egy sorban */}
        {profiles && (
          <div className="pw-profiles" role="radiogroup" aria-label={t.gate.choose}>
            {profiles.map((p) => {
              const PArt = profileArt[p.area]
              const active = p.area === selected
              return (
                <button
                  key={p.area}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`pw-profile ${active ? 'pw-profile--active' : ''}`}
                  onClick={() => chooseProfile(p.area)}
                >
                  <span className={`pw-profile__circle pw-profile__circle--${p.area}`}>
                    {PArt && <PArt />}
                  </span>
                  <span className="pw-profile__label">{p.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Jelszómező: profil módban csak kiválasztás után */}
        <AnimatePresence initial={false}>
          {selected && (
            <motion.div
              key="form"
              className="pw-form-wrap"
              initial={profiles ? { opacity: 0, height: 0 } : false}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease }}
            >
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
                    aria-label={selectedProfile ? `${selectedProfile.label} – ${t.gate.placeholder}` : t.gate.placeholder}
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
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>,
    document.body
  )
}

export default PasswordModal
