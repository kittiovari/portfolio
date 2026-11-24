// Egyszerű .env-olvasó/-író a helyi szkriptekhez (függőség nélkül).
import fs from 'node:fs'
import path from 'node:path'

export const ENV_PATH = path.resolve(process.cwd(), '.env')

export function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return {}
  const out = {}
  for (const line of fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
  for (const [k, v] of Object.entries(out)) if (process.env[k] === undefined) process.env[k] = v
  return out
}

// Egy kulcs beállítása/frissítése a .env-ben (a többi sor érintetlen marad)
export function setEnv(key, value) {
  const lines = fs.existsSync(ENV_PATH)
    ? fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/).filter((l) => l.trim() !== '')
    : []
  const i = lines.findIndex((l) => l.startsWith(`${key}=`))
  if (i >= 0) lines[i] = `${key}=${value}`
  else lines.push(`${key}=${value}`)
  fs.writeFileSync(ENV_PATH, lines.join('\n') + '\n')
  process.env[key] = value
}
