import Link from 'next/link'
import type { ReactNode } from 'react'
import { Check, Download } from 'lucide-react'
import type { Category, MachineModel, Product, ProductDocument } from '@/payload-types'
import { divisions, getProductCounts, getRelatedProducts, getTrees, mediaOf, productHref, publishedAccessories, type CategoryTree, type Division } from '@/lib/catalogue'
import { originOf } from '@/lib/origin'
import { specRows, specText } from '@/lib/specs'
import { rfqHref, type Need } from '@/lib/rfq'
import { abs, clip } from '@/lib/seo'
import { Breadcrumbs } from '../Breadcrumbs'
import { AddToCompare } from '../compare/CompareToggle'
import { Button } from '../Button'
import { JsonLd } from '../JsonLd'
import { ImagePlaceholder } from '../MediaSlot'
import { OriginBadge } from '../OriginBadge'
import { RfqBanner } from '../RfqBanner'
import { RichText, hasRichText } from '../RichText'
import { CompatibilityTable, type CompatRow } from '../product/CompatibilityTable'
import { DocumentList, documentLabel } from '../product/DocumentList'
import { ProductGallery } from '../product/ProductGallery'
import { ProductNav } from '../product/ProductNav'
import { SpecTable } from '../product/SpecTable'
import { ProductCard } from './ProductCard'

const needFor: Record<Division, Need> = { equipment: 'equipment', parts: 'part', peripherals: 'peripherals' }

function Block({ id, title, children, tone }: { id: string; title: string; children: ReactNode; tone?: 'surface' }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`scroll-mt-8 border-t border-line ${tone === 'surface' ? 'bg-surface' : 'bg-white'}`}>
      <div className="mx-auto max-w-page px-6 py-12 lg:px-10 lg:py-14">
        <h2 id={`${id}-h`} className="mb-6 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">{title}</h2>
        {children}
      </div>
    </section>
  )
}

export async function ProductView({ division, tree, category, product }: { division: Division; tree: CategoryTree; category: Category; product: Product }) {
  const cfg = divisions[division]
  const trees = await getTrees()
  const [related, counts] = await Promise.all([getRelatedProducts(product), getProductCounts()])
  // Comparing needs at least one other product in the same category.
  const canCompare = Boolean(category.allowCompare) && (counts.get(category.id) ?? 0) >= 2
  const accessories = publishedAccessories(product)

  const images = (product.gallery ?? []).map((g) => mediaOf(g.image)).filter((m): m is NonNullable<typeof m> => !!m).map((m) => ({ url: m.url!, alt: m.alt }))
  const docs = (product.documents ?? []).filter((d): d is ProductDocument => !!d && typeof d === 'object')
  const datasheet = docs.find((d) => d.type === 'datasheet') ?? docs[0]
  const manufacturer = product.manufacturer && typeof product.manufacturer === 'object' ? product.manufacturer : null
  const specs = specRows(product, (category.specAttributes ?? []).map((a) => (typeof a === 'object' ? a.id : a)))
  const features = product.features ?? []
  const applications = product.applications ?? []
  const origin = originOf(product.partOrigin)

  const rows: CompatRow[] = (product.compatibility ?? [])
    .filter((c) => c.verified && c.machineModel && typeof c.machineModel === 'object')
    .map((c) => {
      const m = c.machineModel as MachineModel
      return { manufacturer: m.manufacturer && typeof m.manufacturer === 'object' ? m.manufacturer.name : '', model: m.name, source: c.source ?? '', note: c.note }
    })

  const hasOverview = hasRichText(product.description) || features.length > 0
  const showCompat = division === 'parts' || rows.length > 0
  const sections = [
    hasOverview && { id: 'overview', label: 'Overview' },
    specs.length > 0 && { id: 'specifications', label: 'Specifications' },
    applications.length > 0 && { id: 'applications', label: 'Applications' },
    showCompat && { id: 'compatibility', label: 'Compatibility' },
    accessories.length > 0 && { id: 'accessories', label: 'Accessories' },
    docs.length > 0 && { id: 'documents', label: 'Documents' },
    related.length > 0 && { id: 'related', label: 'Related' },
  ].filter(Boolean) as { id: string; label: string }[]

  const trail = tree.trail(category)
  const url = `${cfg.base}/${tree.pathOf(category).join('/')}/${product.slug}`
  const crumbs = [
    { label: cfg.label, href: cfg.base },
    ...trail.map((c) => ({ label: c.name, href: tree.urlOf(c) })),
    { label: product.title },
  ]
  const quote = rfqHref({ need: needFor[division], product: product.id, part: product.partNumber ?? undefined, topic: product.title })
  const brandHub = manufacturer?.showAsBrandHub ? `/spare-parts/brands/${manufacturer.slug}` : null

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: clip(product.shortIntro, 300),
    sku: product.partNumber ?? undefined,
    mpn: product.partNumber ?? undefined,
    brand: manufacturer ? { '@type': 'Brand', name: manufacturer.name } : undefined,
    category: category.name,
    image: images.length ? images.map((i) => abs(i.url)) : undefined,
    url: abs(url),
  }

  return (
    <>
      <JsonLd data={ld} />
      <section aria-labelledby="page-title" className="bg-white">
        <div className="mx-auto max-w-page px-6 pt-6 lg:px-10">
          <Breadcrumbs items={crumbs} />
        </div>
        <div className="mx-auto grid max-w-page gap-10 px-6 pb-12 pt-8 lg:grid-cols-[7fr_5fr] lg:gap-14 lg:px-10 lg:pb-14 lg:pt-10">
          <div>
            {images.length > 0 ? (
              <ProductGallery images={images} title={product.title} />
            ) : (
              <ImagePlaceholder tone="light" brief="Product photos" className="aspect-[4/3] rounded-card border border-line" />
            )}
          </div>
          <div>
            <Link href={tree.urlOf(category)} className="inline-block rounded-full bg-accent-tint px-3 py-1 text-xs font-semibold text-accent-text hover:bg-line">{category.name}</Link>
            <h1 id="page-title" className="mb-3 mt-3.5 text-[clamp(1.875rem,3.4vw,2.625rem)] font-extrabold text-dark-900">{product.title}</h1>
            <dl className="mb-5 flex flex-wrap gap-x-6 gap-y-1 text-[0.9375rem] text-muted">
              {product.partNumber && <div className="flex gap-1.5"><dt>Part no.</dt><dd className="font-semibold text-ink">{product.partNumber}</dd></div>}
              {manufacturer && (
                <div className="flex gap-1.5">
                  <dt>Manufacturer</dt>
                  <dd className="font-semibold text-ink">{brandHub ? <Link href={brandHub} className="text-accent-text hover:text-dark-900">{manufacturer.name}</Link> : manufacturer.name}</dd>
                </div>
              )}
              {(product.altPartNumbers ?? []).length > 0 && <div className="flex gap-1.5"><dt>Also listed as</dt><dd className="font-semibold text-ink">{product.altPartNumbers!.map((a) => a.value).join(', ')}</dd></div>}
            </dl>
            {origin && (
              <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <OriginBadge origin={product.partOrigin} />
                <Link href="/spare-parts#how-parts-are-labelled" className="text-sm font-semibold text-accent-text hover:text-dark-900">What this means</Link>
              </div>
            )}
            {product.shortIntro && <p className="mb-6 text-[1.125rem] leading-relaxed text-muted">{product.shortIntro}</p>}
            {specs.length > 0 && (
              <dl className="mb-7 border-t border-line">
                {specs.slice(0, 3).map((s, i) => (
                  <div key={`${s.label}-${i}`} className="flex justify-between gap-4 border-b border-dotted border-line py-2.5">
                    <dt className="text-muted">{s.label}</dt>
                    <dd className="text-right font-semibold text-dark-900">{specText(s)}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div id="product-cta" className="flex flex-col gap-3">
              <Button href={quote} size="lg" className="w-full">Request a quote for this product</Button>
              {datasheet?.url && (
                <a href={datasheet.url} className="inline-flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-control border-2 border-dark-900 px-7 text-base font-semibold text-dark-900 transition-colors hover:bg-dark-900 hover:text-white">
                  <Download aria-hidden className="size-5" />{documentLabel(datasheet)} (PDF)
                </a>
              )}
              {canCompare && (
                <AddToCompare
                  item={{ id: product.id, title: product.title, image: images[0]?.url ?? null }}
                  category={{ id: category.id, name: category.name, href: tree.urlOf(category) }}
                />
              )}
            </div>
            {product.quoteOnly && <p className="mt-3.5 text-sm text-muted">Quote only. Prices are provided on request.</p>}
          </div>
        </div>
      </section>

      {sections.length > 1 && <ProductNav sections={sections} title={product.title} rfqHref={quote} />}

      {hasOverview && (
        <section id="overview" aria-label="Overview" className="scroll-mt-8 bg-white">
          <div className="mx-auto grid max-w-page gap-10 px-6 py-12 lg:grid-cols-[1.2fr_1fr] lg:gap-14 lg:px-10 lg:py-14">
            {hasRichText(product.description) && (
              <div><h2 className="mb-5 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">Overview</h2><RichText data={product.description} /></div>
            )}
            {features.length > 0 && (
              <div>
                <h2 className="mb-5 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">Main features</h2>
                <ul>{features.map((f, i) => <li key={`${f.text}-${i}`} className="flex items-start gap-3 py-2"><Check aria-hidden className="mt-0.5 size-5 shrink-0 text-accent-text" />{f.text}</li>)}</ul>
              </div>
            )}
          </div>
        </section>
      )}

      {specs.length > 0 && (
        <Block id="specifications" title="Technical specifications" tone={hasOverview ? 'surface' : undefined}>
          <SpecTable specs={specs} caption={`Technical specifications for ${product.title}`} />
          <p className="mt-4 text-sm text-muted">Only specifications entered for this product are listed. Need a value that is not shown? Ask in your enquiry.</p>
        </Block>
      )}

      {applications.length > 0 && (
        <Block id="applications" title="Applications">
          <ul className="flex flex-wrap gap-2.5">{applications.map((a, i) => <li key={`${a.text}-${i}`} className="rounded-full bg-accent-tint px-4 py-2 text-[0.9375rem] font-semibold text-accent-text">{a.text}</li>)}</ul>
        </Block>
      )}

      {showCompat && (
        <Block id="compatibility" title="Machine compatibility" tone="surface">
          {rows.length > 0 ? (
            <>
              <CompatibilityTable rows={rows} />
              <p className="mt-4 text-sm text-muted">Compatibility appears only when it has been verified and a source recorded. Not listed? Include your machine model in your enquiry.</p>
            </>
          ) : (
            <p className="max-w-2xl rounded-card border border-dashed border-dark-600/40 bg-white p-5 text-muted">Compatibility for this product has not been verified yet. Include your machine model in your enquiry so it can be confirmed.</p>
          )}
        </Block>
      )}

      {accessories.length > 0 && (
        <Block id="accessories" title="Available accessories">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {accessories.map((a) => <li key={a.id}><ProductCard product={a} href={productHref(trees, a) ?? url} tag={typeof a.category === 'object' ? a.category.name : undefined} /></li>)}
          </ul>
        </Block>
      )}

      {docs.length > 0 && (
        <Block id="documents" title="Documents" tone="surface">
          <div className="max-w-3xl"><DocumentList docs={docs} /></div>
        </Block>
      )}

      {related.length > 0 && (
        <Block id="related" title="Related products">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => <li key={r.id}><ProductCard product={r} href={productHref(trees, r) ?? url} tag={typeof r.category === 'object' ? r.category.name : undefined} /></li>)}
          </ul>
        </Block>
      )}

      <RfqBanner id="prod-rfq" title={`Request a quote for ${product.title}`} note={`Enquiry will include: ${product.partNumber ?? product.title}`} href={quote} cta="Start your enquiry" />
    </>
  )
}
