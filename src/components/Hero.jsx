import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './Hero.css'

const card = (i) => ({
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.45, 0, 0.55, 1] },
  },
})

function Hero() {
  const { language, setLanguage } = useLanguage()

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
          </div>
        </motion.div>

        {/* ── Portrait card ── */}
        <motion.div
          className="bento-card bento-card--portrait"
          variants={card(1)} initial="hidden" animate="visible"
        >
          <div className="bento-card__toprow">
            <img
              src="/images/logo-light.svg"
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

          <motion.a href="#cv" className="bento-card bento-card--cv" variants={card(3)} initial="hidden" animate="visible">
            <span className="bento-card__label">CV / Önéletrajz</span>
            <span className="bento-card__arrow">↓</span>
          </motion.a>

          <motion.a href="#footer" className="bento-card bento-card--contact" variants={card(4)} initial="hidden" animate="visible">
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
