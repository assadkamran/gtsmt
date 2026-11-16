import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { getSettings, isDev } from '@/lib/cms'
import { rfqHref } from '@/lib/rfq'
import { pageMeta } from '@/lib/seo'
import { Button } from '@/components/Button'
import { PageBand } from '@/components/PageBand'
import { RfqBanner } from '@/components/RfqBanner'

export const revalidate = 3600

type Settings = Awaited<ReturnType<typeof getSettings>>

const hasCompanyInfo = (s: Settings) => Boolean(s && (s.legalName || s.email || s.phone || s.yearFounded || s.certifications?.length || s.locations?.length))

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return pageMeta({
    title: 'About Us | SMT Equipment and Spare Parts Supplier',
    description: 'GTSMT supplies SMT equipment, complete PCB assembly lines, spare parts, feeders and factory peripherals to international electronics manufacturers.',
    path: '/about-us',
    // Until the owner has supplied real company details this page is generic, so it stays out of search results.
    noindex: !hasCompanyInfo(s),
  })
}

const supply = [
  { label: 'SMT production lines', href: '/smt-solutions', text: 'Complete, turnkey, LED, high-speed and flexible lines.' },
  { label: 'SMT equipment', href: '/smt-equipment', text: 'Pick and place, printers, reflow ovens, inspection and more.' },
  { label: 'Feeders', href: '/spare-parts/feeders', text: 'Tape, electric, pneumatic, tray and stick feeders.' },
  { label: 'Spare parts', href: '/spare-parts', text: 'Nozzles, motors, belts, sensors, cameras, boards and cables.' },
  { label: 'SMT peripherals', href: '/smt-peripherals', text: 'Loaders, unloaders, conveyors, buffers and ESD equipment.' },
  { label: 'Factory setup', href: '/smt-solutions/smt-factory-setup', text: 'Customised production solutions and factory planning.' },
]

const briefing = ['Board size and thickness', 'Required production volume', 'The components you place', 'Single or double-sided assembly', 'Your existing equipment, if any', 'For parts: your machine model and part numbers']

export default async function Page() {
  const s = await getSettings()
  const facts: { k: string; v: ReactNode }[] = []
  if (s?.legalName) facts.push({ k: 'Company', v: s.legalName })
  if (s?.yearFounded) facts.push({ k: 'Founded', v: String(s.yearFounded) })
  if (s?.certifications?.length) facts.push({ k: 'Certifications', v: <ul className="space-y-1">{s.certifications.map((c, i) => <li key={`${c.name}-${i}`}>{c.name}{c.issuer ? <span className="font-normal text-muted"> ({c.issuer})</span> : null}</li>)}</ul> })
  if (s?.locations?.length) facts.push({ k: 'Locations', v: <ul className="space-y-1">{s.locations.map((l, i) => <li key={`${l.label}-${i}`}>{l.label}{l.detail ? <span className="block text-[0.9375rem] font-normal text-muted">{l.detail}</span> : null}</li>)}</ul> })
  const refs = (s?.references ?? []).filter((r) => r.permissionConfirmed)
  if (refs.length) facts.push({ k: 'Customer references', v: <ul className="space-y-1">{refs.map((r, i) => <li key={`${r.customer}-${i}`}>{r.customer}</li>)}</ul> })
  if (s?.shippingNote) facts.push({ k: 'Shipping', v: <span className="font-normal">{s.shippingNote}</span> })

  return (
    <>
      <PageBand
        crumbs={[{ label: 'About Us' }]}
        eyebrow="About us"
        title="About GTSMT"
        intro="GTSMT supplies SMT manufacturing equipment, complete PCB assembly production-line solutions, spare parts, feeders, accessories and factory peripherals to international B2B customers."
        actions={<Button href={rfqHref()} size="lg">Request a quote</Button>}
      />

      <section aria-labelledby="supply-h" className="bg-white">
        <div className="mx-auto max-w-page px-6 py-12 lg:px-10 lg:py-16">
          <h2 id="supply-h" className="mb-6 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">What we supply</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {supply.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="group block h-full rounded-card border border-line p-6 transition duration-200 motion-safe:hover:-translate-y-1 hover:border-dark-600">
                  <h3 className="text-xl font-bold text-dark-900 transition-colors group-hover:text-accent-text">{i.label}</h3>
                  <p className="mt-1.5 text-[0.9375rem] text-muted">{i.text}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {(facts.length > 0 || isDev) && (
        <section aria-labelledby="facts-h" className="border-t border-line bg-surface">
          <div className="mx-auto max-w-page px-6 py-12 lg:px-10 lg:py-16">
            <h2 id="facts-h" className="mb-6 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">Company facts</h2>
            {facts.length > 0 ? (
              <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {facts.map((f) => <div key={f.k} className="rounded-card border border-line bg-white p-6"><dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{f.k}</dt><dd className="mt-2 font-heading text-lg font-bold text-dark-900">{f.v}</dd></div>)}
              </dl>
            ) : (
              <p className="rounded-lg border border-dashed border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn-text">Development preview: company facts (legal name, year founded, certifications, locations, customer references, shipping) appear here only when entered in Website Settings. Nothing is invented. This section is hidden in production until then.</p>
            )}
          </div>
        </section>
      )}

      <section aria-labelledby="brief-h" className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-page gap-8 px-6 py-12 lg:grid-cols-[1fr_1.2fr] lg:gap-14 lg:px-10 lg:py-16">
          <div>
            <h2 id="brief-h" className="mb-3 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">What to send us for a quote</h2>
            <p className="max-w-md text-muted">The more we know about what you are building, the more relevant our reply will be.</p>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {briefing.map((b) => <li key={b} className="flex items-start gap-3 border-b border-line py-3"><Check aria-hidden className="mt-0.5 size-5 shrink-0 text-accent-text" />{b}</li>)}
          </ul>
        </div>
      </section>

      <RfqBanner id="about-rfq" title="Tell us what you are building." href={rfqHref()} />
    </>
  )
}
