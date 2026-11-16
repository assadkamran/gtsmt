import type { Payload, PayloadRequest, Where } from 'payload'
import { sql } from '@payloadcms/db-postgres'
import type { Category, Industry, MachineModel, Manufacturer, Media, Product, Solution } from '../../payload-types'
import { lexicalToText, normalisePart, normaliseText } from './normalise'

/**
 * Keeps the search_index table in step with the CMS. Framework-free: takes a Payload instance, so it runs
 * from collection hooks, from scripts and from the admin alike.
 */
export type SearchKind = 'product' | 'category' | 'solution' | 'industry' | 'brand'

const DIVISION = {
  equipment: { base: '/smt-equipment', label: 'SMT equipment' },
  parts: { base: '/spare-parts', label: 'Spare parts' },
  peripherals: { base: '/smt-peripherals', label: 'SMT peripherals' },
} as const

type IndexDoc = {
  kind: SearchKind
  refId: number
  url: string
  title: string
  subtitle?: string | null
  excerpt?: string | null
  imageUrl?: string | null
  partNumbers?: string | null
  partNorm?: string | null
  body?: string | null
  brandId?: number | null
  categoryId?: number | null
  meta?: Record<string, unknown> | null
}

type Drizzle = { execute: (query: ReturnType<typeof sql>) => Promise<{ rows: Record<string, unknown>[] }> }
export const drizzleOf = (payload: Payload) => (payload.db as unknown as { drizzle: Drizzle }).drizzle

const media = (m: unknown): Media | null => (m && typeof m === 'object' && 'url' in m && (m as Media).url ? (m as Media) : null)
const idOf = (v: unknown): number | null => (typeof v === 'number' ? v : v && typeof v === 'object' && 'id' in v ? Number((v as { id: number }).id) : null)
const clip = (s: string | null | undefined, n: number) => (s ? (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s) : null)
const joinText = (parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' ')

async function categoryChain(payload: Payload, req: PayloadRequest | undefined, id: number): Promise<Category[]> {
  const chain: Category[] = []
  let cur: number | null = id
  for (let i = 0; cur !== null && i < 6; i++) {
    const c: Category = await payload.findByID({ collection: 'categories', id: cur, depth: 0, req })
    chain.unshift(c)
    cur = idOf(c.parent)
  }
  return chain
}

/* ---------------------------------------------------------------- builders */

async function productDoc(payload: Payload, req: PayloadRequest | undefined, id: number): Promise<IndexDoc | null> {
  let p: Product
  try {
    p = await payload.findByID({ collection: 'products', id, depth: 2, draft: false, req })
  } catch {
    return null
  }
  if (p._status !== 'published') return null
  const catId = idOf(p.category)
  if (!catId) return null
  const chain = await categoryChain(payload, req, catId)
  const div = DIVISION[chain[chain.length - 1].division]
  const man = p.manufacturer && typeof p.manufacturer === 'object' ? p.manufacturer : null
  const models = (p.compatibility ?? [])
    .filter((c) => c.verified && c.machineModel && typeof c.machineModel === 'object')
    .map((c) => {
      const m = c.machineModel as MachineModel
      return joinText([m.manufacturer && typeof m.manufacturer === 'object' ? m.manufacturer.name : null, m.name])
    })
  const specText = (p.specs ?? []).map((s) => {
    const a = s.attribute && typeof s.attribute === 'object' ? s.attribute : null
    return a ? `${a.label} ${s.value}${a.unit ? ` ${a.unit}` : ''}` : s.value
  })
  const partList = [p.partNumber, ...(p.altPartNumbers ?? []).map((a) => a.value)].filter((x): x is string => !!x)
  const partNorm = [...new Set(partList.map(normalisePart).filter(Boolean))].join(' ')
  return {
    kind: 'product',
    refId: p.id,
    url: `${div.base}/${chain.map((c) => c.slug).join('/')}/${p.slug}`,
    title: p.title,
    subtitle: [div.label, ...chain.map((c) => c.name)].join(' › '),
    excerpt: clip(p.shortIntro, 220),
    imageUrl: media(p.gallery?.[0]?.image)?.url ?? null,
    partNumbers: partList.join(' · ') || null,
    partNorm: partNorm || null,
    body: joinText([p.title, p.shortIntro, ...(p.features ?? []).map((f) => f.text), ...(p.applications ?? []).map((a) => a.text), lexicalToText(p.description), chain.map((c) => c.name).join(' '), man?.name, ...models, ...specText]),
    brandId: man?.id ?? null,
    categoryId: catId,
    meta: { origin: p.partOrigin },
  }
}

async function categoryDoc(payload: Payload, req: PayloadRequest | undefined, id: number): Promise<IndexDoc | null> {
  let c: Category
  try {
    c = await payload.findByID({ collection: 'categories', id, depth: 1, req })
  } catch {
    return null
  }
  const chain = await categoryChain(payload, req, id)
  const div = DIVISION[c.division]
  return {
    kind: 'category',
    refId: c.id,
    url: `${div.base}/${chain.map((x) => x.slug).join('/')}`,
    title: c.name,
    subtitle: [div.label, ...chain.slice(0, -1).map((x) => x.name)].join(' › '),
    excerpt: clip(c.summary, 220),
    imageUrl: media(c.image)?.url ?? null,
    body: joinText([c.summary, lexicalToText(c.description)]),
    categoryId: c.id,
    meta: { division: c.division },
  }
}

async function solutionDoc(payload: Payload, req: PayloadRequest | undefined, id: number): Promise<IndexDoc | null> {
  let s: Solution
  try {
    s = await payload.findByID({ collection: 'solutions', id, depth: 1, draft: false, req })
  } catch {
    return null
  }
  if (s._status !== 'published') return null
  return {
    kind: 'solution',
    refId: s.id,
    url: `/smt-solutions/${s.slug}`,
    title: s.title,
    subtitle: 'SMT solution',
    excerpt: clip(s.summary, 220),
    imageUrl: media(s.heroImage)?.url ?? null,
    body: joinText([s.summary, lexicalToText(s.body), ...(s.lineSequence ?? []).map((l) => joinText([l.station, l.note])), ...(s.faqs ?? []).map((f) => joinText([f.question, f.answer]))]),
  }
}

async function industryDoc(payload: Payload, req: PayloadRequest | undefined, id: number): Promise<IndexDoc | null> {
  let i: Industry
  try {
    i = await payload.findByID({ collection: 'industries', id, depth: 1, draft: false, req })
  } catch {
    return null
  }
  if (i._status !== 'published') return null
  return {
    kind: 'industry',
    refId: i.id,
    url: `/industries/${i.slug}`,
    title: i.title,
    subtitle: 'Industry',
    excerpt: clip(i.intro, 220),
    imageUrl: media(i.image)?.url ?? null,
    body: joinText([i.intro, lexicalToText(i.body), ...(i.requirements ?? []).map((r) => r.text)]),
  }
}

async function brandDoc(payload: Payload, req: PayloadRequest | undefined, id: number): Promise<IndexDoc | null> {
  let m: Manufacturer
  try {
    m = await payload.findByID({ collection: 'manufacturers', id, depth: 1, req })
  } catch {
    return null
  }
  if (!m.showAsBrandHub) return null
  const models = await payload.find({ collection: 'machine-models', where: { manufacturer: { equals: id } }, limit: 200, depth: 0, pagination: false, req })
  return {
    kind: 'brand',
    refId: m.id,
    url: `/spare-parts/brands/${m.slug}`,
    title: m.name,
    subtitle: 'Spare parts › Brands',
    excerpt: clip(m.notes, 220),
    imageUrl: media(m.logo)?.url ?? null,
    body: joinText([m.notes, ...models.docs.map((x) => x.name)]),
    brandId: m.id,
  }
}

/* ---------------------------------------------------------------- write side */

async function upsert(payload: Payload, d: IndexDoc) {
  const title = d.title
  await drizzleOf(payload).execute(sql`
    INSERT INTO search_index (kind, ref_id, url, title, title_norm, subtitle, excerpt, image_url, part_numbers, part_norm, body, tsv, brand_id, category_id, meta, updated_at)
    VALUES (
      ${d.kind}::text, ${d.refId}::int, ${d.url}::text, ${title}::text, ${normaliseText(title)}::text,
      ${d.subtitle ?? null}::text, ${d.excerpt ?? null}::text, ${d.imageUrl ?? null}::text,
      ${d.partNumbers ?? null}::text, ${d.partNorm ?? null}::text, ${d.body ?? null}::text,
      setweight(to_tsvector('english', ${title}::text), 'A')
        || setweight(to_tsvector('simple', ${d.partNorm ?? ''}::text), 'A')
        || setweight(to_tsvector('english', ${d.subtitle ?? ''}::text), 'B')
        || setweight(to_tsvector('english', ${d.body ?? ''}::text), 'C'),
      ${d.brandId ?? null}::int, ${d.categoryId ?? null}::int, ${d.meta ? JSON.stringify(d.meta) : null}::jsonb, now()
    )
    ON CONFLICT (kind, ref_id) DO UPDATE SET
      url = EXCLUDED.url, title = EXCLUDED.title, title_norm = EXCLUDED.title_norm, subtitle = EXCLUDED.subtitle,
      excerpt = EXCLUDED.excerpt, image_url = EXCLUDED.image_url, part_numbers = EXCLUDED.part_numbers,
      part_norm = EXCLUDED.part_norm, body = EXCLUDED.body, tsv = EXCLUDED.tsv, brand_id = EXCLUDED.brand_id,
      category_id = EXCLUDED.category_id, meta = EXCLUDED.meta, updated_at = now()
  `)
}

export async function removeFromIndex(payload: Payload, kind: SearchKind, refId: number) {
  await drizzleOf(payload).execute(sql`DELETE FROM search_index WHERE kind = ${kind}::text AND ref_id = ${refId}::int`)
}

const builders = { product: productDoc, category: categoryDoc, solution: solutionDoc, industry: industryDoc, brand: brandDoc } as const

/** Re-index one document, or remove it when it is not public (draft, deleted, not a brand hub). */
export async function reindex(payload: Payload, kind: SearchKind, id: number, req?: PayloadRequest) {
  const doc = await builders[kind](payload, req, id)
  if (doc) await upsert(payload, doc)
  else await removeFromIndex(payload, kind, id)
}

async function eachId(payload: Payload, collection: 'products' | 'categories' | 'solutions' | 'industries' | 'manufacturers', where: Where | undefined, req: PayloadRequest | undefined, fn: (id: number) => Promise<void>) {
  for (let page = 1; ; page++) {
    const res = await payload.find({ collection, where, page, limit: 100, depth: 0, select: {}, req })
    for (const d of res.docs) await fn(d.id as number)
    if (!res.hasNextPage) break
  }
}

export async function reindexProductsWhere(payload: Payload, where: Where, req?: PayloadRequest) {
  await eachId(payload, 'products', where, req, (id) => reindex(payload, 'product', id, req))
}

/** A category rename or move changes the URLs and breadcrumbs of everything beneath it. */
export async function reindexCategoryTree(payload: Payload, categoryId: number, req?: PayloadRequest) {
  const ids = [categoryId]
  let frontier = [categoryId]
  for (let depth = 0; frontier.length && depth < 5; depth++) {
    const kids = await payload.find({ collection: 'categories', where: { parent: { in: frontier } }, limit: 500, depth: 0, pagination: false, select: {}, req })
    frontier = kids.docs.map((k) => k.id as number)
    ids.push(...frontier)
  }
  for (const id of ids) await reindex(payload, 'category', id, req)
  await reindexProductsWhere(payload, { category: { in: ids } }, req)
}

/** Rebuild the whole index from the CMS. */
export async function reindexAll(payload: Payload) {
  await drizzleOf(payload).execute(sql`DELETE FROM search_index`)
  await eachId(payload, 'categories', undefined, undefined, (id) => reindex(payload, 'category', id))
  await eachId(payload, 'solutions', { _status: { equals: 'published' } }, undefined, (id) => reindex(payload, 'solution', id))
  await eachId(payload, 'industries', { _status: { equals: 'published' } }, undefined, (id) => reindex(payload, 'industry', id))
  await eachId(payload, 'manufacturers', { showAsBrandHub: { equals: true } }, undefined, (id) => reindex(payload, 'brand', id))
  await eachId(payload, 'products', { _status: { equals: 'published' } }, undefined, (id) => reindex(payload, 'product', id))
  const r = await drizzleOf(payload).execute(sql`SELECT kind, count(*)::int AS n FROM search_index GROUP BY kind ORDER BY kind`)
  return r.rows as { kind: string; n: number }[]
}
