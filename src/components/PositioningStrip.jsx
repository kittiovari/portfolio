import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext.jsx'
import './PositioningStrip.css'

function PositioningStrip() {
  const t = useTranslation()

  return (
    <section className="positioning">
      <div className="container">
        <div className="positioning__grid">
          {t.positioning.pillars.map((pillar, i) => (
            <motion.div
              key={pillar.number}
              className="positioning__pillar"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <span className="positioning__number">{pillar.number}</span>
              <h3 className="positioning__title">{pillar.title}</h3>
              <p className="positioning__body">{pillar.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PositioningStrip
