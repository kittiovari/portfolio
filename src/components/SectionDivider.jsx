import './SectionDivider.css'

function SectionDivider() {
  return (
    <div className="section-divider">
      <div className="section-divider__line" />
      <svg className="section-divider__logo" viewBox="0 0 210 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 58 58 C 90 58, 114 84, 114 120 C 114 156, 90 182, 58 182 C 26 182, 2 156, 2 120 C 2 84, 26 58, 58 58 Z"
              stroke="currentColor" strokeWidth="5" fill="none"/>
        <path d="M 132 52 L 132 188" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
        <path d="M 132 118 C 142 118, 152 106, 160 94 C 168 82, 174 68, 182 56 C 185 51, 188 48, 192 46"
              stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M 142 126 C 152 138, 162 152, 172 164 C 178 172, 184 180, 192 188"
              stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none"/>
      </svg>
      <div className="section-divider__line" />
    </div>
  )
}

export default SectionDivider
