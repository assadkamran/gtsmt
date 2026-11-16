import type { MetadataRoute } from 'next'
import { categoryIndexable, documentIndexable, getBrandCounts, getBrands, getIndustries, getProductCounts, getSolutions, getTrees, productHref, type Division } from '@/lib/catalogue'
import { getCms, getSettings } from '@/lib/cms'
import { abs } from '@/lib/seo'

export const revalidate = 3600

/** Only real, reviewed, non-empty pages. Unreviewed starter copy and "in preparation" pages are excluded. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = ['/', '/smt-solutions', '/smt-equipment', '/spare-parts', '/smt-peripherals', '/industries'].map((p) => ({
    url: abs(p),
    changeFrequency: 'weekly' as const,
    priority: p === '/' ? 1 : 0.8,
  }))
  try {
    const [trees, counts, solutions, industries, brands, brandCounts, settings, payload] = await Promise.all([getTrees(), getProductCounts(), getSolutions(), getIndustries(), getBrands(), getBrandCounts(), getSettings(), getCms()])

    for (const d of ['equipment', 'parts', 'peripherals'] as Division[]) {
      for (const c of trees[d].cats) {
        if (categoryIndexable(c, counts.get(c.id) ?? 0)) entries.push({ url: abs(trees[d].urlOf(c)), lastModified: c.updatedAt, changeFrequency: 'weekly', priority: 0.7 })
      }
    }
    for (const s of solutions) if (documentIndexable(s)) entries.push({ url: abs(`/smt-solutions/${s.slug}`), lastModified: s.updatedAt, changeFrequency: 'monthly', priority: 0.8 })
    for (const i of industries) if (documentIndexable(i)) entries.push({ url: abs(`/industries/${i.slug}`), lastModified: i.updatedAt, changeFrequency: 'monthly', priority: 0.6 })

    const products = await payload.find({ collection: 'products', where: { _status: { equals: 'published' } }, limit: 5000, pagination: false, depth: 0 })
    for (const p of products.docs) {
      if (p.seo?.noindex) continue
      const href = productHref(trees, p)
      if (href) entries.push({ url: abs(href), lastModified: p.updatedAt, changeFrequency: 'weekly', priority: 0.6 })
    }

    const liveBrands = brands.filter((b) => (brandCounts.get(b.id) ?? 0) > 0 && !b.seo?.noindex)
    if (liveBrands.length) entries.push({ url: abs('/spare-parts/brands'), changeFrequency: 'weekly', priority: 0.6 })
    for (const b of liveBrands) entries.push({ url: abs(`/spare-parts/brands/${b.slug}`), lastModified: b.updatedAt, changeFrequency: 'weekly', priority: 0.5 })

    if (settings && (settings.legalName || settings.email || settings.phone || settings.yearFounded)) entries.push({ url: abs('/about-us'), priority: 0.5 })
    if (settings && (settings.email || settings.phone || settings.address)) entries.push({ url: abs('/contact'), priority: 0.5 })
  } catch (e) {
    console.error('[sitemap] dynamic entries skipped:', e instanceof Error ? e.message : e)
  }
  return entries
}
