import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation, useLanguage } from '../i18n/LanguageContext.jsx'
import { useTheme } from '../i18n/ThemeContext.jsx'
import './Navbar.css'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const t = useTranslation()
  const { language, setLanguage } = useLanguage()
  const { isDark, toggle } = useTheme()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="navbar__inner">
        <a href="#hero" className="navbar__logo" onClick={scrollToTop}>
          <img src={isDark ? '/logo-dark.svg' : '/logo.svg'} alt="H. Óvári Kitti" className="navbar__logo-short" />
          <img src="/logo-long.svg" alt="H. Óvári Kitti" className="navbar__logo-long" />
        </a>

        {/* Desktop nav */}
        <div className="navbar__right navbar__right--desktop">
          <ul className="navbar__links">
            <li><a href="#thinking">{t.nav.thinking}</a></li>
            <li><a href="#about">{t.nav.about}</a></li>
            <li><a href="#works">{t.nav.works}</a></li>
            <li><a href="#footer" className="navbar__cta">{t.nav.contact}</a></li>
          </ul>
          <div className="navbar__lang">
            <button className={language === 'hu' ? 'navbar__lang-btn navbar__lang-btn--active' : 'navbar__lang-btn'} onClick={() => setLanguage('hu')}>HU</button>
            <span className="navbar__lang-divider">|</span>
            <button className={language === 'en' ? 'navbar__lang-btn navbar__lang-btn--active' : 'navbar__lang-btn'} onClick={() => setLanguage('en')}>EN</button>
          </div>
          <button className="navbar__theme-btn" onClick={toggle} aria-label={isDark ? 'Világos mód' : 'Sötét mód'}>
            {isDark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Hamburger button */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span className={`navbar__hamburger-line ${menuOpen ? 'navbar__hamburger-line--open' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__mobile"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.45, 0, 0.55, 1] }}
          >
            <a href="#thinking" onClick={closeMenu}>{t.nav.thinking}</a>
            <a href="#about" onClick={closeMenu}>{t.nav.about}</a>
            <a href="#works" onClick={closeMenu}>{t.nav.works}</a>
            <a href="#footer" onClick={closeMenu}>{t.nav.contact}</a>
            <div className="navbar__mobile-bottom">
              <div className="navbar__lang">
                <button className={language === 'hu' ? 'navbar__lang-btn navbar__lang-btn--active' : 'navbar__lang-btn'} onClick={() => { setLanguage('hu'); closeMenu(); }}>HU</button>
                <span className="navbar__lang-divider">|</span>
                <button className={language === 'en' ? 'navbar__lang-btn navbar__lang-btn--active' : 'navbar__lang-btn'} onClick={() => { setLanguage('en'); closeMenu(); }}>EN</button>
              </div>
              <button className="navbar__theme-btn" onClick={() => { toggle(); closeMenu(); }} aria-label={isDark ? 'Világos mód' : 'Sötét mód'}>
                {isDark ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
