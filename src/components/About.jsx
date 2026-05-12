import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext.jsx'
import Flag from './Flag.jsx'
import './About.css'

function About() {
  const t = useTranslation()

  return (
    <section id="about" className="about">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <p className="section-subtitle">{t.about.label}</p>
          <h2 className="section-title about__title">
            {t.about.title} <span className="copper-text">{t.about.titleHighlight}</span>
          </h2>
          <div className="divider" />
        </motion.div>

        <div className="about__grid">
          <motion.div
            className="about__text"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p>{t.about.text1}</p>
            <p>{t.about.text2}</p>
            <p>{t.about.text3}</p>
            {t.about.text4 && <p>{t.about.text4}</p>}

            <h3>{t.about.languagesTitle}</h3>
            <div className="about__languages">
              {t.about.languages.map((lang) => (
                <div key={lang.name} className="about__language">
                  <span className="about__language-flag"><Flag code={lang.code} /></span>
                  <span className="about__language-name">{lang.name}</span>
                  <span className="about__language-level">{lang.level}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="about__focus"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3>{t.about.focusTitle}</h3>
            <div className="about__tags">
              {t.about.focus.map((item) => (
                <span key={item} className="about__tag">{item}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
