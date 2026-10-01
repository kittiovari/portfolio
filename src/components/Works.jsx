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
  appartman:['/images/appartman.webp'],
  winefo:   ['/images/winefo.webp'],
}

const mockupBg = {
  cib:      'linear-gradient(160deg, #2b2b2b 0%, #1e1e1e 50%, #141414 100%)',
  uniqa:    'linear-gradient(135deg, #0d2a22 0%, #16133a 55%, #1c0e3a 100%)',
  gombarat: 'linear-gradient(160deg, #0d1f0c 0%, #07130a 45%, #040d06 75%, #020805 100%)',
  aimee:    'linear-gradient(135deg, #0e2420 0%, #1e1a08 55%, #120d04 100%)',
  alphavet: 'linear-gradient(135deg, #0a1a2e 0%, #0d1624 55%, #060d14 100%)',
  appartman:'linear-gradient(135deg, #1a0d2e 0%, #160a28 50%, #0d061a 100%)',
  winefo:   'linear-gradient(135deg, #2a0a18 0%, #1e0a2a 55%, #130720 100%)',
}

// Opaque backgrounds — the info panel must never let page content show through.
const infoBg = {
  cib:      '#0a0a0a',
  uniqa:    '#0a0816',
  gombarat: '#020804',
  aimee:    '#080e0a',
  alphavet: '#060c14',
  appartman:'#0c0616',
  winefo:   '#120610',
}

const projectVideos = {
  winefo: {
    hu: 'https://www.youtube.com/watch?v=sdUCwPSTlyc',
    en: 'https://www.youtube.com/watch?v=tebOZ8lc9tA',
  },
}

const accentColor = {
  // cig: default purple, no override
  cib:      '#6fa8c8',
  uniqa:    '#7dc4b4',
  gombarat: '#6ec47a',
  aimee:    '#c4a85a',
  alphavet: '#5aaed4',
  appartman:'#9b7fd4',
  winefo:   '#c47fa8',
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

                <div className="works-modal__chips">
                  {p.period && (
                    <span className="works-modal__chip">
                      <svg className="works-modal__chip-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M2 7h12" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      {p.period}
                    </span>
                  )}
                  {p.role && (
                    <span className="works-modal__chip">
                      <svg className="works-modal__chip-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      {p.role}
                    </span>
                  )}
                  {p.team && (
                    <span className="works-modal__chip">
                      <svg className="works-modal__chip-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                        <circle cx="11" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M1 14c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        <path d="M11 11c1.657 0 3 .895 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      {p.team}
                    </span>
                  )}
                </div>

                {/* Merged context block (replaces separate excerpt + challenge) */}
                {p.context
                  ? <p className="works-modal__context">{p.context}</p>
                  : p.excerpt && <p className="works-modal__excerpt">{p.excerpt}</p>
                }

                {/* Legacy challenge list — only shown when no context field */}
                {!p.context && (p.challenge || p.painPoints) && (
                  <div className="works-modal__block">
                    <p className="works-modal__block-label">{isHu ? 'Fő kihívások (AS-IS)' : 'Key challenges'}</p>
                    <ul className="works-modal__block-list works-modal__block-list--pain">
                      {(Array.isArray(p.challenge ?? p.painPoints) ? (p.challenge ?? p.painPoints) : [p.challenge ?? p.painPoints]).map((item, i) => (
                        <li key={i}>
                          <svg className="block-list-icon" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                            <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M5 3v2.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            <circle cx="5" cy="6.8" r="0.5" fill="currentColor"/>
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!p.context && !p.challenge && p.question && (
                  <div className="works-modal__block">
                    <p className="works-modal__block-label">{isHu ? 'Mire kerestünk választ?' : 'What were we looking for?'}</p>
                    <ul className="works-modal__block-list works-modal__block-list--question">
                      {(Array.isArray(p.question) ? p.question : [p.question]).map((q, i) => (
                        <li key={i}>
                          <svg className="block-list-icon" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                            <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M5 3v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            <circle cx="5" cy="7.2" r="0.5" fill="currentColor"/>
                          </svg>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {p.achievement && (
                  <div className="works-modal__block">
                    <p className="works-modal__block-label works-modal__block-label--accent">
                      {isHu ? 'Fő megoldások & eredmények' : 'Key solutions & results'}
                    </p>
                    <ul className="works-modal__block-list works-modal__block-list--achievement">
                      {(Array.isArray(p.achievement) ? p.achievement : [p.achievement]).map((a, i) => {
                        const colonIdx = a.indexOf(':')
                        const label = colonIdx > -1 ? a.slice(0, colonIdx).trim() : null
                        const body  = colonIdx > -1 ? a.slice(colonIdx + 1).trim() : a
                        return (
                          <li key={i}>
                            <svg className="block-list-icon" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                              <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/>
                              <path d="M3 5.2l1.4 1.4 2.6-2.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="works-modal__ach-item">
                              {label && <span className="works-modal__ach-label">{label}</span>}
                              <span className="works-modal__ach-body">{body}</span>
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                {p.lesson && (
                  <div className="works-modal__lesson-callout">
                    <p className="works-modal__lesson-label">{isHu ? 'Tanulság' : 'Key takeaway'}</p>
                    {Array.isArray(p.lesson) ? (
                      <ul className="works-modal__block-list works-modal__block-list--achievement">
                        {p.lesson.map((l, i) => {
                          const colonIdx = l.indexOf(':')
                          const label = colonIdx > -1 ? l.slice(0, colonIdx).trim() : null
                          const body  = colonIdx > -1 ? l.slice(colonIdx + 1).trim() : l
                          return (
                            <li key={i}>
                              <svg className="block-list-icon" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/>
                                <path d="M3 5.2l1.4 1.4 2.6-2.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span className="works-modal__ach-item">
                                {label && <span className="works-modal__ach-label">{label}</span>}
                                <span className="works-modal__ach-body">{body}</span>
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="works-modal__lesson-text">{p.lesson}</p>
                    )}
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
