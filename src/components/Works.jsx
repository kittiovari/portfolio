import { motion } from 'framer-motion'
import './Works.css'

const projects = [
  {
    id: 1,
    title: 'Projekt Egy',
    category: 'UX/UI Design',
    description: 'Egy mobilalkalmazás teljes újratervezése a felhasználói élmény javítása érdekében.',
    image: null,
  },
  {
    id: 2,
    title: 'Projekt Kettő',
    category: 'Web Design',
    description: 'Reszponzív weboldal tervezése egy innovatív startup számára.',
    image: null,
  },
  {
    id: 3,
    title: 'Projekt Három',
    category: 'Design System',
    description: 'Egységes design rendszer kialakítása egy nagyvállalat számára.',
    image: null,
  },
]

function Works() {
  return (
    <section id="works" className="works">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <p className="section-subtitle">Munkáim</p>
          <h2 className="section-title">
            Válogatott <span className="copper-text">projektek</span>
          </h2>
          <div className="divider" />
        </motion.div>

        <div className="works__grid">
          {projects.map((project, index) => (
            <motion.article
              key={project.id}
              className="works__card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
            >
              <div className="works__card-image">
                {project.image ? (
                  <img src={project.image} alt={project.title} />
                ) : (
                  <div className="works__card-placeholder">
                    <span>{project.title.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="works__card-content">
                <span className="works__card-category">{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Works
