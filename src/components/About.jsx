import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext.jsx'
import './About.css'

function About() {
  const t = useTranslation()

  return (
    <section id="about" className="about">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2 className="section-title about__title">
            {t.about.title} <span className="copper-text">{t.about.titleHighlight}</span>
          </h2>
          <div className="divider" />
        </motion.div>

        <motion.div
          className="about__body"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p dangerouslySetInnerHTML={{ __html: t.about.text }} />

        </motion.div>
      </div>
    </section>
  )
}

export default About
