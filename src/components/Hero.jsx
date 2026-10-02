import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage, useTranslation } from '../i18n/LanguageContext.jsx'
import './Hero.css'
import { copyText } from '../utils/clipboard.js'

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
  const t = useTranslation()
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    await copyText('kitti.ovari@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="hero" className="hero">
      <div className="container hero__bento">

        {/* ── PORTFOLIO header + controls ── */}
        <motion.div
          className="bento-header"
          variants={card(0)} initial="hidden" animate="visible"
        >
          <h1 className="bento-portfolio-title">{t.bento.title}</h1>
          <div className="hero-controls">
            <button className={`hc-lang ${language === 'hu' ? 'hc-lang--active' : ''}`} onClick={() => setLanguage('hu')}>HU</button>
            <span className="hc-divider" />
            <button className={`hc-lang ${language === 'en' ? 'hc-lang--active' : ''}`} onClick={() => setLanguage('en')}>EN</button>
          </div>
        </motion.div>

        {/* ── Tiles: portrait + the three links ── */}
        <div className="bento-grid">
          {/* Lead tile: portrait */}
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
              <a href="#about" className="bento-rolam">{t.bento.about} →</a>
            </div>
            <div className="bento-portrait-wrap">
              <img src="/images/profile.svg" alt="H. Óvári Kitti" className="bento-portrait-img" />
            </div>
            <div className="bento-identity">
              <span className="bento-greeting">{t.bento.greeting}</span>
              <strong className="bento-name">{t.bento.name}</strong>
              <button type="button" className="bento-email" onClick={copyEmail}>
                <span>{copied ? (language === 'hu' ? 'Kimásolva!' : 'Copied!') : 'kitti.ovari@gmail.com'}</span>
                <svg className="bento-email-copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="5.5" y="5.5" width="8" height="8" rx="1.6"/>
                  <path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5"/>
                </svg>
              </button>
            </div>
          </motion.div>

          <motion.a href="#works" className="bento-card bento-card--works" variants={card(2)} initial="hidden" animate="visible">
            <span className="bento-card__label">{t.bento.works}</span>
            <span className="bento-card__arrow">↓</span>
          </motion.a>

          <motion.a href="#cv" className="bento-card bento-card--cv" variants={card(3)} initial="hidden" animate="visible">
            <span className="bento-card__label">{t.bento.cv}</span>
            <span className="bento-card__arrow">↓</span>
          </motion.a>

          <motion.a href="#footer" className="bento-card bento-card--contact" variants={card(4)} initial="hidden" animate="visible">
            <span className="bento-card__label">{t.bento.contact}</span>
            <span className="bento-card__arrow">↓</span>
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
