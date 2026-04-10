import { useState } from 'react'
import { useTranslation, useLanguage } from '../i18n/LanguageContext.jsx'
import './Footer.css'

function Footer() {
  const t = useTranslation()
  const { language } = useLanguage()
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText('kitti.ovari@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <footer id="footer" className="footer">
      <div className="container footer__content">
        <div className="footer__logo">
          <img src="/logo.svg" alt="OK" />
        </div>

        <p className="footer__tagline">
          {language === 'hu'
            ? 'Van egy projekted? Beszéljünk.'
            : 'Have a project? Let\'s talk.'}
        </p>

        <div className="footer__links">
          <button className="footer__link" onClick={handleCopyEmail}>
            <span>kitti.ovari@gmail.com</span>
            <span className={`footer__copied ${copied ? 'footer__copied--visible' : ''}`}>
              {language === 'hu' ? 'Kimásolva!' : 'Copied!'}
            </span>
          </button>

          <a
            href="https://linkedin.com/in/kitti-h-ovari"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
          >
            /kitti-h-ovari
          </a>
        </div>

        <p className="footer__copyright">
          &copy; {new Date().getFullYear()} {t.footer.rights}
        </p>
      </div>
    </footer>
  )
}

export default Footer
