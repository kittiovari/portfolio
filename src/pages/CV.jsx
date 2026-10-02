import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { useTranslation } from '../i18n/LanguageContext.jsx'
import '../components/CV.css'

function CV() {
  const { language, setLanguage } = useLanguage()
  const [copied, setCopied] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])
  useEffect(() => {
    const prev = document.title
    document.title = 'Horváthné Óvári Kitti – CV 2026'
    return () => { document.title = prev }
  }, [])

  const copyEmail = (e) => {
    e.preventDefault()
    copyText('kitti.ovari@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const t = useTranslation()
  const cv = t.cv

  return (
    <div className="cv">
      <header className="cv__topbar">
        <Link to="/" className="cv__back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {cv.back}
        </Link>
        <div className="cv__topbar-right">
          <div className="navbar__lang">
            <button className={language === 'hu' ? 'navbar__lang-btn navbar__lang-btn--active' : 'navbar__lang-btn'} onClick={() => setLanguage('hu')}>HU</button>
            <span className="navbar__lang-divider">|</span>
            <button className={language === 'en' ? 'navbar__lang-btn navbar__lang-btn--active' : 'navbar__lang-btn'} onClick={() => setLanguage('en')}>EN</button>
          </div>
          <a href="/CV.pdf" target="_blank" rel="noopener noreferrer" className="cv__print-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', marginRight: '0.45em', verticalAlign: 'middle', flexShrink: 0 }}>
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            {cv.download}
          </a>
        </div>
      </header>

      <div className="cv__layout">

        {/* ── Bal oldalsáv ── */}
        <aside className="cv__sidebar">
          <div className="cv__photo-wrap">
            <img src="/images/me.png" alt="Horváthné Óvári Kitti" className="cv__photo" />
          </div>

          <h1 className="cv__name">Horváthné Óvári Kitti</h1>
          <p className="cv__role">{cv.role}</p>
          <p className="cv__intro">{cv.intro}</p>

          {/* Kapcsolat */}
          <div className="cv__group">
            <h2 className="cv__group-label">{cv.sidebar.contact}</h2>
            <ul className="cv__contact">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                <a href="#" onClick={copyEmail} className="cv__copy-email">
                  {copied ? (language === 'hu' ? 'Kimásolva' : 'Copied') : 'kitti.ovari@gmail.com'}
                </a>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                <a href="https://linkedin.com/in/kitti-h-ovari" target="_blank" rel="noopener noreferrer">/kitti-h-ovari</a>
              </li>
            </ul>
          </div>

          {/* Nyelvek */}
          <div className="cv__group">
            <h2 className="cv__group-label">{cv.sidebar.languages}</h2>
            <ul className="cv__langs">
              {cv.sidebar.langs.map(l => (
                <li key={l.name}>
                  <span className="cv__lang-name">{l.name}</span>
                  <span className="cv__lang-level">{l.level}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Jogosítvány */}
          <div className="cv__group">
            <h2 className="cv__group-label">{cv.sidebar.license}</h2>
            <p className="cv__misc">{cv.sidebar.licenseValue}</p>
          </div>
        </aside>

        {/* ── Fő tartalom ── */}
        <main className="cv__main">

          {/* Munkatapasztalat */}
          <section className="cv__section">
            <h2 className="cv__section-title">{cv.sectionExperience}</h2>

            {/* Danubius */}
            <div className="cv__job">
              <div className="cv__job-head">
                <div>
                  <h3 className="cv__job-title">{cv.jobs[0].title}</h3>
                  <p className="cv__job-company">{cv.jobs[0].company}</p>
                </div>
                <span className="cv__job-period">{cv.jobs[0].period}</span>
              </div>
              <p className="cv__job-desc">{cv.jobs[0].desc}</p>

              <div className="cv__inner-section">
                <h4 className="cv__inner-title">{cv.jobs[0].featuredTitle}</h4>
                <div className="cv__proj-grid">
                  {cv.jobs[0].cats.map(cat => (
                    <div key={cat.name}>
                      <p className="cv__proj-cat">{cat.name}</p>
                      <ul className="cv__proj-list">
                        {cat.items.map(item => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Appartman */}
            <div className="cv__job">
              <div className="cv__job-head">
                <div>
                  <h3 className="cv__job-title">{cv.jobs[1].title}</h3>
                  <p className="cv__job-company">{cv.jobs[1].company}</p>
                </div>
                <span className="cv__job-period">{cv.jobs[1].period}</span>
              </div>
              <p className="cv__job-desc">{cv.jobs[1].desc}</p>
              {cv.jobs[1].workItems && (
                <ul className="cv__proj-list" style={{ marginTop: '0.6rem' }}>
                  {cv.jobs[1].workItems.map(item => <li key={item}>{item}</li>)}
                </ul>
              )}
            </div>

            {/* Tanár */}
            <div className="cv__job">
              <div className="cv__job-head">
                <div>
                  <h3 className="cv__job-title">{cv.jobs[2].title}</h3>
                  <p className="cv__job-company">{cv.jobs[2].company}</p>
                </div>
                <span className="cv__job-period">{cv.jobs[2].period}</span>
              </div>
              <p className="cv__job-desc">{cv.jobs[2].desc}</p>
              <div className="cv__practice">
                <div className="cv__practice-head">
                  <span className="cv__practice-label">{cv.jobs[2].practiceLabel}</span>
                  <span className="cv__practice-period">{cv.jobs[2].practicePeriod}</span>
                </div>
                <ul className="cv__practice-list">
                  {cv.jobs[2].practiceItems.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>

            {/* MTA */}
            <div className="cv__job cv__job--last">
              <div className="cv__job-head">
                <div>
                  <h3 className="cv__job-title">{cv.jobs[3].title}</h3>
                  <p className="cv__job-company">{cv.jobs[3].company}</p>
                </div>
                <span className="cv__job-period">{cv.jobs[3].period}</span>
              </div>
              <p className="cv__job-desc">{cv.jobs[3].desc}</p>
            </div>
          </section>

          {/* Tanulmányok + Kurzusok */}
          <section className="cv__section cv__section--last">
            <h2 className="cv__section-title">{cv.sectionEdu}</h2>
            <div className="cv__edu-row">
              <div className="cv__edu-col">
                {cv.edu.map(item => (
                  <div className="cv__edu-item" key={item.school}>
                    <h3>{item.school}</h3>
                    <p>{item.degree}</p>
                    <span>{item.period}</span>
                  </div>
                ))}
              </div>
              <div className="cv__edu-col">
                <h3 className="cv__col-title">{cv.coursesTitle}</h3>
                <ul className="cv__training">
                  {cv.courses.map(c => <li key={c}>{c}</li>)}
                </ul>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}

export default CV
