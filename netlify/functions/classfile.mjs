// Óraterv-források (képek, hangfájlok, dokumentumok)
//   POST   /api/classfile/:cls        – feltöltés (csak tanár); törzs: a nyers fájl,
//                                       fejléc: Content-Type, X-File-Name (URL-kódolt)
//   GET    /api/classfile/:cls/:id    – letöltés (az osztály jelszavával vagy tanárként)
//   DELETE /api/classfile/:cls/:id    – törlés (csak tanár)
// A fájlok titkosítva (AES-256-GCM) kerülnek a Netlify Blobs tárolóba.
import crypto from 'node:crypto'
import { hasSession, json, sameOrigin } from '../lib/security.mjs'
import { isClass, saveFile, loadFile, deleteFile, FILE_ID } from '../lib/classroomStore.mjs'

const MAX_BYTES = 5.5 * 1024 * 1024 // a Netlify-függvények kéréshatára alatt
// Engedett típusok: képek, hang, videó, gyakori dokumentumok
const ALLOWED = /^(image\/(png|jpeg|gif|webp)|audio\/[a-z0-9.+-]+|video\/(mp4|webm)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.[a-z.]+|vnd\.ms-(excel|powerpoint)|vnd\.oasis\.opendocument\.[a-z.]+|zip)|text\/plain)$/

export default async (req, context) => {
  const { cls, id } = context?.params || {}
  if (!isClass(cls)) return json(404, { error: 'class' })
  const teacher = hasSession(req, 'teacher')

  try {
    if (req.method === 'GET') {
      if (!teacher && !hasSession(req, `language-${cls}`)) return json(401, { error: 'locked' })
      if (!FILE_ID.test(id || '')) return json(404, { error: 'file' })
      const file = await loadFile(cls, id)
      if (!file) return json(404, { error: 'file' })
      const { meta, data } = file
      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': meta.type || 'application/octet-stream',
          'Content-Length': String(data.length),
          'Content-Disposition': `${new URL(req.url).searchParams.has('dl') ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(meta.name || 'fajl')}`,
          // Az azonosító egyedi, a tartalom sosem változik → a böngésző nyugodtan
          // megjegyezheti (kevesebb letöltés = kevesebb Netlify-sávszélesség)
          'Cache-Control': 'private, max-age=604800, immutable',
          'X-Content-Type-Options': 'nosniff',
          'X-Robots-Tag': 'noindex, nofollow',
          'Content-Security-Policy': "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'; sandbox",
        },
      })
    }

    if (!teacher) return json(401, { error: 'locked' })
    if (!sameOrigin(req)) return json(403, { error: 'origin' })

    if (req.method === 'DELETE') {
      if (!FILE_ID.test(id || '')) return json(404, { error: 'file' })
      await deleteFile(cls, id)
      return json(200, { ok: true })
    }

    if (req.method === 'POST' && !id) {
      const type = (req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
      if (!ALLOWED.test(type)) return json(415, { error: 'type' })
      if (Number(req.headers.get('content-length') || 0) > MAX_BYTES) return json(413, { error: 'too-large' })
      const data = Buffer.from(await req.arrayBuffer())
      if (!data.length) return json(400, { error: 'empty' })
      if (data.length > MAX_BYTES) return json(413, { error: 'too-large' })
      let name = 'fajl'
      try { name = decodeURIComponent(req.headers.get('x-file-name') || 'fajl') } catch { /* */ }
      name = name.replace(/[\\/\r\n"]/g, '_').slice(0, 120)
      const fileId = crypto.randomBytes(12).toString('base64url')
      await saveFile(cls, fileId, data, { name, type, size: data.length, at: Date.now() })
      return json(200, { id: fileId, name, type, size: data.length })
    }

    return json(405, { error: 'method' }, { Allow: 'GET, POST, DELETE' })
  } catch (err) {
    console.error('classfile failed', cls, err?.message)
    return json(500, { error: 'store' })
  }
}

export const config = { path: ['/api/classfile/:cls', '/api/classfile/:cls/:id'] }
