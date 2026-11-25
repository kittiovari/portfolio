// npm run seal
// A content-src/ (gitignore-olt, nyers) mappa tartalmát titkosítja a
// protected/ mappába. Csak a protected/ kerül a repóba – kulcs nélkül
// olvashatatlan. Kulcs: CONTENT_KEY a .env-ben (és a Netlify-on).
//
// Csak a ténylegesen megváltozott fájlokat titkosítja újra (a titkosítás
// minden futáskor más eredményt ad, így különben minden kép „változna”),
// és törli azokat a titkosított fájlokat, amelyeknek már nincs forrása.
import fs from 'node:fs'
import path from 'node:path'
import { loadEnv } from './env.mjs'
import { seal, open } from '../netlify/lib/security.mjs'

loadEnv()
const SRC = path.resolve('content-src')
const OUT = path.resolve('protected')
const SAFE_NAME = /^[A-Za-z0-9._\-]+$/

if (!fs.existsSync(SRC)) {
  console.error('Nincs content-src/ mappa – nincs mit titkosítani.')
  process.exit(1)
}

const stats = { written: 0, unchanged: 0, removed: 0 }

// Akkor írjuk újra, ha a meglévő titkosított fájl nem pontosan ezt tartalmazza
function sealIfChanged(plain, target) {
  if (fs.existsSync(target)) {
    try {
      if (open(fs.readFileSync(target)).equals(plain)) {
        stats.unchanged++
        return
      }
    } catch {
      /* más kulccsal készült vagy sérült → újratitkosítjuk */
    }
  }
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, seal(plain))
  stats.written++
}

const sourceAreas = fs.readdirSync(SRC).filter((a) => fs.statSync(path.join(SRC, a)).isDirectory())

for (const area of sourceAreas) {
  const areaDir = path.join(SRC, area)
  const expected = new Set()

  const contentPath = path.join(areaDir, 'content.json')
  if (fs.existsSync(contentPath)) {
    const plain = fs.readFileSync(contentPath)
    JSON.parse(plain.toString('utf8')) // érvényes JSON?
    const target = path.join(OUT, area, 'content.json.enc')
    sealIfChanged(plain, target)
    expected.add(target)
  }

  const assetsDir = path.join(areaDir, 'assets')
  if (fs.existsSync(assetsDir)) {
    for (const name of fs.readdirSync(assetsDir)) {
      if (!SAFE_NAME.test(name)) {
        console.warn(`Kihagyva (csak ékezet nélküli betű, szám, . _ - lehet): ${area}/assets/${name}`)
        continue
      }
      const target = path.join(OUT, area, 'assets', `${name}.enc`)
      sealIfChanged(fs.readFileSync(path.join(assetsDir, name)), target)
      expected.add(target)
    }
  }

  // Elavult titkosított fájlok törlése ebben a területben
  const outArea = path.join(OUT, area)
  for (const rel of fs.existsSync(outArea) ? fs.readdirSync(outArea, { recursive: true }) : []) {
    const full = path.join(outArea, rel)
    if (fs.statSync(full).isFile() && !expected.has(full)) {
      fs.rmSync(full)
      stats.removed++
    }
  }
}

// Olyan terület, amelynek már nincs forrása → teljes törlés
for (const area of fs.existsSync(OUT) ? fs.readdirSync(OUT) : []) {
  if (!sourceAreas.includes(area)) {
    fs.rmSync(path.join(OUT, area), { recursive: true, force: true })
    stats.removed++
  }
}

console.log(`Kész: ${stats.written} titkosítva, ${stats.unchanged} változatlan, ${stats.removed} elavult törölve.`)
