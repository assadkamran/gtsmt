import type { Category, Product, SpecAttribute } from '@/payload-types'
import { getCms } from '../cms'
import { getTrees, mediaOf } from '../catalogue'
import { ORIGIN, originOf } from '../origin'
import { specRows, specText } from '../specs'
import { dedupe, readCache, writeCache } from './cache'
import { runBrowse } from './engine'
import type { AttributeDef, BrowseProduct, BrowseResult, Dataset, FacetDefs, FilterState } from './types'

/** Server side: reads one category's published products into the small shape the listing needs. */

const MAX_PRODUCTS = 5000
const idOf = (v: unknown): number | null => (typeof v === 'number' ? v : v && typeof v === 'object' && 'id' in v ? Number((v as { id: number }).id) : null)

async function brandNames(): Promise<Map<number, string>> {
  const payload = await getCms()
  const res = await payload.find({ collection: 'manufacturers', limit: 500, depth: 0, pagination: false, select: { name: true } })
  return new Map(res.docs.map((b) => [b.id, b.name]))
}

async function categoryUrl(categoryId: number): Promise<string | null> {
  const trees = await getTrees()
  for (const t of Object.values(trees)) {
    const c = t.byId.get(categoryId)
    if (c) return t.urlOf(c)
  }
  return null
}

function buildAttributeDefs(attrs: SpecAttribute[], products: BrowseProduct[]): AttributeDef[] {
  const out: AttributeDef[] = []
  for (const a of attrs) {
    if (!a.filterable || a.type === 'text') continue
    const present = new Set<string>()
    let min: number | null = null
    let max: number | null = null
    for (const p of products) {
      const s = p.specs[a.id]
      if (!s) continue
      present.add(s.v)
      if (s.n != null) {
        min = min == null ? s.n : Math.min(min, s.n)
        max = max == null ? s.n : Math.max(max, s.n)
      }
    }
    const base = { id: a.id, key: a.key, label: a.label, unit: a.unit ?? null }
    if (a.type === 'number') {
      if (min != null && max != null && min < max) out.push({ ...base, type: 'number', choices: [], min, max })
      continue
    }
    const defined = a.type === 'yesno' ? ['Yes', 'No'] : (a.choices ?? []).map((c) => c.value)
    const choices = [...defined.filter((c) => present.has(c)), ...[...present].filter((c) => !defined.includes(c)).sort()]
    if (choices.length >= 2) out.push({ ...base, type: a.type as 'choice' | 'yesno', choices, min: null, max: null })
  }
  return out
}

async function load(categoryId: number): Promise<Dataset | null> {
  const payload = await getCms()
  const url = await categoryUrl(categoryId)
  if (!url) return null
  const category = (await payload.findByID({ collection: 'categories', id: categoryId, depth: 1 }).catch(() => null)) as Category | null
  if (!category) return null

  const attrs = (category.specAttributes ?? []).filter((a): a is SpecAttribute => typeof a === 'object' && a !== null)
  const order = attrs.map((a) => a.id)

  const [res, brandIndex] = await Promise.all([
    payload.find({
      collection: 'products',
      where: { and: [{ category: { equals: categoryId } }, { _status: { equals: 'published' } }] },
      pagination: false,
      limit: MAX_PRODUCTS,
      depth: 1,
      select: { title: true, slug: true, partNumber: true, manufacturer: true, partOrigin: true, compatibility: true, specs: true, gallery: true, createdAt: true },
      populate: {
        'spec-attributes': { key: true, label: true, type: true, unit: true, filterable: true, comparable: true, sortOrder: true },
        media: { url: true, alt: true },
        manufacturers: { name: true },
        'machine-models': { name: true, manufacturer: true },
      },
    }),
    brandNames(),
  ])

  const brands = new Map<number, string>()
  const models = new Map<number, { id: number; name: string; brandId: number | null; brandName: string }>()
  const origins = new Set<string>()

  const products: BrowseProduct[] = (res.docs as Product[]).map((p) => {
    const brandId = idOf(p.manufacturer)
    if (brandId != null) brands.set(brandId, typeof p.manufacturer === 'object' && p.manufacturer ? p.manufacturer.name : brandIndex.get(brandId) ?? `Brand ${brandId}`)
    if (p.partOrigin) origins.add(p.partOrigin)

    const modelIds: number[] = []
    for (const c of p.compatibility ?? []) {
      if (!c.verified) continue
      const m = typeof c.machineModel === 'object' ? c.machineModel : null
      if (!m) continue
      modelIds.push(m.id)
      if (!models.has(m.id)) {
        const mb = idOf(m.manufacturer)
        models.set(m.id, { id: m.id, name: m.name, brandId: mb, brandName: mb != null ? brandIndex.get(mb) ?? '' : '' })
      }
    }

    const specs: BrowseProduct['specs'] = {}
    for (const s of p.specs ?? []) {
      const aid = idOf(s.attribute)
      if (aid != null) specs[aid] = { v: s.value, n: s.valueNumber ?? null }
    }

    const media = mediaOf(p.gallery?.[0]?.image)
    return {
      id: p.id,
      title: p.title,
      href: `${url}/${p.slug}`,
      partNumber: p.partNumber ?? null,
      brandId,
      origin: p.partOrigin ?? null,
      modelIds,
      specs,
      image: media?.url ? { url: media.url, alt: media.alt } : null,
      specLine: specRows(p, order).slice(0, 2).map((r) => `${r.label}: ${specText(r)}`).join(' · '),
      created: Date.parse(p.createdAt) || 0,
    }
  })

  const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
  const defs: FacetDefs = {
    brands: brands.size >= 2 ? [...brands].map(([id, name]) => ({ id, name })).sort((a, b) => collator.compare(a.name, b.name)) : [],
    origins: origins.size >= 2 ? (Object.keys(ORIGIN).filter((k) => origins.has(k)).map((value) => ({ value, label: originOf(value)?.label ?? value }))) : [],
    models: models.size >= 2 ? [...models.values()].sort((a, b) => collator.compare(a.brandName, b.brandName) || collator.compare(a.name, b.name)) : [],
    attributes: buildAttributeDefs(attrs, products),
    hasPartNumbers: products.some((p) => Boolean(p.partNumber)),
  }
  return { categoryId, products, defs }
}

/** The listing data for one category, or null if the category does not exist. Cached briefly. */
export async function loadDataset(categoryId: number): Promise<Dataset | null> {
  const cached = readCache(categoryId)
  if (cached) return cached
  return dedupe(categoryId, async () => {
    const ds = await load(categoryId)
    if (ds) writeCache(categoryId, ds)
    return ds
  })
}

export async function browseCategory(categoryId: number, state: FilterState, pageSize: number): Promise<{ result: BrowseResult; defs: FacetDefs; total: number } | null> {
  const ds = await loadDataset(categoryId)
  if (!ds) return null
  return { result: runBrowse(ds, state, pageSize), defs: ds.defs, total: ds.products.length }
}
