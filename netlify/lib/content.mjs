// A védett tartalom betöltése és visszafejtése a protected/ mappából.
// A protected/ mappában csak titkosított (.enc) fájlok vannak; ezek a
// nyilvános repóban is biztonságban vannak, mert a kulcs (CONTENT_KEY)
// csak a Netlify környezeti változóiban és a helyi .env-ben létezik.
import fs from 'node:fs/promises'
import path from 'node:path'
import { open } from './security.mjs'

// A protected/ mappa helye: helyben a repó gyökere, Netlify-on a függvény
// csomagjának gyökere (included_files) – mindkettőt megpróbáljuk.
const ROOTS = [
  path.resolve(process.cwd(), 'protected'),
  process.env.LAMBDA_TASK_ROOT && path.resolve(process.env.LAMBDA_TASK_ROOT, 'protected'),
].filter(Boolean)

async function readFirst(rel) {
  let lastErr
  for (const root of ROOTS) {
    try {
      return await fs.readFile(path.join(root, rel))
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}

// Csak biztonságos fájlnevek: nincs „..”, nincs perjel → nem lehet kilépni a mappából
const SAFE_NAME = /^[A-Za-z0-9._\-]+$/

export async function readArea(area) {
  let buf
  try {
    buf = await readFirst(path.join(area, 'content.json.enc'))
  } catch (err) {
    // Tartalom nélküli terület (pl. teacher): üres objektum
    if (err?.code === 'ENOENT') return {}
    throw err
  }
  return JSON.parse(open(buf).toString('utf8'))
}

export async function readAsset(area, name) {
  if (!SAFE_NAME.test(name) || name.includes('..')) return null
  try {
    return open(await readFirst(path.join(area, 'assets', `${name}.enc`)))
  } catch {
    return null
  }
}

const TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  gif: 'image/gif',
  pdf: 'application/pdf',
}

export const contentType = (name) => TYPES[name.split('.').pop().toLowerCase()] || 'application/octet-stream'
