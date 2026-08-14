import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext.jsx'
import { useTheme } from '../i18n/ThemeContext.jsx'
import './Hero.css'

function Hero() {
  const t = useTranslation()
  const { isDark } = useTheme()
  const logoColors = isDark
    ? { c1: '#E8C870', c2: '#D4A030', c3: '#B88020' }
    : { c1: '#D4956A', c2: '#C26D45', c3: '#8B4A2D' }

  return (
    <section id="hero" className="hero">
      <svg className="hero__bg-logo" viewBox="0 0 210 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 58 58 C 90 58, 114 84, 114 120 C 114 156, 90 182, 58 182 C 26 182, 2 156, 2 120 C 2 84, 26 58, 58 58 Z"
              stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M 132 52 L 132 188" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
        <path d="M 132 118 C 142 118, 152 106, 160 94 C 168 82, 174 68, 182 56 C 185 51, 188 48, 192 46"
              stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M 142 126 C 152 138, 162 152, 172 164 C 178 172, 184 180, 192 188"
              stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none"/>
      </svg>

      <div className="container hero__grid">
        <div className="hero__text">
          <div className="hero__title">
            {/* KO: appears, then gets strikethrough and fades */}
            <span className="hero__ko-group">
              <motion.span
                className="hero__ko-text"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 0.3 }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.4, ease: [0.45, 0, 0.55, 1] },
                  y: { duration: 0.6, delay: 0.4 },
                }}
              >
                KO
              </motion.span>
              <motion.span
                className="hero__strikethrough"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 1.2, ease: [0.45, 0, 0.55, 1] }}
              />
            </span>

            {/* OK logo: appears alongside */}
            <motion.span
              className="hero__ok-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.6, ease: [0.45, 0, 0.55, 1] }}
            >
              <svg viewBox="-6 46 210 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="copper-hero" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={logoColors.c1}/>
                    <stop offset="45%" stopColor={logoColors.c2}/>
                    <stop offset="100%" stopColor={logoColors.c3}/>
                  </linearGradient>
                </defs>
                <path d="M 58 58 C 90 58, 114 84, 114 120 C 114 156, 90 182, 58 182 C 26 182, 2 156, 2 120 C 2 84, 26 58, 58 58 Z" stroke="url(#copper-hero)" strokeWidth="8" fill="none"/>
                <path d="M 132 52 L 132 188" stroke="url(#copper-hero)" strokeWidth="8" strokeLinecap="round"/>
                <path d="M 132 118 C 142 118, 152 106, 160 94 C 168 82, 174 68, 182 56 C 185 51, 188 48, 192 46" stroke="url(#copper-hero)" strokeWidth="8" strokeLinecap="round" fill="none"/>
                <path d="M 142 126 C 152 138, 162 152, 172 164 C 178 172, 184 180, 192 188" stroke="url(#copper-hero)" strokeWidth="8" strokeLinecap="round" fill="none"/>
              </svg>
            </motion.span>

            {/* Checkmark in logo style */}
            <motion.span
              className="hero__check"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 2.2, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="copper-check" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={logoColors.c1}/>
                    <stop offset="45%" stopColor={logoColors.c2}/>
                    <stop offset="100%" stopColor={logoColors.c3}/>
                  </linearGradient>
                </defs>
                <motion.path
                  d="M4 12.5L9.5 18L20 6"
                  stroke="url(#copper-check)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 2.4, ease: [0.45, 0, 0.55, 1] }}
                />
              </svg>
            </motion.span>
          </div>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.8 }}
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.p
            className="hero__trustline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 3.1 }}
          >
            {t.hero.trustline}
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 3.4 }}
          >
            <a href="#works" className="btn btn--primary">{t.hero.cta1}</a>
            <a href="/cv-view.html" target="_blank" rel="noopener noreferrer" className="btn btn--outline">{t.hero.cta2}</a>
          </motion.div>
        </div>

        <motion.div
          className="hero__portrait"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.45, 0, 0.55, 1] }}
        >
          <div className="hero__portrait-frame">
            <div className="hero__portrait-accent" />
            <img src="/images/me.png" alt="H. Óvári Kitti" className="hero__portrait-img" />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="hero__scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4, duration: 0.6 }}
      >
        <div className="hero__scroll-line" />
      </motion.div>
    </section>
  )
}

export default Hero
