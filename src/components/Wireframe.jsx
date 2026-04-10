import './Wireframe.css'

const wireframes = {
  portal: (
    <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sidebar */}
      <rect x="0" y="0" width="80" height="260" fill="currentColor" opacity="0.08"/>
      <rect x="16" y="16" width="48" height="6" rx="3" fill="currentColor" opacity="0.15"/>
      <rect x="16" y="36" width="40" height="4" rx="2" fill="currentColor" opacity="0.1"/>
      <rect x="16" y="50" width="44" height="4" rx="2" fill="currentColor" opacity="0.1"/>
      <rect x="16" y="64" width="36" height="4" rx="2" fill="currentColor" opacity="0.1"/>
      <rect x="16" y="78" width="42" height="4" rx="2" fill="currentColor" opacity="0.1"/>
      {/* Header */}
      <rect x="80" y="0" width="320" height="36" fill="currentColor" opacity="0.04"/>
      <rect x="96" y="14" width="80" height="8" rx="4" fill="currentColor" opacity="0.1"/>
      <circle cx="370" cy="18" r="10" fill="currentColor" opacity="0.08"/>
      {/* Dashboard cards */}
      <rect x="96" y="48" width="88" height="56" rx="6" fill="currentColor" opacity="0.06"/>
      <rect x="196" y="48" width="88" height="56" rx="6" fill="currentColor" opacity="0.06"/>
      <rect x="296" y="48" width="88" height="56" rx="6" fill="currentColor" opacity="0.06"/>
      {/* Table */}
      <rect x="96" y="118" width="288" height="130" rx="6" fill="currentColor" opacity="0.04"/>
      <rect x="108" y="130" width="264" height="4" rx="2" fill="currentColor" opacity="0.08"/>
      <rect x="108" y="146" width="264" height="1" fill="currentColor" opacity="0.05"/>
      <rect x="108" y="158" width="200" height="3" rx="1.5" fill="currentColor" opacity="0.06"/>
      <rect x="108" y="172" width="264" height="1" fill="currentColor" opacity="0.05"/>
      <rect x="108" y="184" width="180" height="3" rx="1.5" fill="currentColor" opacity="0.06"/>
      <rect x="108" y="198" width="264" height="1" fill="currentColor" opacity="0.05"/>
      <rect x="108" y="210" width="220" height="3" rx="1.5" fill="currentColor" opacity="0.06"/>
    </svg>
  ),
  mobile: (
    <svg viewBox="0 0 200 360" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Phone frame */}
      <rect x="20" y="8" width="160" height="344" rx="20" stroke="currentColor" strokeWidth="2" opacity="0.12"/>
      <rect x="70" y="16" width="60" height="4" rx="2" fill="currentColor" opacity="0.1"/>
      {/* Status bar */}
      <rect x="32" y="32" width="136" height="16" fill="currentColor" opacity="0.04"/>
      {/* Hero image placeholder */}
      <rect x="32" y="56" width="136" height="80" rx="8" fill="currentColor" opacity="0.06"/>
      <circle cx="100" cy="96" r="16" fill="currentColor" opacity="0.06"/>
      {/* Cards */}
      <rect x="32" y="148" width="64" height="72" rx="6" fill="currentColor" opacity="0.05"/>
      <rect x="104" y="148" width="64" height="72" rx="6" fill="currentColor" opacity="0.05"/>
      {/* Text */}
      <rect x="32" y="232" width="100" height="6" rx="3" fill="currentColor" opacity="0.1"/>
      <rect x="32" y="248" width="136" height="3" rx="1.5" fill="currentColor" opacity="0.06"/>
      <rect x="32" y="260" width="120" height="3" rx="1.5" fill="currentColor" opacity="0.06"/>
      {/* Button */}
      <rect x="32" y="280" width="136" height="32" rx="16" fill="currentColor" opacity="0.08"/>
      {/* Nav bar */}
      <rect x="32" y="324" width="136" height="20" rx="4" fill="currentColor" opacity="0.04"/>
      <circle cx="60" cy="334" r="6" fill="currentColor" opacity="0.08"/>
      <circle cx="100" cy="334" r="6" fill="currentColor" opacity="0.08"/>
      <circle cx="140" cy="334" r="6" fill="currentColor" opacity="0.08"/>
    </svg>
  ),
  chatbot: (
    <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Chat window */}
      <rect x="60" y="8" width="280" height="244" rx="12" stroke="currentColor" strokeWidth="1.5" opacity="0.1"/>
      {/* Header */}
      <rect x="60" y="8" width="280" height="36" rx="12" fill="currentColor" opacity="0.06"/>
      <circle cx="84" cy="26" r="10" fill="currentColor" opacity="0.1"/>
      <rect x="100" y="22" width="60" height="6" rx="3" fill="currentColor" opacity="0.12"/>
      {/* Messages */}
      <rect x="80" y="56" width="140" height="28" rx="14" fill="currentColor" opacity="0.06"/>
      <rect x="80" y="64" width="100" height="4" rx="2" fill="currentColor" opacity="0.08"/>
      <rect x="200" y="96" width="120" height="28" rx="14" fill="currentColor" opacity="0.08"/>
      <rect x="212" y="104" width="80" height="4" rx="2" fill="currentColor" opacity="0.06"/>
      <rect x="80" y="136" width="160" height="36" rx="14" fill="currentColor" opacity="0.06"/>
      <rect x="80" y="146" width="120" height="4" rx="2" fill="currentColor" opacity="0.08"/>
      <rect x="80" y="158" width="80" height="4" rx="2" fill="currentColor" opacity="0.08"/>
      {/* AI badge */}
      <rect x="80" y="184" width="32" height="14" rx="7" fill="currentColor" opacity="0.1"/>
      <rect x="88" y="189" width="16" height="4" rx="2" fill="currentColor" opacity="0.08"/>
      {/* Input */}
      <rect x="76" y="216" width="248" height="28" rx="14" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
      <rect x="92" y="226" width="80" height="4" rx="2" fill="currentColor" opacity="0.06"/>
      <circle cx="308" cy="230" r="10" fill="currentColor" opacity="0.08"/>
    </svg>
  ),
  form: (
    <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Header */}
      <rect x="80" y="12" width="240" height="8" rx="4" fill="currentColor" opacity="0.12"/>
      <rect x="120" y="28" width="160" height="4" rx="2" fill="currentColor" opacity="0.06"/>
      {/* Form */}
      <rect x="80" y="52" width="240" height="180" rx="10" fill="currentColor" opacity="0.03"/>
      <rect x="100" y="68" width="60" height="4" rx="2" fill="currentColor" opacity="0.1"/>
      <rect x="100" y="80" width="200" height="24" rx="6" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
      <rect x="100" y="118" width="60" height="4" rx="2" fill="currentColor" opacity="0.1"/>
      <rect x="100" y="130" width="200" height="24" rx="6" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
      <rect x="100" y="168" width="60" height="4" rx="2" fill="currentColor" opacity="0.1"/>
      <rect x="100" y="180" width="200" height="24" rx="6" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
      {/* Button */}
      <rect x="200" y="216" width="100" height="28" rx="14" fill="currentColor" opacity="0.1"/>
    </svg>
  ),
  audit: (
    <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Magnifying glass */}
      <circle cx="200" cy="100" r="50" stroke="currentColor" strokeWidth="2" opacity="0.08"/>
      <line x1="236" y1="136" x2="270" y2="170" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.08"/>
      {/* Checklist */}
      <rect x="120" y="90" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1" opacity="0.12"/>
      <rect x="140" y="92" width="60" height="4" rx="2" fill="currentColor" opacity="0.08"/>
      <rect x="120" y="108" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1" opacity="0.12"/>
      <rect x="140" y="110" width="48" height="4" rx="2" fill="currentColor" opacity="0.08"/>
      {/* Score bar */}
      <rect x="100" y="190" width="200" height="8" rx="4" fill="currentColor" opacity="0.05"/>
      <rect x="100" y="190" width="140" height="8" rx="4" fill="currentColor" opacity="0.1"/>
      <rect x="130" y="210" width="140" height="4" rx="2" fill="currentColor" opacity="0.06"/>
    </svg>
  ),
  hr: (
    <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Emoji faces */}
      <circle cx="120" cy="80" r="24" stroke="currentColor" strokeWidth="1.5" opacity="0.1"/>
      <path d="M110 88 Q120 96 130 88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.12"/>
      <circle cx="113" cy="76" r="2" fill="currentColor" opacity="0.12"/>
      <circle cx="127" cy="76" r="2" fill="currentColor" opacity="0.12"/>
      <circle cx="200" cy="80" r="24" stroke="currentColor" strokeWidth="1.5" opacity="0.1"/>
      <line x1="190" y1="88" x2="210" y2="88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.12"/>
      <circle cx="193" cy="76" r="2" fill="currentColor" opacity="0.12"/>
      <circle cx="207" cy="76" r="2" fill="currentColor" opacity="0.12"/>
      <circle cx="280" cy="80" r="24" stroke="currentColor" strokeWidth="1.5" opacity="0.1"/>
      <path d="M270 92 Q280 84 290 92" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.12"/>
      <circle cx="273" cy="76" r="2" fill="currentColor" opacity="0.12"/>
      <circle cx="287" cy="76" r="2" fill="currentColor" opacity="0.12"/>
      {/* Chart bars */}
      <rect x="100" y="200" width="24" height="40" rx="4" fill="currentColor" opacity="0.08"/>
      <rect x="140" y="180" width="24" height="60" rx="4" fill="currentColor" opacity="0.08"/>
      <rect x="180" y="160" width="24" height="80" rx="4" fill="currentColor" opacity="0.1"/>
      <rect x="220" y="170" width="24" height="70" rx="4" fill="currentColor" opacity="0.08"/>
      <rect x="260" y="190" width="24" height="50" rx="4" fill="currentColor" opacity="0.06"/>
    </svg>
  ),
  event: (
    <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stage */}
      <rect x="100" y="20" width="200" height="100" rx="8" fill="currentColor" opacity="0.04"/>
      {/* Light beams */}
      <line x1="200" y1="40" x2="120" y2="200" stroke="currentColor" strokeWidth="1" opacity="0.06"/>
      <line x1="200" y1="40" x2="200" y2="220" stroke="currentColor" strokeWidth="1" opacity="0.06"/>
      <line x1="200" y1="40" x2="280" y2="200" stroke="currentColor" strokeWidth="1" opacity="0.06"/>
      {/* Phones */}
      <rect x="100" y="170" width="20" height="36" rx="3" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
      <rect x="140" y="160" width="20" height="36" rx="3" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
      <rect x="180" y="165" width="20" height="36" rx="3" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
      <rect x="220" y="155" width="20" height="36" rx="3" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
      <rect x="260" y="168" width="20" height="36" rx="3" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
      {/* Glow effects */}
      <circle cx="110" cy="178" r="4" fill="currentColor" opacity="0.12"/>
      <circle cx="150" cy="168" r="4" fill="currentColor" opacity="0.12"/>
      <circle cx="190" cy="173" r="4" fill="currentColor" opacity="0.12"/>
      <circle cx="230" cy="163" r="4" fill="currentColor" opacity="0.12"/>
      <circle cx="270" cy="176" r="4" fill="currentColor" opacity="0.12"/>
    </svg>
  ),
  saas: (
    <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Browser frame */}
      <rect x="40" y="16" width="320" height="228" rx="8" stroke="currentColor" strokeWidth="1.5" opacity="0.1"/>
      <rect x="40" y="16" width="320" height="28" rx="8" fill="currentColor" opacity="0.04"/>
      <circle cx="58" cy="30" r="4" fill="currentColor" opacity="0.1"/>
      <circle cx="72" cy="30" r="4" fill="currentColor" opacity="0.1"/>
      <circle cx="86" cy="30" r="4" fill="currentColor" opacity="0.1"/>
      <rect x="110" y="26" width="180" height="8" rx="4" fill="currentColor" opacity="0.05"/>
      {/* Content */}
      <rect x="60" y="56" width="120" height="8" rx="4" fill="currentColor" opacity="0.1"/>
      <rect x="60" y="76" width="280" height="3" rx="1.5" fill="currentColor" opacity="0.05"/>
      <rect x="60" y="86" width="240" height="3" rx="1.5" fill="currentColor" opacity="0.05"/>
      {/* Cards row */}
      <rect x="60" y="104" width="90" height="64" rx="6" fill="currentColor" opacity="0.05"/>
      <rect x="160" y="104" width="90" height="64" rx="6" fill="currentColor" opacity="0.05"/>
      <rect x="260" y="104" width="80" height="64" rx="6" fill="currentColor" opacity="0.05"/>
      {/* CTA */}
      <rect x="60" y="186" width="100" height="28" rx="14" fill="currentColor" opacity="0.08"/>
      <rect x="172" y="186" width="80" height="28" rx="14" stroke="currentColor" strokeWidth="1" opacity="0.08"/>
    </svg>
  ),
}

const projectWireframeMap = {
  cig: 'portal',
  cib: 'portal',
  uniqa: 'form',
  aimee: 'chatbot',
  alphavet: 'form',
  'di-insurtech': 'saas',
  appartman: 'portal',
  chantblaster: 'event',
  cec: 'saas',
  moodmeup: 'hr',
  b4us: 'saas',
  gombarat: 'mobile',
  mixie: 'saas',
  winefo: 'saas',
  zohi: 'audit',
  gilinda: 'audit',
  antares: 'audit',
  geroa: 'saas',
  testgroup: 'saas',
  mixieqr: 'mobile',
}

function Wireframe({ projectId }) {
  const type = projectWireframeMap[projectId] || 'saas'
  return (
    <div className="wireframe">
      {wireframes[type]}
    </div>
  )
}

export default Wireframe
