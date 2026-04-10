import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext.jsx'
import './About.css'

const skills = [
  'UX Research',
  'User Interviews',
  'Wireframing',
  'Prototyping',
  'UI Design',
  'Usability Testing',
  'Information Architecture',
  'Persona Building',
  'User Journey Mapping',
  'Design Systems',
]

const tools = ['Figma', 'Miro', 'Hotjar', 'Notion', 'Tally', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign']

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
          <h2 className="section-title">
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

            <h3>{t.about.strengthsTitle}</h3>
            <ul className="about__strengths">
              {t.about.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>

            <h3>{t.about.languagesTitle}</h3>
            <div className="about__languages">
              {t.about.languages.map((lang) => (
                <div key={lang.name} className="about__language">
                  <span className="about__language-name">{lang.name}</span>
                  <span className="about__language-level">{lang.level}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="about__skills"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3>{t.about.skillsTitle}</h3>
            <div className="about__tags">
              {skills.map((skill) => (
                <span key={skill} className="about__tag">{skill}</span>
              ))}
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
