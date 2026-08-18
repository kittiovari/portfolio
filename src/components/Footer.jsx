import { useState } from 'react'
import { useTranslation, useLanguage } from '../i18n/LanguageContext.jsx'
import './Footer.css'

function Footer() {
  const t = useTranslation()
  const { language } = useLanguage()
  const [copied, setCopied] = useState(false)
  const isHu = language === 'hu'

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText('kitti.ovari@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <footer id="footer" className="footer">
      <div className="container footer__content">

        {/* Heading */}
        <h2 className="footer__heading">
          {isHu
            ? <>Keress <span className="footer__heading-accent">bátran!</span></>
            : <>Let's <span className="footer__heading-accent">connect.</span></>}
        </h2>

        {/* Contact pills */}
        <div className="footer__pills">
          <button className="footer__pill" onClick={handleCopyEmail}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="16" height="12" rx="2"/>
              <path d="m2 6 8 6 8-6"/>
            </svg>
            <span>kitti.ovari@gmail.com</span>
            <span className={`footer__copied ${copied ? 'footer__copied--visible' : ''}`}>
              {isHu ? 'Kimásolva!' : 'Copied!'}
            </span>
          </button>

          <a href="tel:+36306386073" className="footer__pill">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h1.372c.38 0 .713.238.84.596l1.092 3.057a.9.9 0 0 1-.206.959L6.4 8.8a11.4 11.4 0 0 0 4.8 4.8l1.188-1.198a.9.9 0 0 1 .96-.206l3.056 1.092c.358.127.596.46.596.84V15.5A1.5 1.5 0 0 1 15.5 17C8.596 17 3 11.404 3 4.5Z"/>
            </svg>
            +36 30 638 60 73
          </a>

          <a
            href="https://linkedin.com/in/kitti-h-ovari"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__pill"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M16.667 2H3.333A1.333 1.333 0 0 0 2 3.333v13.334A1.333 1.333 0 0 0 3.333 18h13.334A1.333 1.333 0 0 0 18 16.667V3.333A1.333 1.333 0 0 0 16.667 2ZM7.333 14.667H5.333V8h2v6.667Zm-1-7.584a1.083 1.083 0 1 1 0-2.166 1.083 1.083 0 0 1 0 2.166Zm8.334 7.584h-2v-3.25c0-.817-.017-1.867-1.167-1.867-1.167 0-1.333.9-1.333 1.8v3.317h-2V8h1.917v.917h.025c.275-.5.933-1 1.908-1 2.042 0 2.417 1.342 2.417 3.083l-.767 3.667Z"/>
            </svg>
            /kitti-h-ovari
          </a>
        </div>

        {/* Divider */}
        <div className="footer__divider" />

        {/* Bottom bar */}
        <div className="footer__bottom">
          <div className="footer__logo">
            <img src="/images/logo-dark.svg" alt="H. Óvári Kitti" className="footer__logo-img" />
          </div>
          <p className="footer__location">{t.footer.closing}</p>
          <p className="footer__copyright">&copy; {new Date().getFullYear()} {t.footer.rights}</p>
        </div>

      </div>
    </footer>
  )
}

export default Footer
