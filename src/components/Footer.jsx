import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__copyright">
          &copy; {new Date().getFullYear()} Kitti H. Óvári
        </p>
        <div className="footer__links">
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://behance.net" target="_blank" rel="noopener noreferrer">Behance</a>
          <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer">Dribbble</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
