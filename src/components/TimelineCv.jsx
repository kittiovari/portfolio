import { motion } from 'framer-motion'
import { useLanguage, useTranslation } from '../i18n/LanguageContext.jsx'
import './TimelineCv.css'

function openProjectModal(projectId) {
  window.dispatchEvent(new CustomEvent('open-project-modal', { detail: { projectId } }))
  const worksEl = document.getElementById('works')
  if (worksEl) worksEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const DANUBIUS_PROJECTS = [
  { id: 'cig',         hu: 'CIG Pannónia',            period: '2024. nov – 2026. máj', periodEn: 'Nov 2024 – May 2026' },
  { id: 'cib',         hu: 'CIB Bank',                period: '2024. nov – 2025. okt', periodEn: 'Nov 2024 – Oct 2025' },
  { id: 'cec',         hu: 'Code Escrow Cloud',        period: '2025. aug',             periodEn: 'Aug 2025' },
  { id: 'aimee',       hu: 'AImee',                   period: '2024. aug – 2025. márc', periodEn: 'Aug 2024 – Mar 2025' },
  { id: 'moodmeup',    hu: 'MoodMeUp',                period: '2024. júl',             periodEn: 'Jul 2024' },
  { id: 'chantblaster',hu: 'Chantblaster',             period: '2024. máj – jún',       periodEn: 'May – Jun 2024' },
  { id: 'alphavet',    hu: 'Tappancs',                period: '2024. márc – szept',    periodEn: 'Mar – Sep 2024' },
  { id: 'uniqa',       hu: 'UNIQA',                   period: '2023. szept – 2024. márc', periodEn: 'Sep 2023 – Mar 2024' },
  { id: 'winefo',      hu: 'Winefo',                  period: '2023. júl – aug',       periodEn: 'Jul – Aug 2023' },
  { id: 'mixie',       hu: 'Mixie',                   period: null,                    periodEn: null },
  { id: 'b4us',        hu: 'Booked4Us',               period: null,                    periodEn: null },
  { id: 'di-insurtech',hu: 'DI InsurTech',            period: null,                    periodEn: null },
  { id: 'presales',    hu: 'Presales konzultációk',   period: null,                    periodEn: null },
]

function TimelineEntry({ children, delay = 0 }) {
  return (
    <motion.div
      className="tl-entry"
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

function TimelineCv() {
  const { language } = useLanguage()
  const t = useTranslation()
  const isHu = language === 'hu'

  const projects = t.works.projects
  const getProjectTitle = (id) => projects.find(p => p.id === id)?.title

  return (
    <section id="cv" className="tl-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="tl-header-row">
            <h2 className="section-title">
              {isHu
                ? <><span className="copper-text">Szakmai</span> út</>
                : <>Career <span className="copper-text">path</span></>}
            </h2>
            <a
              href="/cv-view.html"
              target="_blank"
              rel="noopener noreferrer"
              className="tl-cv-btn"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 2h7l3 3v9H3V2Z"/>
                <path d="M10 2v3h3"/>
                <path d="M6 7h4M6 10h4M6 13h2"/>
              </svg>
              {isHu ? 'CV megnyitása' : 'Open CV'}
            </a>
          </div>
          <div className="divider" />
        </motion.div>

        <div className="tl-track">

          {/* Danubius IT Solutions */}
          <TimelineEntry delay={0.04}>
            <div className="tl-dot tl-dot--employer" />
            <div className="tl-body">
              <span className="tl-period">2023. márc – 2026. máj</span>
              <h3 className="tl-title tl-title--employer">Danubius IT Solutions</h3>
              <p className="tl-meta">{isHu ? 'Product designer' : 'Product designer'}</p>

              <div className="tl-projects">
                {DANUBIUS_PROJECTS.map((proj, i) => (
                  <motion.button
                    key={proj.id}
                    className="tl-proj-chip"
                    onClick={() => openProjectModal(proj.id)}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.06 + i * 0.04 }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="tl-chip-name">{getProjectTitle(proj.id) || proj.hu}</span>
                    {proj.period && (
                      <span className="tl-chip-period">
                        {isHu ? proj.period : proj.periodEn}
                      </span>
                    )}
                    <svg className="tl-chip-arrow" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 8L8 2M8 2H3.5M8 2v4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.button>
                ))}
              </div>
            </div>
          </TimelineEntry>

          {/* Appartman */}
          <TimelineEntry delay={0.08}>
            <div className="tl-dot tl-dot--employer" />
            <div className="tl-body">
              <span className="tl-period">2022. okt – 2023. márc</span>
              <h3 className="tl-title tl-title--employer">Appartman PMS Technologies</h3>
              <p className="tl-meta">{isHu ? 'Product designer' : 'Product designer'}</p>
              <button className="tl-proj-link" onClick={() => openProjectModal('appartman')}>
                {isHu ? 'Appartman projekt megtekintése' : 'View Appartman project'}
                <svg className="tl-proj-icon" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </TimelineEntry>

          {/* Képzések */}
          <TimelineEntry delay={0.12}>
            <div className="tl-dot" />
            <div className="tl-body">
              <span className="tl-period">2022 – 2023</span>
              <h3 className="tl-title">{isHu ? 'Képzések & Kurzusok' : 'Education & Courses'}</h3>
              <ul className="tl-edu-list">
                <li><span className="tl-edu-year">2023</span>UI Design — Udemy</li>
                <li><span className="tl-edu-year">2022</span>UX Bootcamp — xLabs</li>
                <li><span className="tl-edu-year">2022</span>UX Project — xLabs</li>
                <li><span className="tl-edu-year">2022</span>{isHu ? 'Digitális grafika' : 'Digital graphics'} — Webler</li>
              </ul>
            </div>
          </TimelineEntry>

          {/* Angoltanár */}
          <TimelineEntry delay={0.16}>
            <div className="tl-dot" />
            <div className="tl-body">
              <span className="tl-period">2020 – 2022</span>
              <h3 className="tl-title">{isHu ? 'Angoltanár' : 'English Teacher'}</h3>
              <p className="tl-meta">Dunakeszi Széchenyi István Általános Iskola</p>

              <ul className="tl-sub-list">
                <li>
                  <span className="tl-sub-year">2021</span>
                  <span className="tl-sub-body">
                    <span className="tl-sub-title">{isHu ? 'Iskolai weboldal — önkéntes' : 'School website — volunteer'}</span>
                  </span>
                </li>
              </ul>
            </div>
          </TimelineEntry>

          {/* MTA */}
          <TimelineEntry delay={0.2}>
            <div className="tl-dot" />
            <div className="tl-body">
              <span className="tl-period">2017. máj – 2017. okt</span>
              <h3 className="tl-title">{isHu ? 'Interjúztató' : 'Interviewer'}</h3>
              <p className="tl-meta">{isHu ? 'MTA Szociológiai Intézet' : 'Institute for Sociology, HAS'}</p>
            </div>
          </TimelineEntry>

          {/* ELTE */}
          <TimelineEntry delay={0.24}>
            <div className="tl-dot tl-dot--edu" />
            <div className="tl-body">
              <span className="tl-period">2014 – 2020</span>
              <h3 className="tl-title">Eötvös Loránd Tudományegyetem (ELTE)</h3>
              <p className="tl-meta">{isHu ? 'Középiskolai angol és spanyol nyelv és kultúra tanára — mesterdiploma' : 'MA — Secondary school teacher of English and Spanish language & culture'}</p>

              <ul className="tl-sub-list">
                <li>
                  <span className="tl-sub-year">2015 – 2020</span>
                  <span className="tl-sub-body">
                    <span className="tl-sub-title">Eötvös József Collegium</span>
                    <span className="tl-sub-meta">{isHu ? 'Szakkollégium · spanyol és angol-amerikai műhelyek' : 'Academic college · Spanish and Anglo-American workshops'}</span>
                  </span>
                </li>
                <li>
                  <span className="tl-sub-year">2018</span>
                  <span className="tl-sub-body">
                    <span className="tl-sub-title">Universidad de Córdoba</span>
                    <span className="tl-sub-meta">Erasmus+ {isHu ? 'ösztöndíj' : 'scholarship'}</span>
                  </span>
                </li>
              </ul>
            </div>
          </TimelineEntry>

        </div>
      </div>
    </section>
  )
}

export default TimelineCv
