import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getTimeTheme() {
  const hour = new Date().getHours()
  return (hour >= 20 || hour < 7) ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored) return stored
    return getSystemTheme()
  })

  const [timeBasedEnabled, setTimeBasedEnabled] = useState(() => {
    return localStorage.getItem('theme-time-based') === 'true'
  })

  // Apply data-theme to <html>
  useEffect(() => {
    const active = timeBasedEnabled ? getTimeTheme() : theme
    document.documentElement.setAttribute('data-theme', active)
  }, [theme, timeBasedEnabled])

  // Time-based: check every minute
  useEffect(() => {
    if (!timeBasedEnabled) return
    const interval = setInterval(() => {
      document.documentElement.setAttribute('data-theme', getTimeTheme())
    }, 60_000)
    return () => clearInterval(interval)
  }, [timeBasedEnabled])

  // System preference change listener (only if no manual override)
  useEffect(() => {
    if (localStorage.getItem('theme')) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  const toggleTimeBased = () => {
    const next = !timeBasedEnabled
    setTimeBasedEnabled(next)
    localStorage.setItem('theme-time-based', String(next))
    if (!next) {
      const stored = localStorage.getItem('theme')
      const active = stored || getSystemTheme()
      setTheme(active)
      document.documentElement.setAttribute('data-theme', active)
    }
  }

  const isDark = timeBasedEnabled ? getTimeTheme() === 'dark' : theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggle, timeBasedEnabled, toggleTimeBased }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
