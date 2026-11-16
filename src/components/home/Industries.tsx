import Link from 'next/link'
import { MediaSlot } from '../MediaSlot'
import { Section, SectionHead } from '../Section'
import { industryLinks } from '@/lib/nav'

const briefs = ['Automotive electronics board', 'Consumer devices', 'LED modules', 'Medical device electronics', 'Industrial controls', 'Power electronics', 'Telecom equipment', 'EMS production floor']

export function Industries() {
  return (
    <Section tone="surface" id="industries" labelledBy="industries-h">
      <SectionHead eyebrow="Industries served" id="industries-h" title="Built around how your industry builds boards." />
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {industryLinks.map((l, i) => (
          <li key={l.href} className="reveal">
            <Link href={l.href} className="group block overflow-hidden rounded-card border border-line bg-white transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(11,17,36,0.12)]">
              <MediaSlot code={`I${i + 1}`} brief={briefs[i]} sizes="(min-width: 1024px) 300px, 50vw" className="aspect-[16/10]" imgClassName="transition-transform duration-500 motion-safe:group-hover:scale-[1.03]" />
              <div className="flex items-center justify-between gap-2 bg-dark-900 px-4 py-3.5">
                <span className="font-heading text-[0.9375rem] font-bold leading-tight text-white sm:text-base">{l.label}</span>
                <span aria-hidden className="text-accent-on-dark transition-transform motion-safe:group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
