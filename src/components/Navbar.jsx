import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation, useLanguage } from '../i18n/LanguageContext.jsx'
import './Navbar.css'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const t = useTranslation()
  const { language, setLanguage } = useLanguage()

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
          <img src="/logo.svg" alt="H. Óvári Kitti" className="navbar__logo-short" />
          <img src="/logo-long.svg" alt="H. Óvári Kitti" className="navbar__logo-long" />
        </a>

        {/* Desktop nav */}
        <div className="navbar__right navbar__right--desktop">
          <ul className="navbar__links">
            <li><a href="#about">{t.nav.about}</a></li>
            <li><a href="#works">{t.nav.works}</a></li>
            <li><a href="#footer" className="navbar__cta">{t.nav.contact}</a></li>
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
            <a href="#works" onClick={closeMenu}>{t.nav.works}</a>
            <a href="#footer" onClick={closeMenu}>{t.nav.contact}</a>
            <div className="navbar__lang">
              <button className={language === 'hu' ? 'navbar__lang-btn navbar__lang-btn--active' : 'navbar__lang-btn'} onClick={() => { setLanguage('hu'); closeMenu(); }}>HU</button>
              <span className="navbar__lang-divider">|</span>
              <button className={language === 'en' ? 'navbar__lang-btn navbar__lang-btn--active' : 'navbar__lang-btn'} onClick={() => { setLanguage('en'); closeMenu(); }}>EN</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
