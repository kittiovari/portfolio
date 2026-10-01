import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation, useLanguage } from '../i18n/LanguageContext.jsx'
import './Works.css'

const FEATURED_IDS = ['alphavet', 'winefo', 'appartman']

const projectMockups = {
  cig:      ['/images/CIG.png'],
  cib:      ['/images/CIB.png'],
  uniqa:    ['/images/Uniqa.png'],
  alphavet: ['/images/allatorvosod.webp'],
  gombarat: ['/images/Gombarat.png'],
  aimee:    ['/images/aimee.webp'],
  appartman:['/images/appartman-mockup.png'],
  moodmeup: ['/images/moodmeup-mockup.webp'],
  chantblaster: ['/images/chantblaster-mockup.webp'],
  cec:      ['/images/cec-mockup.webp'],
  winefo:   ['/images/winefo.webp'],
}

const mockupBg = {
  cib:      'linear-gradient(160deg, #F4F4F5 0%, #ECECEE 50%, #E3E3E6 100%)',
  uniqa:    'linear-gradient(135deg, #EAF3F0 0%, #ECEAF5 55%, #EAE6F3 100%)',
  gombarat: 'linear-gradient(160deg, #EDF4EC 0%, #E6F0E6 50%, #DFEADF 100%)',
  aimee:    'linear-gradient(135deg, #EDF4F1 0%, #F4F0E4 55%, #F0EBDE 100%)',
  alphavet: 'linear-gradient(135deg, #E9F0F6 0%, #E8EDF4 55%, #E1E8F1 100%)',
  appartman:'linear-gradient(135deg, #F0EAF6 0%, #EDE6F4 50%, #E7DEF0 100%)',
  moodmeup: 'linear-gradient(160deg, #F1F6EF 0%, #EAF2E8 50%, #E3EDE1 100%)',
  chantblaster: 'linear-gradient(150deg, #F6EFEA 0%, #F2E7DF 50%, #EBDCD2 100%)',
  cec:      'linear-gradient(140deg, #EFEDFA 0%, #E9E7F7 50%, #E1EEF2 100%)',
  winefo:   'linear-gradient(135deg, #F7E9EF 0%, #F0E8F5 55%, #EAE2F0 100%)',
}

// Light tint per project — keeps each project's hue without hurting contrast.
const infoBg = {
  cib:      '#FCFCFD',
  uniqa:    '#FBFCFC',
  gombarat: '#FBFDFB',
  aimee:    '#FDFCF9',
  alphavet: '#FAFCFD',
  appartman:'#FCFAFD',
  moodmeup: '#FBFDFA',
  chantblaster: '#FDFBF9',
  cec:      '#FBFAFD',
  winefo:   '#FDFAFC',
}

const projectVideos = {
  winefo: {
    hu: 'https://www.youtube.com/watch?v=sdUCwPSTlyc',
    en: 'https://www.youtube.com/watch?v=tebOZ8lc9tA',
  },
}

// Accents darkened for legibility on the light panel.
const accentColor = {
  // cig: default purple, no override
  cib:      '#2F6E8F',
  uniqa:    '#2B7D6B',
  gombarat: '#2E7D3C',
  aimee:    '#8A6A14',
  alphavet: '#1F6E96',
  appartman:'#5B3FA0',
  moodmeup: '#3D7A3A',
  chantblaster: '#9E4A17',
  cec:      '#4A3FB0',
  winefo:   '#9B3F6E',
}

const projectLogos = {
  cig:         <img src="/logos/cig.svg"          alt="CIG Pannónia"    className="logo logo--color-dark" />,
  cib:         <img src="/logos/cib.svg"          alt="CIB Bank"        className="logo logo--mono-dark" />,
  gombarat:    <img src="/logos/gombarat.svg"        alt="GomBarát"        className="logo logo--on-dark" />,
  uniqa:       <img src="/logos/uniqa.svg"        alt="UNIQA"           className="logo logo--mono-dark" />,
  aimee:       <img src="/logos/aimee.svg"        alt="AImee" />,
  alphavet: (
    <span className="works__tile-logo-dual">
      <img src="/logos/cig.svg"          alt="CIG Pannónia"  className="logo logo--color-dark" />
      <img src="/logos/allatorvosod.svg" alt="allatorvosod.hu" className="logo logo--color-dark" />
    </span>
  ),
  appartman:   <img src="/logos/appartman.svg"    alt="Appartman" />,
  winefo:      <img src="/logos/winefo.svg"       alt="Winefo"          className="logo logo--mono-dark" />,
  chantblaster:<img src="/logos/chantblaster.svg" alt="Chantblaster" />,
  cec:         <img src="/logos/cec.svg"          alt="Code Escrow Cloud" className="logo logo--color-dark" />,
  moodmeup:    <img src="/logos/moodmeup.svg"     alt="MoodMeUp"        className="logo logo--color-dark" />,
}

function MockupArea({ id }) {
  const images = projectMockups[id]
  const [active, setActive] = useState(0)
  const bg = mockupBg[id]
  const { language } = useLanguage()
  const videoUrls = projectVideos[id]
  const video = videoUrls ? (language === 'hu' ? videoUrls.hu : videoUrls.en) : null

  useEffect(() => { setActive(0) }, [id])

  if (!images) {
    return (
      <div className="works-modal__mockup works-modal__mockup--empty">
        <span className="works-modal__mockup-label">Mockup</span>
      </div>
    )
  }

  return (
    <div className="works-modal__mockup works-modal__mockup--media" style={bg ? { background: bg } : undefined}>
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
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={onClose}
    >
      <motion.div
        className="works-modal__dialog"
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.03 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {/* Left half: mockup slides from left */}
            <motion.div
              className="works-modal__half"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
            >
              <MockupArea id={p.id} />
            </motion.div>

            {/* Right half: info slides from right */}
            <motion.div
              className="works-modal__half"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.28, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="works-modal__info" style={{
                ...(infoBg[p.id]    ? { background: infoBg[p.id] } : {}),
                ...(accentColor[p.id] ? { '--modal-accent': accentColor[p.id] } : {}),
              }}>
                <div className="works-modal__logo-row">
                  <div className="works-modal__logo">{projectLogos[p.id]}</div>
                  {projectVideos[p.id] && (
                    <a
                      href={language === 'hu' ? projectVideos[p.id].hu : projectVideos[p.id].en}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="works-modal__video-btn"
                    >
                      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="13" height="13">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
                      </svg>
                      {isHu ? 'Bemutató' : 'Watch demo'}
                    </a>
                  )}
                </div>

                <h2 className="works-modal__title">{p.title}</h2>

                {/* A központi kérdés közvetlenül a cím alatt, label nélkül */}
                {p.question && (Array.isArray(p.question) ? p.question : [p.question]).map((q, i) => (
                  <p key={i} className="works-modal__question">{q}</p>
                ))}

                {(p.period || p.role) && (
                  <p className="works-modal__meta">
                    {[p.period, p.role].filter(Boolean).join(' · ')}
                  </p>
                )}
                {p.team && <p className="works-modal__team">{p.team}</p>}

                {(p.excerpt || p.context) && (
                  <p className="works-modal__excerpt">{p.excerpt || p.context}</p>
                )}

                {p.achievement && (
                  <div className="works-modal__section">
                    <p className="works-modal__label">
                      {isHu ? 'Megoldások & eredmények' : 'Solutions & results'}
                    </p>
                    <div className="works-modal__grid">
                      {(Array.isArray(p.achievement) ? p.achievement : [p.achievement]).map((a, i) => {
                        const colonIdx = a.indexOf(':')
                        const label = colonIdx > -1 ? a.slice(0, colonIdx).trim() : null
                        const body = colonIdx > -1 ? a.slice(colonIdx + 1).trim() : a
                        return (
                          <div key={i} className="works-modal__cell">
                            {label && <span className="works-modal__cell-label">{label}</span>}
                            <span className="works-modal__cell-body">{body}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {p.lesson && (
                  <div className="works-modal__section works-modal__lesson">
                    <p className="works-modal__label">{isHu ? 'Tanulság' : 'Key takeaway'}</p>
                    <div className="works-modal__learnings">
                      {(Array.isArray(p.lesson) ? p.lesson : [p.lesson]).map((l, i) => {
                        const colonIdx = l.indexOf(':')
                        const label = colonIdx > -1 ? l.slice(0, colonIdx).trim() : null
                        const body = colonIdx > -1 ? l.slice(colonIdx + 1).trim() : l
                        return (
                          <div key={i} className="works-modal__cell">
                            {label && <span className="works-modal__cell-label">{label}</span>}
                            <span className="works-modal__cell-body">{body}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="works-modal__tags">
                  {p.tags.map((tag) => (
                    <span key={tag} className="works-modal__tag">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

function ProjectCard({ p, onClick, animDelay }) {
  const img = projectMockups[p.id]?.[0]
  const bg = mockupBg[p.id]
  return (
    <motion.div
      className={`works__card${!img ? ' works__card--no-img' : ''}`}
      style={bg ? { background: bg } : {}}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: animDelay }}
      onClick={onClick}
    >
      {img
        ? <img src={img} alt={p.title} className="works__card-img" draggable={false} />
        : (
          <div className="works__card-placeholder">
            <div className="works__card-logo-wrap">{projectLogos[p.id]}</div>
          </div>
        )
      }
      <div className="works__card-overlay">
        <h3 className="works__card-title">{p.title}</h3>
      </div>
    </motion.div>
  )
}

function Works() {
  const t = useTranslation()
  const { language } = useLanguage()
  const projects = t.works.projects
  const [selected, setSelected] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const featured = projects.filter(p => FEATURED_IDS.includes(p.id))
  const others = projects.filter(p => !FEATURED_IDS.includes(p.id))

  const close = useCallback(() => setSelected(null), [])
  const prev = useCallback(() => setSelected((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setSelected((i) => Math.min(projects.length - 1, i + 1)), [projects.length])
  const openProject = useCallback((p) => setSelected(projects.indexOf(p)), [projects])

  // Allow timeline component to open this modal via custom event
  useEffect(() => {
    const handler = (e) => {
      const idx = projects.findIndex(p => p.id === e.detail.projectId)
      if (idx !== -1) setSelected(idx)
    }
    window.addEventListener('open-project-modal', handler)
    return () => window.removeEventListener('open-project-modal', handler)
  }, [projects])

  return (
    <section id="works" className="works">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2 className="section-title" dangerouslySetInnerHTML={{ __html: t.works.label }} />
          <div className="divider" />
        </motion.div>

        <div className="works__cards">
          {featured.map((p, i) => (
            <ProjectCard key={p.id} p={p} onClick={() => openProject(p)} animDelay={i * 0.08} />
          ))}
        </div>

        <AnimatePresence>
          {showAll && (
            <motion.div
              className="works__cards works__cards--more"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35 }}
            >
              {others.map((p, i) => (
                <ProjectCard key={p.id} p={p} onClick={() => openProject(p)} animDelay={i * 0.05} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="works__toggle-wrap">
          <motion.button
            className="works__toggle-btn"
            onClick={() => setShowAll(v => !v)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {showAll
              ? (language === 'hu' ? 'Kevesebb mutatása' : 'Show less')
              : (language === 'hu' ? 'Többi projekt' : 'More projects')}
          </motion.button>
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
