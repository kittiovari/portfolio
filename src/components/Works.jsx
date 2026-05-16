import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation, useLanguage } from '../i18n/LanguageContext.jsx'
import './Works.css'

const projectMockups = {
  cig:      ['/images/cig-desktop.svg', '/images/cig-mobile.svg'],
  alphavet: ['/images/alphavet-1.svg', '/images/alphavet-2.svg'],
  gombarat: ['/images/gombarat-home.png', '/images/gombarat-list.png', '/images/gombarat-experts.png', '/images/gombarat-menu.png'],
}

const projectLogos = {
  cig:         <img src="/logos/cig.svg"          alt="CIG Pannónia"    className="logo logo--color-dark" />,
  cib:         <img src="/logos/cib.svg"          alt="CIB Bank"        className="logo logo--mono-dark" />,
  gombarat: (
    <span className="works__tile-logo-circle" style={{ background: '#2A0D28' }}>
      <img src="/logos/gombarat.svg" alt="GomBarát" style={{ filter: 'brightness(0) invert(1)', height: '70%' }} />
    </span>
  ),
  uniqa:       <img src="/logos/uniqa.svg"        alt="UNIQA"           className="logo logo--color-dark" />,
  aimee:       <img src="/logos/aimee.svg"        alt="AImee" />,
  alphavet: (
    <span className="works__tile-logo-dual">
      <img src="/logos/cig.svg"          alt="CIG Pannónia"  className="logo logo--color-dark" />
      <img src="/logos/allatorvosod.svg" alt="allatorvosod.hu" className="logo logo--color-dark" />
    </span>
  ),
  appartman:   <img src="/logos/appartman.svg"    alt="Appartman" />,
  mixie:       <img src="/logos/mixie.svg"        alt="Mixie" />,
  winefo:      <img src="/logos/winefo.svg"       alt="Winefo"          className="logo logo--mono-dark" />,
  chantblaster:<img src="/logos/chantblaster.svg" alt="Chantblaster" />,
  cec:         <img src="/logos/cec.svg"          alt="Code Escrow Cloud" className="logo logo--color-dark" />,
  moodmeup:    <img src="/logos/moodmeup.svg"     alt="MoodMeUp"        className="logo logo--color-dark" />,
  'di-insurtech': <img src="/logos/di-insurtech.svg" alt="DI InsurTech" className="logo logo--color-dark" />,
  b4us:        <img src="/logos/booked4us.svg"    alt="Booked4us"       className="logo logo--color-dark" />,
  presales:    <img src="/logos/danubius.svg"     alt="Danubius IT"     className="logo logo--on-dark" />,
}

function MockupArea({ id }) {
  const images = projectMockups[id]
  const [active, setActive] = useState(0)

  useEffect(() => { setActive(0) }, [id])

  if (!images) {
    return (
      <div className="works-modal__mockup works-modal__mockup--empty">
        <span className="works-modal__mockup-label">Mockup</span>
      </div>
    )
  }

  return (
    <div className="works-modal__mockup works-modal__mockup--media">
      <AnimatePresence mode="wait">
        <motion.img
          key={images[active]}
          src={images[active]}
          alt=""
          className="works-modal__mockup-img"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        />
      </AnimatePresence>
      {images.length > 1 && (
        <div className="works-modal__mockup-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`works-modal__mockup-dot${i === active ? ' works-modal__mockup-dot--active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Kép ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectModal({ projects, index, onClose, onPrev, onNext }) {
  const p = projects[index]
  const hasPrev = index > 0
  const hasNext = index < projects.length - 1
  const { language } = useLanguage()
  const isHu = language === 'hu'

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext, hasPrev, hasNext])

  return (
    <motion.div
      className="works-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="works-modal__dialog"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button className="works-modal__close" onClick={onClose} aria-label="Bezárás">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Navigation */}
        {hasPrev && (
          <button className="works-modal__nav works-modal__nav--prev" onClick={onPrev} aria-label="Előző projekt">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        )}
        {hasNext && (
          <button className="works-modal__nav works-modal__nav--next" onClick={onNext} aria-label="Következő projekt">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={p.id}
            className="works-modal__content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Mockup area */}
            <MockupArea id={p.id} />

            {/* Info */}
            <div className="works-modal__info">
              <div className="works-modal__logo">
                {projectLogos[p.id]}
              </div>
              <h2 className="works-modal__title">{p.title}</h2>
              {p.period && <p className="works-modal__period">{p.period}</p>}
              {p.excerpt && <p className="works-modal__excerpt">{p.excerpt}</p>}
              {p.question && (
                <div className="works-modal__block">
                  <p className="works-modal__block-label">{isHu ? 'Mire kerestünk választ?' : 'What were we looking for?'}</p>
                  <p className="works-modal__block-text">{p.question}</p>
                </div>
              )}
              {p.achievement && (
                <div className="works-modal__block">
                  <p className="works-modal__block-label">{isHu ? 'Mit értünk el?' : 'What did we achieve?'}</p>
                  <p className="works-modal__block-text">{p.achievement}</p>
                </div>
              )}
              {p.focus && (
                <p className="works-modal__focus">{p.focus}</p>
              )}
              <div className="works-modal__tags">
                {p.tags.map((tag) => (
                  <span key={tag} className="works-modal__tag">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

function Works() {
  const t = useTranslation()
  const projects = t.works.projects
  const [selected, setSelected] = useState(null)

  const close = useCallback(() => setSelected(null), [])
  const prev = useCallback(() => setSelected((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setSelected((i) => Math.min(projects.length - 1, i + 1)), [projects.length])

  return (
    <section id="works" className="works">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="section-subtitle">{t.works.label}</p>
          <h2 className="section-title">
            {t.works.title} <span className="copper-text">{t.works.titleHighlight}</span>
          </h2>
          <div className="divider" />
        </motion.div>

        <div className="works__grid">
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              className={`works__tile ${p.featured ? 'works__tile--featured' : ''} ${p.tier === 'secondary' ? 'works__tile--secondary' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.07 }}
              onClick={() => setSelected(i)}
              style={{ cursor: 'pointer' }}
            >
              <div className="works__tile-logo">
                {projectLogos[p.id]}
              </div>
              <div className="works__tile-body">
                <h3 className="works__tile-title">{p.title}</h3>
                <p className="works__tile-scope">{p.excerpt || p.scope}</p>
              </div>
              <div className="works__tile-tags">
                {p.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="works__tile-tag">{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected !== null && (
          <ProjectModal
            projects={projects}
            index={selected}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

export default Works
