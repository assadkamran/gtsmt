import { cache } from 'react'
import { getCms } from './cms'
import { PAGE_SIZE } from './browse/types'
import type { Category, Industry, MachineModel, Manufacturer, Media, Product, Solution } from '@/payload-types'

export type Division = 'equipment' | 'parts' | 'peripherals'

export const divisions: Record<Division, { base: string; label: string; eyebrow: string; titleSuffix: string }> = {
  equipment: { base: '/smt-equipment', label: 'SMT Equipment', eyebrow: 'SMT equipment', titleSuffix: 'SMT Equipment' },
  parts: { base: '/spare-parts', label: 'Spare Parts', eyebrow: 'Spare parts', titleSuffix: 'SMT Spare Parts' },
  peripherals: { base: '/smt-peripherals', label: 'SMT Peripherals', eyebrow: 'SMT peripherals', titleSuffix: 'SMT Peripherals' },
}

/** Public reads only ever see published documents. */
const pub = () => ({ _status: { equals: 'published' as const } })

export { PAGE_SIZE }

/* ------------------------------------------------------------------ media helpers */
export const mediaOf = (m: unknown): Media | null => (m && typeof m === 'object' && 'url' in m && (m as Media).url ? (m as Media) : null)

/* ------------------------------------------------------------------ categories */
export const getCategories = cache(async (division: Division): Promise<Category[]> => {
  const payload = await getCms()
  const res = await payload.find({ collection: 'categories', where: { division: { equals: division } }, sort: 'sortOrder', limit: 500, depth: 1, pagination: false })
  return res.docs
})

export function categoryTree(cats: Category[], division: Division) {
  const parentId = (c: Category): number | null => (c.parent == null ? null : typeof c.parent === 'object' ? c.parent.id : c.parent)
  const byId = new Map(cats.map((c) => [c.id, c]))
  const pathOf = (c: Category): string[] => {
    const pid = parentId(c)
    const parent = pid == null ? undefined : byId.get(pid)
    return parent ? [...pathOf(parent), c.slug] : [c.slug]
  }
  const urlOf = (c: Category) => `${divisions[division].base}/${pathOf(c).join('/')}`
  const childrenOf = (c: Category) => cats.filter((x) => parentId(x) === c.id)
  const roots = cats.filter((c) => parentId(c) == null)
  const trail = (c: Category): Category[] => {
    const pid = parentId(c)
    const p = pid == null ? undefined : byId.get(pid)
    return p ? [...trail(p), c] : [c]
  }
  const bySlug = (slug: string) => cats.find((c) => c.slug === slug)
  return { cats, byId, parentId, pathOf, urlOf, childrenOf, roots, trail, bySlug }
}
export type CategoryTree = ReturnType<typeof categoryTree>

export const getTrees = cache(async (): Promise<Record<Division, CategoryTree>> => {
  const [equipment, parts, peripherals] = await Promise.all([getCategories('equipment'), getCategories('parts'), getCategories('peripherals')])
  return { equipment: categoryTree(equipment, 'equipment'), parts: categoryTree(parts, 'parts'), peripherals: categoryTree(peripherals, 'peripherals') }
})

/** Product URL, resolved across divisions (an accessory can live in a different division from its parent). */
export function productHref(trees: Record<Division, CategoryTree>, product: Product): string | null {
  const id = typeof product.category === 'object' ? product.category.id : product.category
  for (const d of ['equipment', 'parts', 'peripherals'] as Division[]) {
    const cat = trees[d].byId.get(id)
    if (cat) return `${divisions[d].base}/${trees[d].pathOf(cat).join('/')}/${product.slug}`
  }
  return null
}

/** "/page/2" suffix pagination keeps URLs clean and pages statically generated. */
export function parseSegments(segments?: string[]): { segs: string[]; page: number; invalid: boolean } {
  const segs = [...(segments ?? [])]
  if (segs.length >= 2 && segs[segs.length - 2] === 'page') {
    const n = Number(segs[segs.length - 1])
    segs.splice(-2, 2)
    if (!Number.isInteger(n) || n < 2) return { segs, page: 1, invalid: true }
    return { segs, page: n, invalid: false }
  }
  return { segs, page: 1, invalid: false }
}

export type Resolved =
  | { kind: 'hub' }
  | { kind: 'category'; category: Category }
  | { kind: 'product'; category: Category; productSlug: string }
  | { kind: 'none' }

export function resolveSegments(tree: CategoryTree, segs: string[]): Resolved {
  if (segs.length === 0) return { kind: 'hub' }
  let current: Category | undefined
  let matched = 0
  for (const seg of segs) {
    const next = tree.cats.find((c) => tree.parentId(c) === (current ? current.id : null) && c.slug === seg)
    if (!next) break
    current = next
    matched++
  }
  if (current && matched === segs.length) return { kind: 'category', category: current }
  if (current && matched === segs.length - 1) return { kind: 'product', category: current, productSlug: segs[matched] }
  return { kind: 'none' }
}

/* ------------------------------------------------------------------ products */
export async function getProducts(o: { categoryIds: number[]; page?: number; pageSize?: number }) {
  const payload = await getCms()
  return payload.find({
    collection: 'products',
    where: { and: [{ category: { in: o.categoryIds } }, pub()] },
    sort: 'title',
    page: o.page ?? 1,
    limit: o.pageSize ?? PAGE_SIZE,
    depth: 1,
  })
}

export const getProductCounts = cache(async (): Promise<Map<number, number>> => {
  const payload = await getCms()
  const res = await payload.find({ collection: 'products', where: pub(), limit: 10000, pagination: false, depth: 0, select: { category: true } })
  const m = new Map<number, number>()
  for (const p of res.docs) {
    const id = typeof p.category === 'object' ? p.category.id : p.category
    m.set(id, (m.get(id) ?? 0) + 1)
  }
  return m
})

export async function getProduct(categoryId: number, slug: string): Promise<Product | null> {
  const payload = await getCms()
  const res = await payload.find({ collection: 'products', where: { and: [{ slug: { equals: slug } }, { category: { equals: categoryId } }, pub()] }, limit: 1, depth: 2 })
  return res.docs[0] ?? null
}

const isPublishedProduct = (p: unknown): p is Product => !!p && typeof p === 'object' && (p as Product)._status === 'published'

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const manual = (product.related ?? []).filter(isPublishedProduct)
  if (manual.length >= limit) return manual.slice(0, limit)
  const categoryId = typeof product.category === 'object' ? product.category.id : product.category
  const payload = await getCms()
  const exclude = [product.id, ...manual.map((m) => m.id)]
  const more = await payload.find({
    collection: 'products',
    where: { and: [{ category: { equals: categoryId } }, { id: { not_in: exclude } }, pub()] },
    sort: 'title',
    limit: limit - manual.length,
    depth: 1,
  })
  return [...manual, ...more.docs]
}

export const publishedAccessories = (p: Product): Product[] => (p.accessories ?? []).filter(isPublishedProduct)

/** Where a product lives, given its populated category chain. */
export function productUrl(division: Division, tree: CategoryTree, product: Product): string {
  const cat = typeof product.category === 'object' ? tree.byId.get(product.category.id) ?? product.category : tree.byId.get(product.category)
  const path = cat ? tree.pathOf(cat as Category) : []
  return `${divisions[division].base}/${path.join('/')}/${product.slug}`
}

/* ------------------------------------------------------------------ solutions and industries */
export const getSolutions = cache(async (): Promise<Solution[]> => {
  const payload = await getCms()
  const res = await payload.find({ collection: 'solutions', where: pub(), sort: 'createdAt', limit: 100, depth: 1, pagination: false })
  return res.docs
})

export const getSolution = cache(async (slug: string): Promise<Solution | null> => {
  const payload = await getCms()
  const res = await payload.find({ collection: 'solutions', where: { and: [{ slug: { equals: slug } }, pub()] }, limit: 1, depth: 2 })
  return res.docs[0] ?? null
})

export const getIndustries = cache(async (): Promise<Industry[]> => {
  const payload = await getCms()
  const res = await payload.find({ collection: 'industries', where: pub(), sort: 'createdAt', limit: 100, depth: 1, pagination: false })
  return res.docs
})

export const getIndustry = cache(async (slug: string): Promise<Industry | null> => {
  const payload = await getCms()
  const res = await payload.find({ collection: 'industries', where: { and: [{ slug: { equals: slug } }, pub()] }, limit: 1, depth: 2 })
  return res.docs[0] ?? null
})

export async function getIndustriesForSolution(solutionId: number): Promise<Industry[]> {
  const payload = await getCms()
  const res = await payload.find({ collection: 'industries', where: { and: [{ relevantSolutions: { equals: solutionId } }, pub()] }, limit: 20, depth: 0, sort: 'createdAt' })
  return res.docs
}

/* ------------------------------------------------------------------ brands and models */
export const getBrands = cache(async (): Promise<Manufacturer[]> => {
  const payload = await getCms()
  const res = await payload.find({ collection: 'manufacturers', where: { showAsBrandHub: { equals: true } }, sort: 'name', limit: 200, depth: 1, pagination: false })
  return res.docs
})

export const getBrand = cache(async (slug: string): Promise<Manufacturer | null> => {
  const payload = await getCms()
  const res = await payload.find({ collection: 'manufacturers', where: { and: [{ slug: { equals: slug } }, { showAsBrandHub: { equals: true } }] }, limit: 1, depth: 1 })
  return res.docs[0] ?? null
})

export const getBrandCounts = cache(async (): Promise<Map<number, number>> => {
  const payload = await getCms()
  const res = await payload.find({ collection: 'products', where: pub(), limit: 10000, pagination: false, depth: 0, select: { manufacturer: true } })
  const m = new Map<number, number>()
  for (const p of res.docs) {
    const id = p.manufacturer == null ? null : typeof p.manufacturer === 'object' ? p.manufacturer.id : p.manufacturer
    if (id != null) m.set(id, (m.get(id) ?? 0) + 1)
  }
  return m
})

export async function getModelsForBrand(brandId: number): Promise<MachineModel[]> {
  const payload = await getCms()
  const res = await payload.find({ collection: 'machine-models', where: { manufacturer: { equals: brandId } }, sort: 'name', limit: 500, depth: 0, pagination: false })
  return res.docs
}

export async function getProductsByBrand(brandId: number, limit = 48): Promise<Product[]> {
  const payload = await getCms()
  const res = await payload.find({ collection: 'products', where: { and: [{ manufacturer: { equals: brandId } }, pub()] }, sort: 'title', limit, depth: 1 })
  return res.docs
}

export async function getModel(brandId: number, slug: string): Promise<MachineModel | null> {
  const payload = await getCms()
  const res = await payload.find({ collection: 'machine-models', where: { and: [{ manufacturer: { equals: brandId } }, { slug: { equals: slug } }] }, limit: 1, depth: 0 })
  return res.docs[0] ?? null
}

/** Products with VERIFIED compatibility for a model. Unverified entries are never exposed. */
export async function getProductsForModel(modelId: number): Promise<Product[]> {
  const payload = await getCms()
  const res = await payload.find({ collection: 'products', where: { and: [{ 'compatibility.machineModel': { equals: modelId } }, pub()] }, sort: 'title', limit: 200, depth: 1 })
  return res.docs.filter((p) => (p.compatibility ?? []).some((c) => (typeof c.machineModel === 'object' ? c.machineModel.id : c.machineModel) === modelId && c.verified))
}

/* ------------------------------------------------------------------ indexing rules */
/** Unreviewed starter copy and empty thin pages stay out of search engines and the sitemap. */
export function categoryIndexable(c: Category, productCount: number): boolean {
  if (c.seo?.noindex || !c.reviewed) return false
  return productCount > 0 || Boolean(c.description)
}
export const documentIndexable = (d: { reviewed?: boolean | null; seo?: { noindex?: boolean | null } | null }) => Boolean(d.reviewed) && !d.seo?.noindex

