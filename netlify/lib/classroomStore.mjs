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

async function deleteRaw(key) {
  if (isNetlify()) {
    const store = await getStoreSafe()
    if (!store) throw new Error('blobs unavailable')
    await store.delete(key)
    return
  }
  await fs.rm(path.join(DEV_DIR, `${key}.enc`), { force: true })
}

// ── Óraterv-források (feltöltött fájlok) ──
// Egy blob = titkosított [4 bájt meta-hossz][meta JSON][fájl tartalma]
export const FILE_ID = /^[A-Za-z0-9_-]{12,40}$/
const fileKey = (cls, id) => `file-${cls}-${id}`

export async function saveFile(cls, id, data, meta) {
  const m = Buffer.from(JSON.stringify(meta), 'utf8')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(m.length)
  await writeRaw(fileKey(cls, id), seal(Buffer.concat([len, m, data])))
}

export async function loadFile(cls, id) {
  const raw = await readRaw(fileKey(cls, id))
  if (!raw) return null
  const buf = open(raw)
  const n = buf.readUInt32BE(0)
  return { meta: JSON.parse(buf.subarray(4, 4 + n).toString('utf8')), data: buf.subarray(4 + n) }
}

export async function deleteFile(cls, id) {
  await deleteRaw(fileKey(cls, id))
}

// ── Iskolai naptár (minden osztálynak közös): tanév, szünetek, rövidített napok ──
export async function loadSchool() {
  const raw = await readRaw('school')
  return raw ? JSON.parse(open(raw).toString('utf8')) : null
}
export async function saveSchool(doc) {
  await writeRaw('school', seal(Buffer.from(JSON.stringify(doc), 'utf8')))
}
// az osztály dokumentuma a közös naptárral kiegészítve (olvasáshoz)
export async function withSchool(doc) {
  if (!doc) return doc
  const school = await loadSchool().catch(() => null)
  return school ? { ...doc, calendar: school.calendar || doc.calendar, shortDays: school.shortDays || doc.shortDays } : doc
}

// ── Fájl-index osztályonként (a Tárhely panelhez: név, típus, méret, idő) ──
const indexKey = (cls) => `fileindex-${cls}`
export async function loadFileIndex(cls) {
  const raw = await readRaw(indexKey(cls))
  return raw ? JSON.parse(open(raw).toString('utf8')) : null
}
async function writeFileIndex(cls, list) {
  await writeRaw(indexKey(cls), seal(Buffer.from(JSON.stringify(list), 'utf8')))
}
export async function indexAdd(cls, entry) {
  const list = (await loadFileIndex(cls)) || []
  if (!list.some((x) => x.id === entry.id)) list.push(entry)
  await writeFileIndex(cls, list)
}
export async function indexRemove(cls, id) {
  const list = (await loadFileIndex(cls)) || []
  await writeFileIndex(cls, list.filter((x) => x.id !== id))
}
// az index újraépítése a tárolóból (ha még nincs – a régebben feltöltött fájlokhoz)
export async function rebuildFileIndex(cls) {
  const prefix = `file-${cls}-`
  let keys = []
  if (isNetlify()) {
    const store = await getStoreSafe()
    const { blobs } = await store.list({ prefix })
    keys = blobs.map((b) => b.key)
  } else {
    try { keys = (await fs.readdir(DEV_DIR)).filter((f) => f.startsWith(prefix)).map((f) => f.replace(/\.enc$/, '')) } catch { keys = [] }
  }
  const list = []
  for (const k of keys) {
    const id = k.slice(prefix.length)
    const f = await loadFile(cls, id).catch(() => null)
    if (f) list.push({ id, name: f.meta.name, type: f.meta.type, size: f.meta.size ?? f.data.length, at: f.meta.at || 0 })
  }
  await writeFileIndex(cls, list)
  return list
}
export const fileExists = async (cls, id) => Boolean(await readRaw(fileKey(cls, id)))

// ── Tanévek archívuma: a lezárt tanév teljes dokumentuma, csak olvasásra ──
const archiveKey = (cls, year) => `archive-${cls}-${year}`
export async function loadArchive(cls, year) {
  const raw = await readRaw(archiveKey(cls, year))
  return raw ? JSON.parse(open(raw).toString('utf8')) : null
}
export async function saveArchive(cls, year, doc) {
  await writeRaw(archiveKey(cls, year), seal(Buffer.from(JSON.stringify(doc), 'utf8')))
}
export async function listArchiveYears(cls) {
  const prefix = `archive-${cls}-`
  let keys = []
  if (isNetlify()) {
    const store = await getStoreSafe()
    keys = (await store.list({ prefix })).blobs.map((b) => b.key)
  } else {
    try { keys = (await fs.readdir(DEV_DIR)).filter((f) => f.startsWith(prefix)).map((f) => f.replace(/\.enc$/, '')) } catch { keys = [] }
  }
  return keys.map((k) => k.slice(prefix.length)).filter((y) => /^\d{4}$/.test(y)).sort()
}
