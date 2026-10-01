import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation, useLanguage } from '../i18n/LanguageContext.jsx'
import './Navbar.css'

function NavIcon({ section }) {
  if (section === 'about') {
    return (
      <svg className="nav-icon nav-icon--heart" viewBox="0 0 14 12" fill="currentColor" aria-hidden="true">
        <path d="M7 11.5C7 11.5 0.5 7.5 0.5 4A3.3 3.3 0 0 1 7 1.8 3.3 3.3 0 0 1 13.5 4C13.5 7.5 7 11.5 7 11.5z"/>
      </svg>
    )
  }
  if (section === 'thinking') {
    return (
      <svg className="nav-icon nav-icon--footprints" viewBox="0 0 12 18" fill="currentColor" aria-hidden="true">
        {/* jobb láb – első lépés, alul */}
        <g className="fp fp--1">
          <ellipse cx="7.5" cy="13.5" rx="2" ry="3" transform="rotate(-10 7.5 13.5)"/>
          <ellipse cx="6" cy="9.8" rx="0.8" ry="0.65"/>
          <ellipse cx="7.5" cy="9.2" rx="0.8" ry="0.65"/>
          <ellipse cx="9" cy="9.8" rx="0.8" ry="0.65"/>
        </g>
        {/* bal láb – második lépés, felül */}
        <g className="fp fp--2">
          <ellipse cx="4.5" cy="5.5" rx="2" ry="3" transform="rotate(10 4.5 5.5)"/>
          <ellipse cx="3" cy="1.8" rx="0.8" ry="0.65"/>
          <ellipse cx="4.5" cy="1.2" rx="0.8" ry="0.65"/>
          <ellipse cx="6" cy="1.8" rx="0.8" ry="0.65"/>
        </g>
      </svg>
    )
  }
  if (section === 'works') {
    return (
      <svg className="nav-icon nav-icon--handshake" viewBox="0 0 30 11" fill="currentColor" aria-hidden="true">
        <g className="hand hand--left">
          <rect x="1" y="4.5" width="7" height="2.5" rx="1.2"/>
          <rect x="7.5" y="2" width="5.5" height="8" rx="2"/>
          <rect x="9.5" y="0.5" width="2.8" height="3.5" rx="1.4"/>
        </g>
        <g className="hand hand--right">
          <rect x="22" y="4.5" width="7" height="2.5" rx="1.2"/>
          <rect x="17" y="2" width="5.5" height="8" rx="2"/>
          <rect x="17.7" y="0.5" width="2.8" height="3.5" rx="1.4"/>
        </g>
      </svg>
    )
  }
  return null
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const t = useTranslation()
  const { language, setLanguage } = useLanguage()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const sections = ['about', 'thinking', 'works']
    const observers = sections.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      )
      obs.observe(el)
      return obs
    }).filter(Boolean)
    return () => observers.forEach((obs) => obs.disconnect())
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
          <img src="/logo.svg" alt="H. Óvári Kitti" className="navbar__logo-short" />
          <img src="/logo-long.svg" alt="H. Óvári Kitti" className="navbar__logo-long" />
        </a>

        {/* Desktop nav */}
        <div className="navbar__right navbar__right--desktop">
          <ul className="navbar__links">
            <li><a href="#about" className={activeSection === 'about' ? 'navbar__link--active' : ''}>{activeSection === 'about' && <NavIcon section="about" />}{t.nav.about}</a></li>
            <li><a href="#thinking" className={activeSection === 'thinking' ? 'navbar__link--active' : ''}>{activeSection === 'thinking' && <NavIcon section="thinking" />}{t.nav.thinking}</a></li>
            <li><a href="#works" className={activeSection === 'works' ? 'navbar__link--active' : ''}>{activeSection === 'works' && <NavIcon section="works" />}{t.nav.works}</a></li>
            <li><a href="/cv-view.html" target="_blank" rel="noopener noreferrer" className="navbar__cta">{t.nav.contact}</a></li>
          </ul>
          <div className="navbar__lang">
            <button className={language === 'hu' ? 'navbar__lang-btn navbar__lang-btn--active' : 'navbar__lang-btn'} onClick={() => setLanguage('hu')}>HU</button>
            <span className="navbar__lang-divider">|</span>
            <button className={language === 'en' ? 'navbar__lang-btn navbar__lang-btn--active' : 'navbar__lang-btn'} onClick={() => setLanguage('en')}>EN</button>
          </div>
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
            <a href="#about" onClick={closeMenu}>{t.nav.about}</a>
            <a href="#thinking" onClick={closeMenu}>{t.nav.thinking}</a>
            <a href="#works" onClick={closeMenu}>{t.nav.works}</a>
            <a href="/cv-view.html" target="_blank" rel="noopener noreferrer" className="navbar__cta" onClick={closeMenu}>{t.nav.contact}</a>
            <div className="navbar__mobile-bottom">
              <div className="navbar__lang">
                <button className={language === 'hu' ? 'navbar__lang-btn navbar__lang-btn--active' : 'navbar__lang-btn'} onClick={() => { setLanguage('hu'); closeMenu(); }}>HU</button>
                <span className="navbar__lang-divider">|</span>
                <button className={language === 'en' ? 'navbar__lang-btn navbar__lang-btn--active' : 'navbar__lang-btn'} onClick={() => { setLanguage('en'); closeMenu(); }}>EN</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
