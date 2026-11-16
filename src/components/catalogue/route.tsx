import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  categoryIndexable,
  categoryTree,
  divisions,
  getBrand,
  getBrandCounts,
  getBrands,
  getCategories,
  getModel,
  getModelsForBrand,
  getProduct,
  getProductCounts,
  getProductsForModel,
  mediaOf,
  parseSegments,
  resolveSegments,
  type Division,
} from '@/lib/catalogue'
import { getCms, isDev } from '@/lib/cms'
import { findNavRoute } from '@/lib/nav'
import { pageMeta } from '@/lib/seo'
import { PlannedPage } from '../PlannedPage'
import { BrandsIndex, BrandView, ModelView } from './BrandViews'
import { CategoryView } from './CategoryView'
import { EquipmentHub, PartsHub, PeripheralsHub } from './Hubs'
import { ProductView } from './ProductView'

const hubMeta: Record<Division, { title: string; description: string }> = {
  equipment: {
    title: 'SMT Equipment for PCB Assembly',
    description: 'Pick and place machines, solder paste printers, reflow ovens, inspection systems, loaders, conveyors and other SMT equipment. Request a quote.',
  },
  peripherals: {
    title: 'SMT Peripherals and Factory Accessories',
    description: 'Magazine loaders and unloaders, conveyors, NG/OK buffers, ESD equipment and other peripherals for SMT production lines.',
  },
  parts: {
    title: 'SMT Spare Parts, Feeders and Nozzles',
    description: 'Feeders, nozzles, motors, belts, sensors, cameras, electronic boards and other replacement parts for SMT machines, with the origin of every part stated.',
  },
}

const gone: Metadata = { title: 'Page not found', robots: { index: false, follow: false } }

/** Pre-render categories, brand pages and the first products; anything else renders on demand and is then cached. */
export async function catalogueParams(division: Division) {
  // Pre-rendering only matters at build time. In dev it would start a second CMS instance for nothing.
  if (isDev) return []
  try {
    const tree = categoryTree(await getCategories(division), division)
    const params: { path: string[] }[] = [{ path: [] }, ...tree.cats.map((c) => ({ path: tree.pathOf(c) }))]
    const payload = await getCms()
    const prods = await payload.find({ collection: 'products', where: { _status: { equals: 'published' } }, limit: 300, depth: 0, pagination: false, select: { slug: true, category: true } })
    for (const p of prods.docs) {
      const id = typeof p.category === 'object' ? p.category.id : p.category
      const c = tree.byId.get(id)
      if (c) params.push({ path: [...tree.pathOf(c), p.slug] })
    }
    if (division === 'parts') {
      params.push({ path: ['brands'] })
      for (const b of await getBrands()) {
        params.push({ path: ['brands', b.slug] })
        for (const m of await getModelsForBrand(b.id)) params.push({ path: ['brands', b.slug, m.slug] })
      }
    }
    return params
  } catch (e) {
    console.error('[catalogue] generateStaticParams skipped:', e instanceof Error ? e.message : e)
    return []
  }
}

async function brandMetadata(segs: string[]): Promise<Metadata> {
  if (segs.length === 1) {
    const [brands, counts] = await Promise.all([getBrands(), getBrandCounts()])
    const hasIndexableBrand = brands.some((b) => (counts.get(b.id) ?? 0) > 0 && !b.seo?.noindex)
    return pageMeta({ title: 'SMT Spare Parts by Brand', description: 'Choose the manufacturer of your SMT machine to see its models and the spare parts listed for them.', path: '/spare-parts/brands', noindex: !hasIndexableBrand })
  }
  const brand = await getBrand(segs[1])
  if (!brand) return gone
  if (segs.length === 2) {
    const n = (await getBrandCounts()).get(brand.id) ?? 0
    return pageMeta({ title: brand.seo?.title || `${brand.name} Spare Parts | SMT Spare Parts`, description: brand.seo?.description || `Spare parts listed for ${brand.name} SMT machines.`, path: `/spare-parts/brands/${brand.slug}`, noindex: n === 0 || Boolean(brand.seo?.noindex) })
  }
  if (segs.length === 3) {
    const model = await getModel(brand.id, segs[2])
    if (!model) return gone
    const n = (await getProductsForModel(model.id)).length
    return pageMeta({ title: `${brand.name} ${model.name} Spare Parts`, description: `Spare parts verified to fit the ${brand.name} ${model.name}.`, path: `/spare-parts/brands/${brand.slug}/${model.slug}`, noindex: n === 0 || Boolean(brand.seo?.noindex) })
  }
  return gone
}

export async function catalogueMetadata(division: Division, segments?: string[]): Promise<Metadata> {
  const cfg = divisions[division]
  const { segs, page, invalid } = parseSegments(segments)
  if (invalid) return gone
  if (division === 'parts' && segs[0] === 'brands') return brandMetadata(segs)

  const tree = categoryTree(await getCategories(division), division)
  const r = resolveSegments(tree, segs)

  if (r.kind === 'hub') return page > 1 ? gone : pageMeta({ ...hubMeta[division], path: cfg.base })

  if (r.kind === 'category') {
    const c = r.category
    const counts = await getProductCounts()
    return pageMeta({
      title: `${c.seo?.title || `${c.name} | ${cfg.titleSuffix}`}${page > 1 ? ` (page ${page})` : ''}`,
      description: c.seo?.description || c.summary,
      path: tree.urlOf(c) + (page > 1 ? `/page/${page}` : ''),
      image: mediaOf(c.seo?.image)?.url ?? mediaOf(c.image)?.url,
      noindex: !categoryIndexable(c, counts.get(c.id) ?? 0),
    })
  }

  if (r.kind === 'product') {
    const p = await getProduct(r.category.id, r.productSlug)
    if (!p) return gone
    return pageMeta({
      title: p.seo?.title || `${p.title}${p.partNumber ? ` (${p.partNumber})` : ''} | ${cfg.titleSuffix}`,
      description: p.seo?.description || p.shortIntro,
      path: `${tree.urlOf(r.category)}/${p.slug}`,
      image: mediaOf(p.seo?.image)?.url ?? mediaOf(p.gallery?.[0]?.image)?.url,
      noindex: Boolean(p.seo?.noindex),
    })
  }

  const planned = findNavRoute(`${cfg.base}/${segs.join('/')}`)
  return planned ? { title: planned.label, robots: { index: false, follow: true } } : gone
}

async function BrandRoutes({ segs }: { segs: string[] }) {
  if (segs.length === 1) return <BrandsIndex />
  const brand = await getBrand(segs[1])
  if (!brand) notFound()
  if (segs.length === 2) return <BrandView brand={brand} />
  if (segs.length === 3) {
    const model = await getModel(brand.id, segs[2])
    if (!model) notFound()
    return <ModelView brand={brand} model={model} />
  }
  notFound()
}

export async function CataloguePage({ division, segments }: { division: Division; segments?: string[] }) {
  const cfg = divisions[division]
  const { segs, page, invalid } = parseSegments(segments)
  if (invalid) notFound()
  if (division === 'parts' && segs[0] === 'brands') return <BrandRoutes segs={segs} />

  const tree = categoryTree(await getCategories(division), division)
  const r = resolveSegments(tree, segs)

  if (r.kind === 'hub') {
    if (page > 1) notFound()
    if (division === 'equipment') return <EquipmentHub tree={tree} />
    if (division === 'peripherals') return <PeripheralsHub tree={tree} />
    return <PartsHub tree={tree} />
  }
  if (r.kind === 'category') return <CategoryView division={division} tree={tree} category={r.category} page={page} />
  if (r.kind === 'product' && page === 1) {
    const product = await getProduct(r.category.id, r.productSlug)
    if (product) return <ProductView division={division} tree={tree} category={r.category} product={product} />
  }

  // Promised by the navigation but not in the CMS: show an honest placeholder rather than a broken link.
  const planned = findNavRoute(`${cfg.base}/${segs.join('/')}`)
  if (planned) return <PlannedPage route={planned} />
  notFound()
}
