// Az Osztályterem adatai (diáknevek, pontok, jelenlét) – osztályonként egy
// JSON-dokumentum. Élesben a Netlify Blobs tárolóban, AES-256-GCM-mel
// titkosítva (CONTENT_KEY), így a tárhelyen sincs olvasható diákadat.
// Helyi fejlesztésnél a .netlify/classroom-dev/ mappába ír (gitignore-olt).
import fs from 'node:fs/promises'
import path from 'node:path'
import { seal, open } from './security.mjs'

export const CLASSES = ['9b', '9d']
export const isClass = (c) => CLASSES.includes(c)

let storePromise = null
async function getStoreSafe() {
  if (!storePromise) {
    storePromise = import('@netlify/blobs')
      .then(({ getStore }) => getStore({ name: 'classroom', consistency: 'strong' }))
      .catch(() => null)
  }
  try {
    return await storePromise
  } catch {
    return null
  }
}

const DEV_DIR = path.resolve(process.cwd(), '.netlify', 'classroom-dev')
const isNetlify = () => Boolean(process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT || process.env.NETLIFY_BLOBS_CONTEXT)

async function readRaw(key) {
  if (isNetlify()) {
    const store = await getStoreSafe()
    if (!store) throw new Error('blobs unavailable')
    const buf = await store.get(key, { type: 'arrayBuffer' })
    return buf ? Buffer.from(buf) : null
  }
  try {
    return await fs.readFile(path.join(DEV_DIR, `${key}.enc`))
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

async function writeRaw(key, buf) {
  if (isNetlify()) {
    const store = await getStoreSafe()
    if (!store) throw new Error('blobs unavailable')
    await store.set(key, buf)
    return
  }
  await fs.mkdir(DEV_DIR, { recursive: true })
  await fs.writeFile(path.join(DEV_DIR, `${key}.enc`), buf)
}

export async function loadClass(cls) {
  const raw = await readRaw(`class-${cls}`)
  if (!raw) return null
  return JSON.parse(open(raw).toString('utf8'))
}

export async function saveClass(cls, doc) {
  await writeRaw(`class-${cls}`, seal(Buffer.from(JSON.stringify(doc), 'utf8')))
}
