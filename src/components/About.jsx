import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext.jsx'
import './About.css'

function About() {
  const t = useTranslation()

  return (
    <section id="about" className="about">
      <div className="container about__layout">

        {/* Left: text content */}
        <motion.div
          className="about__content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title about__title">
            {t.about.title} <span className="copper-text">{t.about.titleHighlight}</span>
          </h2>
          <div className="divider" />
          <div className="about__body">
            <p dangerouslySetInnerHTML={{ __html: t.about.text }} />
          </div>
        </motion.div>

        {/* Right: portrait */}
        <motion.div
          className="about__portrait-wrap"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <img src="/images/profile2.svg" alt="H. Óvári Kitti" className="about__portrait-img" />
        </motion.div>

      </div>
    </section>
  )
}

export default About
