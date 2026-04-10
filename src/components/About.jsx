import { motion } from 'framer-motion'
import './About.css'

const skills = [
  'UX Research',
  'Wireframing',
  'Prototyping',
  'UI Design',
  'Design Systems',
  'Usability Testing',
]

const tools = ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Miro', 'Framer']

function About() {
  return (
    <section id="about" className="about">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <p className="section-subtitle">Rólam</p>
          <h2 className="section-title">
            Szeretem a <span className="copper-text">részleteket</span>
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
            <p>
              UX/UI designerként hiszek abban, hogy a jó design láthatatlan
              — egyszerűen működik. Célom, hogy felhasználóközpontú,
              esztétikus és funkcionális digitális termékeket hozzak létre.
            </p>
            <p>
              Minden projektnél a felhasználói igények megértéséből indulok ki,
              és az empátia vezérel a kutatástól a végső vizuális megoldásig.
            </p>
          </motion.div>

          <motion.div
            className="about__skills"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3>Szakterületek</h3>
            <div className="about__tags">
              {skills.map((skill) => (
                <span key={skill} className="about__tag">{skill}</span>
              ))}
            </div>

            <h3>Eszközök</h3>
            <div className="about__tags">
              {tools.map((tool) => (
                <span key={tool} className="about__tag about__tag--tool">{tool}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
