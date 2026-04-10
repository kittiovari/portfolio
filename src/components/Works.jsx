import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation, useLanguage } from '../i18n/LanguageContext.jsx'
import Wireframe from './Wireframe.jsx'
import './Works.css'

const sw = '1.2'
const sp = { fill: 'none', stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' }

const projectLogos = {
  cig: <img src="/logos/cig.svg" alt="CIG Pannónia" />,
  cib: <img src="/logos/cib.svg" alt="CIB Bank" />,
  gombarat: (
    <span className="works__logo-circle" style={{ background: '#2A0D28' }}>
      <img src="/logos/gombarat.svg" alt="GomBarát" style={{ filter: 'brightness(0) invert(1)', height: '70%' }} />
    </span>
  ),
  uniqa: <img src="/logos/uniqa.svg" alt="UNIQA" />,
  aimee: <img src="/logos/aimee.svg" alt="AImee" />,
  alphavet: <span className="works__logo-dual"><img src="/logos/cig.svg" alt="CIG Pannónia" /><img src="/logos/allatorvosod.svg" alt="allatorvosod.hu" /></span>,
  appartman: <img src="/logos/appartman.svg" alt="Appartman" />,
  mixie: <img src="/logos/mixie.svg" alt="Mixie" />,
  winefo: <img src="/logos/winefo.svg" alt="Winefo" />,
  chantblaster: <img src="/logos/chantblaster.svg" alt="Chantblaster" />,
  cec: <img src="/logos/cec.svg" alt="Code Escrow Cloud" />,
  moodmeup: <img src="/logos/moodmeup.svg" alt="MoodMeUp" />,
  'di-insurtech': <img src="/logos/di-insurtech.svg" alt="DI InsurTech" />,
  b4us: <img src="/logos/booked4us.svg" alt="Booked4us" />,
  audit: <svg viewBox="0 0 24 24" {...sp}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>,
  presales: <img src="/logos/danubius.svg" alt="Danubius IT" style={{ filter: 'brightness(0)' }} />,
}

function ProjectImage({ id }) {
  if (id === 'cig') {
    return (
      <div className="works__card-preview">
        <img src="/images/cig-mobile.svg" alt="CIG mobile" className="works__preview-bg" />
        <img src="/images/cig-desktop.svg" alt="CIG desktop" className="works__preview-fg" />
      </div>
    )
  }
  if (id === 'alphavet') {
    return (
      <div className="works__card-preview">
        <img src="/images/alphavet-1.svg" alt="AlphaVet 1" className="works__preview-bg" />
        <img src="/images/alphavet-2.svg" alt="AlphaVet 2" className="works__preview-fg" />
      </div>
    )
  }
  if (id === 'gombarat') {
    return (
      <div className="works__card-preview works__card-preview--dark works__card-preview--multi">
        <img src="/images/gombarat-home.png" alt="Kezdőlap" />
        <img src="/images/gombarat-menu.png" alt="Menü" />
        <img src="/images/gombarat-list.png" alt="Gombatár" />
        <img src="/images/gombarat-experts.png" alt="Szakellenőrök" />
      </div>
    )
  }
  return <Wireframe projectId={id} />
}

function Works() {
  const t = useTranslation()
  const { language } = useLanguage()
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  const projects = t.works.projects
  const total = projects.length

  const goTo = useCallback((index) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }, [current])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((c) => (c + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((c) => (c - 1 + total) % total)
  }, [total])

  // Auto-play
  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const p = projects[current]

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <section id="works" className="works">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <p className="section-subtitle">{t.works.label}</p>
          <h2 className="section-title">
            {t.works.title} <span className="copper-text">{t.works.titleHighlight}</span>
          </h2>
          <div className="divider" />
        </motion.div>

        {/* Carousel */}
        <div className="carousel">
          {/* Nav arrows */}
          <button className="carousel__arrow carousel__arrow--left" onClick={prev} aria-label="Previous">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button className="carousel__arrow carousel__arrow--right" onClick={next} aria-label="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          {/* Main card */}
          <div className="carousel__viewport">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={p.id}
                className="carousel__card"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.45, 0, 0.55, 1] }}
              >
                <div className="carousel__image">
                  <ProjectImage id={p.id} />
                </div>
                <div className="carousel__info">
                  <div className="carousel__logo">
                    {projectLogos[p.id]}
                  </div>
                  <h3>{p.title}</h3>
                  <p className="carousel__summary">{p.summary}</p>
                  {p.scope && <p className="carousel__scope">{p.scope}</p>}
                  <div className="carousel__tags">
                    {p.tags.map((tag) => <span key={tag} className="carousel__tag">{tag}</span>)}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bubble indicators */}
          <div className="carousel__dots">
            {projects.map((proj, i) => (
              <button
                key={proj.id}
                className={`carousel__dot ${i === current ? 'carousel__dot--active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={proj.title}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Works
