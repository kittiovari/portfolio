import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext.jsx'
import './AboutThinking.css'

const ILLUS = [
  '/images/thinking-1.svg',
  '/images/thinking-2.svg',
  '/images/thinking-3.svg',
]

function AboutThinking() {
  const t = useTranslation()
  const [portraitHovered, setPortraitHovered] = useState(false)

  return (
    <section id="about" className="about-thinking">
      <span id="thinking" className="about-thinking__anchor" aria-hidden="true" />
      <div className="container">

        {/* ── Top bento row: About (2/3) + Portrait (1/3) ── */}
        <div className="at-bento-top">

          {/* Left card: quote + paragraphs */}
          <motion.div
            className="at-bento-card at-bento-card--about"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h2 className="at-quote">
              {t.about.title}{' '}
              <span className="at-quote-accent">{t.about.titleHighlight}</span>
            </h2>
            <div className="at-paragraphs">
              {t.about.paragraphs.map((p, i) => (
                <p key={i} className="at-para">{p}</p>
              ))}
            </div>
          </motion.div>

          {/* Right card: portrait + hobby tags */}
          <motion.div
            className="at-bento-card at-bento-card--portrait"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div
              className="at-portrait-swap"
              onMouseEnter={() => setPortraitHovered(true)}
              onMouseLeave={() => setPortraitHovered(false)}
            >
              <img
                src="/images/profile2.svg"
                alt="H. Óvári Kitti"
                className="at-portrait"
                style={{ opacity: portraitHovered ? 0 : 1 }}
              />
              <img
                src="/images/profile3.svg"
                alt=""
                aria-hidden="true"
                className="at-portrait at-portrait--overlay"
                style={{ opacity: portraitHovered ? 1 : 0 }}
              />
            </div>
          </motion.div>

        </div>

        {/* ── Thinking section label ── */}

        {/* ── Thinking cards ── */}
        <div className="at-cards">
          {t.thinking.cards.map((card, i) => (
            <motion.div
              key={i}
              className="at-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.08 + i * 0.1 }}
            >
              <div
                className={`at-card-illus at-card-illus--${i + 1}`}
                aria-hidden="true"
              />
              <h3 className="at-card-title">{card.topic}</h3>
              <p className="at-card-body" dangerouslySetInnerHTML={{ __html: card.body }} />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default AboutThinking
