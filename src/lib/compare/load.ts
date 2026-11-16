import type { Category, MachineModel, Product, ProductDocument } from '@/payload-types'
import { getCms } from '../cms'
import { getTrees, mediaOf, type Division } from '../catalogue'
import { originOf } from '../origin'
import { specRows } from '../specs'
import { MAX_COMPARE } from './store-limits'
import type { CmpInput } from './build'

/** Ids from "?items=1,2,3": positive whole numbers, no repeats, at most four. Anything else is ignored. */
export function parseIds(raw: string | string[] | undefined): number[] {
  const text = Array.isArray(raw) ? raw.join(',') : (raw ?? '')
  const ids: number[] = []
  for (const part of text.slice(0, 200).split(',')) {
    const n = /^\d{1,9}$/.test(part.trim()) ? Number(part.trim()) : NaN
    if (Number.isInteger(n) && n > 0 && !ids.includes(n)) ids.push(n)
    if (ids.length === MAX_COMPARE) break
  }
  return ids
}

export type LoadedComparison = {
  category: { id: number; name: string; href: string; division: Division; allowCompare: boolean }
  products: CmpInput[]
  /** Ids that were asked for but left out: not found, not published, or from a different category. */
  skipped: number
}

const DOC_LABEL: Record<string, string> = { datasheet: 'Datasheet', manual: 'Manual', brochure: 'Brochure', certificate: 'Certificate' }

export async function loadComparison(ids: number[]): Promise<LoadedComparison | null> {
  if (ids.length === 0) return null
  const payload = await getCms()
  const res = await payload.find({
    collection: 'products',
    where: { and: [{ id: { in: ids } }, { _status: { equals: 'published' } }] },
    pagination: false,
    limit: MAX_COMPARE,
    depth: 2,
  })
  const byId = new Map(res.docs.map((p) => [p.id, p]))
  const ordered = ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p))
  if (ordered.length === 0) return null

  const catId = (p: Product) => (typeof p.category === 'object' ? p.category.id : p.category)
  const firstCat = catId(ordered[0])
  const same = ordered.filter((p) => catId(p) === firstCat)

  const trees = await getTrees()
  let found: { cat: Category; division: Division; href: string } | null = null
  for (const d of ['equipment', 'parts', 'peripherals'] as Division[]) {
    const c = trees[d].byId.get(firstCat)
    if (c) found = { cat: c, division: d, href: trees[d].urlOf(c) }
  }
  if (!found) return null
  const order = (found.cat.specAttributes ?? []).map((a) => (typeof a === 'object' ? a.id : a))
  const idx = new Map(order.map((id, i) => [id, i]))

  const products: CmpInput[] = same.map((p) => {
    const media = mediaOf(p.gallery?.[0]?.image)
    const docs = (p.documents ?? []).filter((d): d is ProductDocument => !!d && typeof d === 'object' && Boolean(d.url))
    const sheet = docs.find((d) => d.type === 'datasheet') ?? docs[0]
    const fits = (p.compatibility ?? [])
      .filter((c) => c.verified && c.machineModel && typeof c.machineModel === 'object')
      .map((c) => {
        const m = c.machineModel as MachineModel
        const brand = m.manufacturer && typeof m.manufacturer === 'object' ? m.manufacturer.name : ''
        return `${brand ? `${brand} ` : ''}${m.name}`
      })
    return {
      id: p.id,
      title: p.title,
      href: `${found!.href}/${p.slug}`,
      image: media?.url ? { url: media.url, alt: media.alt } : null,
      partNumber: p.partNumber ?? null,
      originLabel: originLabelOf(p.partOrigin),
      brand: p.manufacturer && typeof p.manufacturer === 'object' ? p.manufacturer.name : null,
      specs: specRows(p, order).filter((r) => r.comparable).map((r) => ({ id: r.id, label: r.label, unit: r.unit, value: r.value, order: idx.get(r.id) ?? 1000 + r.sortOrder })),
      fits,
      datasheet: sheet?.url ? { url: sheet.url, label: DOC_LABEL[sheet.type] ?? 'Document' } : null,
    }
  })

  return {
    category: { id: found.cat.id, name: found.cat.name, href: found.href, division: found.division, allowCompare: Boolean(found.cat.allowCompare) },
    products,
    skipped: ids.length - products.length,
  }
}

const originLabelOf = (v: string | null | undefined) => originOf(v)?.label ?? null
