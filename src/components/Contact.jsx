import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext.jsx'
import './Contact.css'

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const t = useTranslation()

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
          <p className="section-subtitle">{t.contact.label}</p>
          <h2 className="section-title">
            {t.contact.title} <span className="copper-text">{t.contact.titleHighlight}</span>
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
            <p>{t.contact.text}</p>
            <div className="contact__links">
              <a href="mailto:kitti.ovari@gmail.com" className="contact__link">
                kitti.ovari@gmail.com
              </a>
              <a href="https://linkedin.com/in/kitti-h-ovari" target="_blank" rel="noopener noreferrer" className="contact__link">
                LinkedIn
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
              <label htmlFor="name">{t.contact.nameLabel}</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder={t.contact.namePlaceholder}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="contact__field">
              <label htmlFor="email">{t.contact.emailLabel}</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder={t.contact.emailPlaceholder}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="contact__field">
              <label htmlFor="message">{t.contact.messageLabel}</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                placeholder={t.contact.messagePlaceholder}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn--primary">{t.contact.send}</button>
          </motion.form>
        </div>
      </div>
    </section>
  )
}

export default Contact
