import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { translations } from './translations'

const LanguageContext = createContext()

// Mély összefésülés: a szerverről érkező védett szövegeket a nyilvános
// fordításokra „rátesszük” (pl. topics.language.intro a topics.language.title mellé).
function deepMerge(base, extra) {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return extra ?? base
  const out = { ...(base && typeof base === 'object' && !Array.isArray(base) ? base : {}) }
  for (const [k, v] of Object.entries(extra)) out[k] = deepMerge(out[k], v)
  return out
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('hu')
  // Feloldott területek szerverről kapott tartalma: { ux: { hu, en, ... }, ... }
  const [protectedContent, setProtectedContent] = useState({})

  const addProtected = useCallback((area, data) => {
    setProtectedContent((prev) => ({ ...prev, [area]: data }))
  }, [])

  const t = useMemo(() => {
    let merged = translations[language]
    for (const data of Object.values(protectedContent)) merged = deepMerge(merged, data?.[language])
    return merged
  }, [language, protectedContent])

  const value = useMemo(
    () => ({ language, setLanguage, t, protectedContent, addProtected }),
    [language, t, protectedContent, addProtected]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export function useTranslation() {
  return useContext(LanguageContext).t
}

export function useProtectedContent() {
  const { protectedContent, addProtected } = useContext(LanguageContext)
  return { protectedContent, addProtected }
}
