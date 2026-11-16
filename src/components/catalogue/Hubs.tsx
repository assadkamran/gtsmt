import Link from 'next/link'
import type { Category } from '@/payload-types'
import { getBrandCounts, getBrands, getProductCounts, type CategoryTree } from '@/lib/catalogue'
import { getBrandsAndModels, isDev } from '@/lib/cms'
import { equipmentGroups, partsGroups } from '@/lib/nav'
import { ORIGIN, PART_ORIGINS } from '@/lib/origin'
import { rfqHref } from '@/lib/rfq'
import { Button } from '../Button'
import { DocImage } from '../DocImage'
import { PageBand } from '../PageBand'
import { RfqBanner } from '../RfqBanner'
import { PartsSearch } from '../home/PartsSearch'
import { CategoryCard } from './CategoryCard'

export async function EquipmentHub({ tree }: { tree: CategoryTree }) {
  const counts = await getProductCounts()
  const used = new Set<number>()
  const groups = equipmentGroups
    .map((g) => {
      const cats = g.links.map((l) => tree.bySlug(l.href.split('/').pop()!)).filter((c): c is Category => !!c)
      cats.forEach((c) => used.add(c.id))
      return { title: g.title, cats }
    })
    .filter((g) => g.cats.length > 0)
  const extra = tree.roots.filter((c) => !used.has(c.id))
  if (extra.length) groups.push({ title: 'More equipment', cats: extra })
  return (
    <>
      <PageBand
        crumbs={[{ label: 'SMT Equipment' }]}
        eyebrow="SMT equipment"
        title="SMT Equipment"
        intro="Equipment for every station in an SMT line, listed in production-line order."
        actions={<Button href={rfqHref({ need: 'equipment' })} size="lg">Request a quote</Button>}
      />
      <section aria-label="Equipment categories" className="bg-white">
        <div className="mx-auto max-w-page space-y-14 px-6 py-12 lg:px-10 lg:py-16">
          {groups.map((g, gi) => (
            <section key={g.title} aria-labelledby={`grp-${gi}`}>
              <h2 id={`grp-${gi}`} className="mb-6 flex items-center gap-3 font-heading text-2xl font-bold text-dark-900">
                <span aria-hidden className="grid size-8 place-items-center rounded-full bg-accent-tint text-sm text-accent-text">{gi + 1}</span>
                {g.title}
              </h2>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {g.cats.map((c) => <li key={c.id}><CategoryCard category={c} href={tree.urlOf(c)} count={counts.get(c.id)} /></li>)}
              </ul>
            </section>
          ))}
        </div>
      </section>
      <RfqBanner id="eq-rfq" title="Not sure what your line needs? Tell us what you are building." href={rfqHref({ need: 'line' })} cta="Plan my line" />
    </>
  )
}

export async function PeripheralsHub({ tree }: { tree: CategoryTree }) {
  const counts = await getProductCounts()
  return (
    <>
      <PageBand
        crumbs={[{ label: 'SMT Peripherals' }]}
        eyebrow="SMT peripherals"
        title="SMT Peripherals"
        intro="The equipment that keeps a line moving: loaders, unloaders, conveyors, buffers and factory accessories."
        actions={<Button href={rfqHref({ need: 'peripherals' })} size="lg">Request a quote</Button>}
      />
      <section aria-labelledby="per-cats-h" className="bg-white">
        <div className="mx-auto max-w-page px-6 py-12 lg:px-10 lg:py-16">
          <h2 id="per-cats-h" className="sr-only">Peripherals categories</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tree.roots.map((c) => <li key={c.id}><CategoryCard category={c} href={tree.urlOf(c)} count={counts.get(c.id)} /></li>)}
          </ul>
        </div>
      </section>
      <RfqBanner id="per-rfq" title="Tell us which machines it needs to connect to." href={rfqHref({ need: 'peripherals' })} />
    </>
  )
}

export async function PartsHub({ tree }: { tree: CategoryTree }) {
  const [{ brands: selectBrands, models }, brands, brandCounts] = await Promise.all([getBrandsAndModels(), getBrands(), getBrandCounts()])
  const groups = partsGroups.map((g) => ({
    title: g.title,
    links: g.links.map((l) => {
      const cat = tree.bySlug(l.href.split('/').pop()!)
      return { label: cat?.name ?? l.label, href: cat ? tree.urlOf(cat) : l.href }
    }),
  }))
  return (
    <>
      <PageBand
        crumbs={[{ label: 'Spare Parts' }]}
        eyebrow="Spare parts"
        title="Find the right part for your machine"
        intro="Search by part number, or narrow by brand and machine model. Compatibility is shown only where it has been verified."
      >
        <PartsSearch brands={selectBrands} models={models} className="mt-8 max-w-5xl border border-line" />
      </PageBand>

      {(brands.length > 0 || isDev) && (
        <section aria-labelledby="brands-h" className="bg-white">
          <div className="mx-auto max-w-page px-6 pb-4 pt-12 lg:px-10 lg:pt-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 id="brands-h" className="text-[1.75rem] font-bold text-dark-900 lg:text-3xl">Shop by brand</h2>
              {brands.length > 0 && <Link href="/spare-parts/brands" className="text-[0.9375rem] font-semibold text-accent-text hover:text-dark-900">All brands &rarr;</Link>}
            </div>
            {brands.length > 0 ? (
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {brands.map((b) => (
                  <li key={b.id}>
                    <Link href={`/spare-parts/brands/${b.slug}`} className="flex h-full flex-col items-center justify-center rounded-card border border-line bg-white px-3 py-7 text-center transition duration-200 motion-safe:hover:-translate-y-1 hover:border-dark-600">
                      {b.logo ? <DocImage media={b.logo} brief={b.name} tone="light" fit="contain" sizes="160px" className="mb-2 h-10 w-28" /> : <span className="font-heading text-xl font-extrabold text-dark-900">{b.name}</span>}
                      <span className="mt-1 text-[0.8125rem] text-muted">{brandCounts.get(b.id) ?? 0} parts</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn-text">Development preview: brand tiles appear here for manufacturers marked &quot;Show as brand hub&quot; in the CMS. Hidden in production until then.</p>
            )}
          </div>
        </section>
      )}

      <section aria-labelledby="cats-h" className="bg-white">
        <div className="mx-auto max-w-page px-6 py-12 lg:px-10 lg:py-14">
          <h2 id="cats-h" className="mb-6 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">Browse by category</h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {groups.map((g) => (
              <li key={g.title} className="rounded-card border border-line bg-white p-6">
                <h3 className="mb-3 text-[1.3125rem] font-bold text-dark-900">{g.title}</h3>
                <ul>
                  {g.links.map((l) => <li key={l.href}><Link href={l.href} className="block py-1.5 text-ink transition-colors hover:text-accent-text">{l.label}</Link></li>)}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="how-parts-are-labelled" aria-labelledby="labels-h" className="scroll-mt-8 border-t border-line bg-surface">
        <div className="mx-auto max-w-page px-6 py-14 lg:px-10 lg:py-16">
          <span className="eyebrow">Transparent sourcing</span>
          <h2 id="labels-h" className="mb-3 text-[1.875rem] font-bold text-dark-900 lg:text-4xl">How every part is labelled</h2>
          <p className="mb-8 max-w-2xl text-muted">Each listing states its origin, so you know what you are buying before you ask for a quote.</p>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PART_ORIGINS.map((k) => {
              const o = ORIGIN[k]
              const Icon = o.icon
              return (
                <li key={k} className="rounded-card border border-line bg-white p-6">
                  <Icon aria-hidden className="size-7 text-accent-text" strokeWidth={1.6} />
                  <h3 className="mb-1.5 mt-3 text-lg font-bold text-dark-900">{o.label}</h3>
                  <p className="text-[0.9375rem] text-muted">{o.definition}</p>
                </li>
              )
            })}
          </ul>
          {isDev && <p className="mt-5 rounded-lg border border-dashed border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn-text">Development preview: these definitions are drafts. Confirm them against how GTSMT actually sources parts before launch. This note is hidden in production.</p>}
        </div>
      </section>

      <RfqBanner id="parts-rfq" eyebrow="Can't find your part?" title="Send us the part number or your machine model." href={rfqHref({ need: 'part' })} cta="Request a part" />
    </>
  )
}
