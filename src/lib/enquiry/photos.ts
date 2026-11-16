import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { MAX_PHOTO_BYTES, MAX_PHOTOS } from './options'

/**
 * Buyer photos are untrusted files. A file is accepted only if an image decoder can read it as JPEG, PNG or WebP;
 * it is then decoded and written out again as a fresh JPEG. That removes anything hidden in the original (extra
 * data, scripts, location metadata) and makes every stored file a plain image we produced ourselves.
 */

const ALLOWED = new Set(['jpeg', 'png', 'webp'])
const MAX_PIXELS = 50_000_000

export type Processed = { ok: true; images: { name: string; data: Buffer }[] } | { ok: false; error: string }

export async function processPhotos(files: File[]): Promise<Processed> {
  if (files.length > MAX_PHOTOS) return { ok: false, error: `Attach up to ${MAX_PHOTOS} photos.` }
  const images: { name: string; data: Buffer }[] = []
  for (const file of files) {
    if (file.size === 0) continue
    if (file.size > MAX_PHOTO_BYTES) return { ok: false, error: 'Each photo must be under 5 MB.' }
    try {
      const input = Buffer.from(await file.arrayBuffer())
      const meta = await sharp(input, { limitInputPixels: MAX_PIXELS }).metadata()
      if (!meta.format || !ALLOWED.has(meta.format) || !meta.width || !meta.height) throw new Error('not an allowed image')
      const data = await sharp(input, { limitInputPixels: MAX_PIXELS })
        .rotate()
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toBuffer()
      images.push({ name: `${randomUUID()}.jpg`, data })
    } catch {
      return { ok: false, error: 'One of the photos could not be read. Use a JPG, PNG or WebP image under 5 MB.' }
    }
  }
  return { ok: true, images }
}
