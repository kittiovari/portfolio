// npm run seal
// A content-src/ (gitignore-olt, nyers) mappa tartalmát titkosítja a
// protected/ mappába. Csak a protected/ kerül a repóba – kulcs nélkül
// olvashatatlan. Kulcs: CONTENT_KEY a .env-ben (és a Netlify-on).
import fs from 'node:fs'
import path from 'node:path'
import { loadEnv } from './env.mjs'
import { seal } from '../netlify/lib/security.mjs'

loadEnv()
const SRC = path.resolve('content-src')
const OUT = path.resolve('protected')
const SAFE_NAME = /^[A-Za-z0-9._\-]+$/

if (!fs.existsSync(SRC)) {
  console.error('Nincs content-src/ mappa – nincs mit titkosítani.')
  process.exit(1)
}

let count = 0
for (const area of fs.readdirSync(SRC)) {
  const areaDir = path.join(SRC, area)
  if (!fs.statSync(areaDir).isDirectory()) continue

  // A régi titkosított fájlokat töröljük, hogy ne maradjon elavult tartalom
  fs.rmSync(path.join(OUT, area), { recursive: true, force: true })
  fs.mkdirSync(path.join(OUT, area, 'assets'), { recursive: true })

  const contentPath = path.join(areaDir, 'content.json')
  if (fs.existsSync(contentPath)) {
    JSON.parse(fs.readFileSync(contentPath, 'utf8')) // érvényes JSON?
    fs.writeFileSync(path.join(OUT, area, 'content.json.enc'), seal(fs.readFileSync(contentPath)))
    count++
  }

  const assetsDir = path.join(areaDir, 'assets')
  if (fs.existsSync(assetsDir)) {
    for (const name of fs.readdirSync(assetsDir)) {
      if (!SAFE_NAME.test(name)) {
        console.warn(`Kihagyva (csak ékezet nélküli betű, szám, . _ - lehet): ${area}/assets/${name}`)
        continue
      }
      fs.writeFileSync(path.join(OUT, area, 'assets', `${name}.enc`), seal(fs.readFileSync(path.join(assetsDir, name))))
      count++
    }
  }
}
console.log(`Kész: ${count} fájl titkosítva a protected/ mappába.`)
