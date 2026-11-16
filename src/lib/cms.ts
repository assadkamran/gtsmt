import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

export const getCms = cache(async () => getPayload({ config }))

/** Site settings with safe fallback so the site still renders if the database is unreachable. */
export const getSettings = cache(async () => {
  try {
    const payload = await getCms()
    return await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  } catch (e) {
    console.error('[cms] could not load site settings', e instanceof Error ? e.message : e)
    return null
  }
})

export type SlotImage = { url: string; alt: string; width?: number; height?: number }

export const getSlotMap = cache(async (): Promise<Record<string, SlotImage>> => {
  const s = await getSettings()
  const map: Record<string, SlotImage> = {}
  for (const row of s?.imageSlots ?? []) {
    const m = row.image
    if (m && typeof m === 'object' && m.url) {
      map[String(row.slot).trim().toUpperCase()] = { url: m.url, alt: m.alt ?? '', width: m.width ?? undefined, height: m.height ?? undefined }
    }
  }
  return map
})

export const getFeaturedProducts = cache(async () => {
  try {
    const payload = await getCms()
    const res = await payload.find({
      collection: 'products',
      where: { featured: { equals: true }, _status: { equals: 'published' } },
      limit: 4,
      depth: 1,
      sort: '-updatedAt',
    })
    return res.docs
  } catch {
    return []
  }
})

export const getFeaturedArticle = cache(async () => {
  try {
    const payload = await getCms()
    const res = await payload.find({
      collection: 'articles',
      where: { featured: { equals: true }, _status: { equals: 'published' } },
      limit: 1,
      depth: 1,
      sort: '-publishedAt',
    })
    return res.docs[0] ?? null
  } catch {
    return null
  }
})

export const getBrandsAndModels = cache(async () => {
  try {
    const payload = await getCms()
    const [brands, models] = await Promise.all([
      payload.find({ collection: 'manufacturers', limit: 100, depth: 0, sort: 'name', pagination: false }),
      payload.find({ collection: 'machine-models', limit: 1000, depth: 0, sort: 'name', pagination: false }),
    ])
    return {
      brands: brands.docs.map((b) => ({ id: String(b.id), name: b.name, slug: b.slug, hub: Boolean(b.showAsBrandHub) })),
      models: models.docs.map((m) => ({
        id: String(m.id),
        name: m.name,
        slug: m.slug,
        brandId: String(typeof m.manufacturer === 'object' ? m.manufacturer.id : m.manufacturer),
      })),
    }
  } catch {
    return { brands: [], models: [] }
  }
})

export const isDev = process.env.NODE_ENV !== 'production'
