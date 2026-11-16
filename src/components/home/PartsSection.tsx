import Link from 'next/link'
import { getBrandsAndModels } from '@/lib/cms'
import { MediaSlot } from '../MediaSlot'
import { Section, SectionHead } from '../Section'
import { PartsSearch } from './PartsSearch'

const chips = [
  ['Tape feeders', '/spare-parts/feeders/tape-feeders'],
  ['Electric feeders', '/spare-parts/feeders/electric-feeders'],
  ['Nozzles', '/spare-parts/nozzles'],
  ['Motors', '/spare-parts/motors'],
  ['Belts', '/spare-parts/belts'],
  ['Sensors', '/spare-parts/sensors'],
  ['Cameras', '/spare-parts/cameras'],
  ['Electronic boards', '/spare-parts/electronic-boards'],
] as const

const tiles = [
  { code: 'F1', t: 'Feeders', d: 'Tape, electric, pneumatic, tray, stick.', href: '/spare-parts/feeders/tape-feeders', brief: 'Feeder row, macro' },
  { code: 'F2', t: 'Nozzles', d: 'Pick and place nozzles by machine and component.', href: '/spare-parts/nozzles', brief: 'Nozzles, macro' },
  { code: 'F3', t: 'Machine parts', d: 'Motors, belts, sensors, valves, boards, cables.', href: '/spare-parts', brief: 'Motors, sensors and boards' },
]

export async function PartsSection() {
  const { brands, models } = await getBrandsAndModels()
  return (
    <Section tone="dark" id="parts" labelledBy="parts-h">
      <SectionHead eyebrow="Feeders and spare parts" id="parts-h" title="Find the right part for the right machine." intro="Search by part number, or narrow by brand and machine model. Compatibility is shown only where it has been verified." />
      <PartsSearch brands={brands} models={models} />
      <div className="mt-6 flex flex-wrap gap-2.5">
        {chips.map(([l, h]) => <Link key={h} href={h} className="rounded-full border border-white/25 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10">{l}</Link>)}
        <Link href="/request-a-quote?need=part" className="rounded-full border border-accent-on-dark/60 px-4 py-2 text-sm font-semibold text-accent-on-dark transition-colors hover:bg-accent-on-dark/10">Can&apos;t find it? Send us the part →</Link>
      </div>
      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.code} className="reveal">
            <Link href={t.href} className="group block overflow-hidden rounded-card bg-dark-700 transition duration-200 motion-safe:hover:-translate-y-1">
              <MediaSlot code={t.code} brief={t.brief} sizes="(min-width: 768px) 380px, 100vw" className="aspect-[16/9] bg-dark-800" imgClassName="transition-transform duration-500 motion-safe:group-hover:scale-[1.03]" />
              <div className="p-5"><h3 className="text-[1.1875rem] font-bold text-white">{t.t}</h3><p className="mt-1 text-sm text-on-dark">{t.d}</p></div>
            </Link>
          </li>
        ))}
      </ul>
      <ul className="mt-14 grid gap-8 border-t border-white/10 pt-10 md:grid-cols-3">
        {[
          ['Part origin, stated', 'Every listing says whether a part is genuine OEM, OEM surplus or compatible aftermarket.'],
          ['Verified compatibility', 'Machine-model fit appears only when it has been confirmed, never implied.'],
          ['Quote by part number', 'Add a part to your enquiry in one click, pre-filled.'],
        ].map(([t, d]) => <li key={t}><h3 className="text-lg font-bold">{t}</h3><p className="mt-1.5 text-on-dark">{d}</p></li>)}
      </ul>
    </Section>
  )
}
