import { useEffect, useReducer, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage, useTranslation } from '../i18n/LanguageContext.jsx'
import { areaArt } from '../components/AreaIllustrations.jsx'
import PasswordModal from '../components/PasswordModal.jsx'
import {
  AREAS, LANGUAGE_PROFILES, isLanguageArea, isUnlocked, unlockedLanguageAreas,
  refreshSession, onSessionChange,
} from '../lib/unlock.js'
import '../components/Hero.css'
import './Landing.css'

const ease = [0.22, 1, 0.36, 1]
const rise = (i) => ({
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.1 + i * 0.1, ease } },
})

function LockIcon({ open }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.8" />
      <path d={open ? 'M5.5 7V5.2a2.5 2.5 0 0 1 4.9-.7' : 'M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7'} />
    </svg>
  )
}

/*
  A nyitóoldal két módban fut:
  - sima nyitóoldal (/): a csempére kattintva nyílik a jelszómodal,
    helyes jelszó után a területi aloldalra navigálunk;
  - „kapu” mód (gateArea): ha valaki közvetlen URL-lel érkezik egy zárolt
    aloldalra, a nyitóoldal homályosítva látszik, előtte a modal. Helyes
    jelszó után az aloldal betölt (az URL marad), bezáráskor a nyitóoldalra
    kerül vissza.
*/
function Landing({ gateArea = null, onUnlock }) {
  const { language, setLanguage } = useLanguage()
  const t = useTranslation()
  const l = t.landing
  const navigate = useNavigate()
  const [pending, setPending] = useState(gateArea)

  // A lakat ikonok állapotát a szervertől kérdezzük (a süti HttpOnly, a JS nem látja)
  const [, rerender] = useReducer((x) => x + 1, 0)
  useEffect(() => {
    const off = onSessionChange(rerender)
    if (!gateArea) refreshSession()
    return off
  }, [gateArea])

  // A Nyelvoktatás csempe mögött csoportonként külön terület van (language-9b, …)
  const tileKey = (key) => (isLanguageArea(key) ? 'language' : key)
  const titleOf = (key) => l.areas.find((a) => a.key === tileKey(key))?.title ?? (key === 'teacher' ? 'Osztályterem' : '')
  const tileOpen = (key) => (key === 'language' ? unlockedLanguageAreas().length > 0 : isUnlocked(key))

  const openArea = (e, key) => {
    e.preventDefault()
    if (key === 'language') {
      // Ha pontosan egy csoport van feloldva, egyenesen annak az oldalára megyünk
      const open = unlockedLanguageAreas()
      if (open.length === 1) navigate(AREAS[open[0]].path)
      else setPending('language')
      return
    }
    if (isUnlocked(key)) navigate(AREAS[key].path)
    else setPending(key)
  }

  // A modal a ténylegesen feloldott terület azonosítójával hív vissza
  const handleSuccess = (unlockedArea) => {
    setPending(null)
    if (gateArea && unlockedArea === gateArea) onUnlock?.()
    else navigate(AREAS[unlockedArea].path)
  }

  const handleClose = () => {
    setPending(null)
    if (gateArea) navigate('/', { replace: true })
  }

  return (
    <div className="home">
      {/* Fejléc: logó + nyelvváltó */}
      <motion.header
        className="home__bar container"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease }}
      >
        <h1 className="home__brand">
          <Link to="/" aria-label={l.title}><img src="/images/logo-light.svg" alt={l.title} /></Link>
        </h1>
        <div className="hero-controls">
          <button className={`hc-lang ${language === 'hu' ? 'hc-lang--active' : ''}`} onClick={() => setLanguage('hu')}>HU</button>
          <span className="hc-divider" />
          <button className={`hc-lang ${language === 'en' ? 'hc-lang--active' : ''}`} onClick={() => setLanguage('en')}>EN</button>
        </div>
      </motion.header>

      <main className="home__main container">
        {/* Három terület – a fő hangsúly */}
        <nav className="areas" aria-label={l.title}>
          {l.areas.map((a, i) => {
            const Art = areaArt[a.key]
            const open = tileOpen(a.key)
            return (
              <motion.div key={a.key} className="areas__cell" variants={rise(i)} initial="hidden" animate="visible">
                <Link
                  to={a.to}
                  className={`area area--${a.key}`}
                  onClick={(e) => openArea(e, a.key)}
                  aria-haspopup={open ? undefined : 'dialog'}
                >
                  <span className="area__lock"><LockIcon open={open} /></span>
                  <span className="area__art"><Art /></span>
                  <span className="area__foot">
                    <span className="area__title" lang={language}>{a.title}</span>
                    <span className="area__go" aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                    </span>
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Saját appok – vonallal leválasztva, középen, kompakt kártyákon */}
        <motion.section
          className="apps" aria-labelledby="apps-label"
          variants={rise(3)} initial="hidden" animate="visible"
        >
          <div className="apps__divider" role="presentation">
            <span />
            <h2 id="apps-label" className="apps__label">{l.appsLabel}</h2>
            <span />
          </div>
          <div className="apps__row">
            {l.apps.map((app) => (
              <a key={app.key} href={app.url} target="_blank" rel="noopener noreferrer" className={`app app--${app.key}`}>
                {app.key === 'gombarat'
                  ? <span className="app__badge"><img src={app.logo} alt="" /></span>
                  : <img src={app.logo} alt="" className="app__logo" />}
                <span className="app__text">
                  <span className="app__name">{app.name}</span>
                  <span className="app__tagline">{app.tagline}</span>
                </span>
                <span className="app__ext" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </motion.section>
      </main>

      <footer className="home__foot container">© {new Date().getFullYear()} H. Óvári Kitti</footer>

      <AnimatePresence>
        {pending && (
          <PasswordModal
            key={isLanguageArea(pending) ? 'language' : pending}
            area={pending}
            title={titleOf(pending)}
            // Nyelvoktatás: profilválasztó; közvetlen osztály-URL-nél előre kijelölve
            profiles={isLanguageArea(pending) ? LANGUAGE_PROFILES : null}
            initialProfile={pending !== 'language' && isLanguageArea(pending) ? pending : null}
            onSuccess={handleSuccess}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Landing
