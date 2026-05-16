import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext.jsx'
import './Thinking.css'

function Thinking() {
  const t = useTranslation()

  return (
    <section id="thinking" className="thinking">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="section-subtitle">{t.thinking.label}</p>
          <h2 className="section-title">
            {t.thinking.title} <span className="copper-text">{t.thinking.titleHighlight}</span>
          </h2>
          <div className="divider" />
        </motion.div>

        <div className="thinking__grid">
          {t.thinking.cards.map((card, i) => (
            <motion.div
              key={card.topic}
              className={`thinking__card thinking__card--${i + 1}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="thinking__card-img" aria-hidden="true" />
              <h3 className="thinking__card-topic">{card.topic}</h3>
              <p className="thinking__card-body">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Thinking
