import type { Metadata } from 'next'
import Link from 'next/link'
import { countryOptions } from '@/lib/countries'
import { getBrandsAndModels, getCms, getSettings } from '@/lib/cms'
import { getCategories, type Division } from '@/lib/catalogue'
import type { Initial, Need } from '@/lib/enquiry/form'
import { pageMeta } from '@/lib/seo'
import { PageBand } from '@/components/PageBand'
import { EnquiryWizard } from '@/components/enquiry/EnquiryWizard'

type Props = { searchParams: Promise<{ need?: string; product?: string; part?: string; topic?: string }> }

// Form pages carry no content of their own, so they stay out of search results. Query strings never create new pages.
export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({ title: 'Request a Quote', description: 'Tell us what you need and we will reply with a quotation or options.', path: '/request-a-quote', noindex: true })
}

const NEEDS: Need[] = ['line', 'equipment', 'part', 'peripherals']
const NEED_OF: Record<Division, Need> = { equipment: 'equipment', parts: 'part', peripherals: 'peripherals' }
const clip = (v: string | undefined, n: number) => (v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, n)

function parseIds(raw: string | undefined): number[] {
  const ids: number[] = []
  for (const p of (raw ?? '').slice(0, 120).split(',')) {
    const n = /^\d{1,9}$/.test(p.trim()) ? Number(p.trim()) : NaN
    if (Number.isInteger(n) && n > 0 && !ids.includes(n)) ids.push(n)
    if (ids.length === 10) break
  }
  return ids
}

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams
  const ids = parseIds(sp.product)
  const payload = await getCms()

  // Product ids arrive in the link, so they are checked against the catalogue: only published products are kept.
  const found = ids.length ? await payload.find({ collection: 'products', where: { and: [{ id: { in: ids } }, { _status: { equals: 'published' } }] }, limit: 10, depth: 1, pagination: false }) : null
  const byId = new Map((found?.docs ?? []).map((p) => [p.id, p]))
  const products = ids.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p))
  const titles = Object.fromEntries(products.map((p) => [p.id, p.title]))

  const requested = NEEDS.find((n) => n === sp.need)
  const division = products[0] && typeof products[0].category === 'object' ? (products[0].category.division as Division) : undefined
  const initial: Initial = {
    need: requested ?? (division ? NEED_OF[division] : undefined),
    products: products.map((p) => p.id),
    topic: clip(sp.topic, 200),
    part: clip(sp.part, 200),
  }

  const [settings, brands, equipment, peripherals] = await Promise.all([getSettings(), getBrandsAndModels(), getCategories('equipment'), getCategories('peripherals')])

  return (
    <>
      <PageBand crumbs={[{ label: 'Request a quote' }]} eyebrow="Request a quote" title="Tell us what you need" intro="Answer a few questions and we will reply with a quotation or options. Anything you are not sure of can stay blank." />
      <section aria-label="Quote request" className="bg-white">
        <div className="mx-auto grid max-w-page gap-10 px-6 py-10 lg:grid-cols-[1fr_20rem] lg:gap-12 lg:px-10 lg:py-14">
          <div className="min-w-0">
            <EnquiryWizard
              initial={initial}
              productTitles={titles}
              options={{
                photos: settings?.allowEnquiryPhotos !== false,
                siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null,
                brands: brands.brands.map((b) => b.name),
                equipmentTypes: equipment.map((c) => c.name),
                peripheralTypes: peripherals.map((c) => c.name),
                countries: countryOptions(),
              }}
            />
          </div>
          <aside className="space-y-5 lg:pt-1">
            <div className="rounded-card border border-line bg-surface p-5">
              <h2 className="font-heading text-lg font-bold text-dark-900">What happens next</h2>
              <ol className="mt-3 space-y-3 text-[0.9375rem] text-ink">
                {['You tell us what you need.', 'We read it and may come back with a few questions.', 'We reply by email with a quotation or options.'].map((t, i) => (
                  <li key={t} className="flex gap-3"><span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-on-accent">{i + 1}</span><span>{t}</span></li>
                ))}
              </ol>
            </div>
            <p className="text-[0.9375rem] text-muted">
              Prefer to write or call? See the <Link href="/contact" className="font-semibold text-accent-text hover:underline">contact page</Link>.
            </p>
          </aside>
        </div>
      </section>
    </>
  )
}
