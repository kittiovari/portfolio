import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { useTheme } from '../i18n/ThemeContext.jsx'
import './Hero.css'

const card = (i) => ({
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.45, 0, 0.55, 1] },
  },
})

function SunIcon() {
  return (
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
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function Hero() {
  const { language, setLanguage } = useLanguage()
  const { isDark, toggle } = useTheme()

  return (
    <section id="hero" className="hero">
      <div className="container hero__bento">

        {/* ── PORTFOLIO header + controls ── */}
        <motion.div
          className="bento-header"
          variants={card(0)} initial="hidden" animate="visible"
        >
          <span className="bento-portfolio-title">PORTFOLIO</span>
          <div className="hero-controls">
            <button className={`hc-lang ${language === 'hu' ? 'hc-lang--active' : ''}`} onClick={() => setLanguage('hu')}>HU</button>
            <span className="hc-divider" />
            <button className={`hc-lang ${language === 'en' ? 'hc-lang--active' : ''}`} onClick={() => setLanguage('en')}>EN</button>
            <span className="hc-sep" />
            <button className="hc-theme" onClick={toggle} aria-label={isDark ? 'Világos mód' : 'Sötét mód'}>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </motion.div>

        {/* ── Portrait card ── */}
        <motion.div
          className="bento-card bento-card--portrait"
          variants={card(1)} initial="hidden" animate="visible"
        >
          <div className="bento-card__toprow">
            <img
              src={isDark ? '/images/logo-dark.svg' : '/images/logo-light.svg'}
              alt="H. Óvári Kitti"
              className="bento-logo"
            />
            <a href="#about" className="bento-rolam">Rólam →</a>
          </div>
          <div className="bento-portrait-wrap">
            <img src="/images/profile.svg" alt="H. Óvári Kitti" className="bento-portrait-img" />
          </div>
          <div className="bento-identity">
            <span className="bento-greeting">Üdv,</span>
            <strong className="bento-name">H. Óvári Kitti vagyok</strong>
            <a href="mailto:kitti.ovari@gmail.com" className="bento-email">kitti.ovari@gmail.com</a>
          </div>
        </motion.div>

        {/* ── 2×2 card grid ── */}
        <div className="bento-grid">
          <motion.a href="#works" className="bento-card bento-card--works" variants={card(2)} initial="hidden" animate="visible">
            <span className="bento-card__label">UX projektek</span>
            <span className="bento-card__arrow">↗</span>
          </motion.a>

          <motion.div className="bento-card bento-card--stats" variants={card(3)} initial="hidden" animate="visible">
            <div className="bento-stat-row">
              <span className="bento-stat-num">5+</span>
              <span className="bento-stat-unit">Kiemelt projekt</span>
            </div>
            <ul className="bento-stat-list">
              <li>Insurtech &amp; Banki platformok</li>
              <li>AI complaint management</li>
              <li>E-commerce &amp; PropTech</li>
            </ul>
          </motion.div>

          <motion.a href="#cv" className="bento-card bento-card--cv" variants={card(4)} initial="hidden" animate="visible">
            <span className="bento-card__label">CV / Önéletrajz</span>
            <span className="bento-card__arrow">↓</span>
          </motion.a>

          <motion.a href="#footer" className="bento-card bento-card--contact" variants={card(5)} initial="hidden" animate="visible">
            <span className="bento-card__label">Kontakt</span>
            <span className="bento-card__arrow">↗</span>
          </motion.a>
        </div>

      </div>

      <motion.div
        className="hero__scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <div className="hero__scroll-line" />
      </motion.div>
    </section>
  )
}

export default Hero
