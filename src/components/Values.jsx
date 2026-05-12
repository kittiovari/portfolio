import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext.jsx'
import './Values.css'

function Values() {
  const t = useTranslation()

  return (
    <section className="values">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <p className="section-subtitle">{t.values.label}</p>
          <h2 className="section-title">
            {t.values.title} <span className="copper-text">{t.values.titleHighlight}</span>
          </h2>
          <div className="divider" />
        </motion.div>

        <div className="values__grid">
          {t.values.items.map((item, i) => (
            <motion.div
              key={item.name}
              className="values__item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <h3 className="values__item-name">{item.name}</h3>
              <p className="values__item-body">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Values
