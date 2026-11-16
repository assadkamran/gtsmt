import Link from 'next/link'
import { getFeaturedArticle } from '@/lib/cms'
import { MediaSlot } from '../MediaSlot'
import { Button } from '../Button'
import { Section, SectionHead } from '../Section'
import Image from 'next/image'

const list = [
  ['SMT Feeder Types Explained', '/resources/smt-feeder-types-explained'],
  ['AOI vs SPI Inspection', '/resources/aoi-vs-spi-inspection'],
  ['How to Establish a PCB Assembly Factory', '/resources/how-to-establish-a-pcb-assembly-factory'],
  ['SMT Spare Parts Compatibility Guide', '/resources/smt-spare-parts-compatibility-guide'],
]

export async function Resources() {
  const a = await getFeaturedArticle()
  const img = a?.image && typeof a.image === 'object' ? a.image : null
  const href = a ? `/resources/${a.slug}` : '/resources/complete-guide-to-smt-production-lines'
  return (
    <Section tone="surface" id="resources" labelledBy="resources-h">
      <SectionHead eyebrow="Technical resources" id="resources-h" title="SMT knowledge centre">
        <Button href="/resources" variant="outline" size="sm">All resources</Button>
      </SectionHead>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
        <Link href={href} className="group overflow-hidden rounded-card border border-line bg-white transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(11,17,36,0.12)]">
          {img?.url ? (
            <div className="relative aspect-[16/8]"><Image src={img.url} alt={img.alt ?? ''} fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" /></div>
          ) : (
            <MediaSlot code="R1" brief="Editorial: circuit board close-up" sizes="(min-width: 1024px) 640px, 100vw" className="aspect-[16/8]" />
          )}
          <div className="p-6 sm:p-7">
            <span className="eyebrow !mb-2">Guide</span>
            <h3 className="text-[1.5rem] font-bold text-dark-900 transition-colors group-hover:text-accent-text">{a?.title ?? 'Complete Guide to SMT Production Lines'}</h3>
            {a?.excerpt && <p className="mt-2 text-muted">{a.excerpt}</p>}
          </div>
        </Link>
        <ul className="border-t border-line">
          {list.map(([l, h]) => (
            <li key={h} className="border-b border-line">
              <Link href={h} className="group flex items-center justify-between gap-4 py-5 font-heading text-xl font-bold text-dark-900 transition-colors hover:text-accent-text">
                {l}<span aria-hidden className="text-accent-text transition-transform motion-safe:group-hover:translate-x-1">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
