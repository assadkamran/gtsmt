import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MediaSlot } from '../MediaSlot'
import { Section, SectionHead } from '../Section'

const items = [
  { code: 'D1', title: 'SMT Production Lines', text: 'Complete, turnkey, LED, high-speed and flexible line configurations.', href: '/smt-solutions', cta: 'Explore solutions', brief: 'An SMT line in operation, wide' },
  { code: 'D2', title: 'SMT Equipment', text: 'Pick and place, printers, reflow ovens, inspection, loaders and more.', href: '/smt-equipment', cta: 'Browse equipment', brief: 'Pick and place head, close detail' },
  { code: 'D3', title: 'Feeders', text: 'Tape, electric, pneumatic, tray and stick feeders, carts and accessories.', href: '/spare-parts/feeders/tape-feeders', cta: 'Browse feeders', brief: 'Row of tape feeders, macro' },
  { code: 'D4', title: 'Spare Parts', text: 'Nozzles, motors, belts, sensors, valves, cameras, boards and cables.', href: '/spare-parts', cta: 'Find parts', brief: 'Nozzles and small parts, flat lay' },
  { code: 'D5', title: 'SMT Peripherals', text: 'Magazine loaders and unloaders, conveyors, NG/OK buffers, ESD equipment.', href: '/smt-peripherals', cta: 'View peripherals', brief: 'Loader and conveyor in a clean line' },
  { code: 'D6', title: 'Factory Setup', text: 'Layout, equipment selection and customised production solutions.', href: '/smt-solutions/smt-factory-setup', cta: 'Plan a factory', brief: 'SMT factory floor, wide' },
]

export function Divisions() {
  return (
    <Section id="divisions" labelledBy="divisions-h" className="pt-24 md:pt-32">
      <SectionHead eyebrow="What we supply" id="divisions-h" title="Six divisions, one point of contact." />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((d) => (
          <li key={d.code} className="reveal">
            <Link href={d.href} className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(11,17,36,0.12)]">
              <MediaSlot code={d.code} brief={d.brief} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="aspect-[16/10]" imgClassName="transition-transform duration-500 motion-safe:group-hover:scale-[1.03]" />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold text-dark-900">{d.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-muted">{d.text}</p>
                <span className="mt-auto flex items-center gap-1.5 pt-4 text-[0.9375rem] font-semibold text-accent-text">{d.cta}<ArrowRight aria-hidden className="size-4 transition-transform motion-safe:group-hover:translate-x-1" /></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
