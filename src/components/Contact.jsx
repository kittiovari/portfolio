import { useState } from 'react'
import { motion } from 'framer-motion'
import './Contact.css'

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Supabase integration
    console.log('Form submitted:', formData)
  }

  return (
    <section id="contact" className="contact">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <p className="section-subtitle">Kapcsolat</p>
          <h2 className="section-title">
            Dolgozzunk <span className="copper-text">együtt</span>
          </h2>
          <div className="divider" />
        </motion.div>

        <div className="contact__grid">
          <motion.div
            className="contact__info"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p>
              Van egy ötleted vagy projekted? Szívesen meghallgatom!
              Írj nekem, és hamarosan válaszolok.
            </p>
            <div className="contact__links">
              <a href="mailto:hello@example.com" className="contact__link">
                hello@example.com
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="contact__link">
                LinkedIn
              </a>
              <a href="https://behance.net" target="_blank" rel="noopener noreferrer" className="contact__link">
                Behance
              </a>
            </div>
          </motion.div>

          <motion.form
            className="contact__form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="contact__field">
              <label htmlFor="name">Név</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="contact__field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="contact__field">
              <label htmlFor="message">Üzenet</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn--primary">Küldés</button>
          </motion.form>
        </div>
      </div>
    </section>
  )
}

export default Contact
