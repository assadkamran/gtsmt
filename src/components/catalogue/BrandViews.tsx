import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { MachineModel, Manufacturer } from '@/payload-types'
import { getBrandCounts, getBrands, getModelsForBrand, getProductsByBrand, getProductsForModel, getTrees, productHref } from '@/lib/catalogue'
import { rfqHref } from '@/lib/rfq'
import { Button } from '../Button'
import { DocImage } from '../DocImage'
import { PageBand } from '../PageBand'
import { RfqBanner } from '../RfqBanner'
import { EmptyState } from './EmptyState'
import { ProductCard } from './ProductCard'

const base = '/spare-parts'

export async function BrandsIndex() {
  const [brands, counts] = await Promise.all([getBrands(), getBrandCounts()])
  return (
    <>
      <PageBand crumbs={[{ label: 'Spare Parts', href: base }, { label: 'Brands' }]} eyebrow="Spare parts" title="Shop spare parts by brand" intro="Choose the manufacturer of your machine to see its models and the parts listed for them." />
      <section aria-label="Brands" className="bg-white">
        <div className="mx-auto max-w-page px-6 py-12 lg:px-10 lg:py-16">
          {brands.length > 0 ? (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {brands.map((b) => (
                <li key={b.id}>
                  <Link href={`${base}/brands/${b.slug}`} className="flex h-full flex-col items-center justify-center rounded-card border border-line bg-white px-3 py-8 text-center transition duration-200 motion-safe:hover:-translate-y-1 hover:border-dark-600">
                    {b.logo ? <DocImage media={b.logo} brief={b.name} tone="light" fit="contain" sizes="160px" className="mb-2 h-10 w-28" /> : <span className="font-heading text-xl font-extrabold text-dark-900">{b.name}</span>}
                    <span className="mt-1 text-[0.8125rem] text-muted">{counts.get(b.id) ?? 0} parts</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Brands are being added." text="Tell us the make and model of your machine and the part you need." href={rfqHref({ need: 'part' })} cta="Request a part" />
          )}
        </div>
      </section>
      <RfqBanner id="brands-rfq" eyebrow="Can't find your brand?" title="Send us your machine model and the part you need." href={rfqHref({ need: 'part' })} cta="Request a part" />
    </>
  )
}

export async function BrandView({ brand }: { brand: Manufacturer }) {
  const [models, products, trees] = await Promise.all([getModelsForBrand(brand.id), getProductsByBrand(brand.id), getTrees()])
  return (
    <>
      <PageBand
        crumbs={[{ label: 'Spare Parts', href: base }, { label: 'Brands', href: `${base}/brands` }, { label: brand.name }]}
        eyebrow="Spare parts"
        title={`${brand.name} spare parts`}
        intro={brand.notes ?? `Parts listed for ${brand.name} machines. Compatibility is shown only where it has been verified.`}
        actions={<Button href={rfqHref({ need: 'part', topic: `${brand.name} part` })} size="lg">Request a part</Button>}
      />
      <section aria-label={`${brand.name} parts`} className="bg-white">
        <div className="mx-auto max-w-page space-y-12 px-6 py-12 lg:px-10 lg:py-16">
          {models.length > 0 && (
            <section aria-labelledby="models-h">
              <h2 id="models-h" className="mb-5 font-heading text-2xl font-bold text-dark-900">{brand.name} machine models</h2>
              <ul className="flex flex-wrap gap-3">
                {models.map((m) => (
                  <li key={m.id}><Link href={`${base}/brands/${brand.slug}/${m.slug}`} className="inline-flex rounded-full border border-line px-4 py-2 text-[0.9375rem] font-semibold text-dark-900 transition-colors hover:border-accent hover:text-accent-text">{m.name}</Link></li>
                ))}
              </ul>
            </section>
          )}
          <section aria-labelledby="bp-h">
            <h2 id="bp-h" className="mb-5 font-heading text-2xl font-bold text-dark-900">Parts</h2>
            {products.length > 0 ? (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((p) => <li key={p.id}><ProductCard product={p} href={productHref(trees, p) ?? base} tag={typeof p.category === 'object' ? p.category.name : undefined} /></li>)}
              </ul>
            ) : (
              <EmptyState title="Parts for this brand are being added." text="Tell us the model and the part you need." href={rfqHref({ need: 'part', topic: `${brand.name} part` })} cta="Request a part" />
            )}
          </section>
        </div>
      </section>
      <RfqBanner id="brand-rfq" title={`Need a ${brand.name} part?`} href={rfqHref({ need: 'part', topic: `${brand.name} part` })} cta="Request a part" />
    </>
  )
}

export async function ModelView({ brand, model }: { brand: Manufacturer; model: MachineModel }) {
  const [products, trees] = await Promise.all([getProductsForModel(model.id), getTrees()])
  if (!model) notFound()
  return (
    <>
      <PageBand
        crumbs={[{ label: 'Spare Parts', href: base }, { label: 'Brands', href: `${base}/brands` }, { label: brand.name, href: `${base}/brands/${brand.slug}` }, { label: model.name }]}
        eyebrow="Spare parts"
        title={`${brand.name} ${model.name} parts`}
        intro="Parts verified to fit this model. Compatibility is shown only where it has been verified and a source recorded."
        actions={<Button href={rfqHref({ need: 'part', topic: `${brand.name} ${model.name} part` })} size="lg">Request a part</Button>}
      />
      <section aria-labelledby="model-parts-h" className="bg-white">
        <div className="mx-auto max-w-page px-6 py-12 lg:px-10 lg:py-16">
          <h2 id="model-parts-h" className="sr-only">Compatible parts</h2>
          {products.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => <li key={p.id}><ProductCard product={p} href={productHref(trees, p) ?? base} tag={typeof p.category === 'object' ? p.category.name : undefined} /></li>)}
            </ul>
          ) : (
            <EmptyState title="No verified parts listed for this model yet." text="Send us the part number you need and we will reply." href={rfqHref({ need: 'part', topic: `${brand.name} ${model.name} part` })} cta="Request a part" />
          )}
        </div>
      </section>
      <RfqBanner id="model-rfq" title={`Need a part for the ${model.name}?`} href={rfqHref({ need: 'part', topic: `${brand.name} ${model.name} part` })} cta="Request a part" />
    </>
  )
}
