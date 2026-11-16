import Link from 'next/link'
import { MediaSlot } from '../MediaSlot'
import { Section } from '../Section'

const items = [
  ['Magazine loaders and unloaders', '/smt-peripherals/magazine-loaders'],
  ['PCB conveyors', '/smt-peripherals/pcb-conveyors'],
  ['NG/OK buffer systems', '/smt-peripherals/ng-ok-buffer-systems'],
  ['ESD and line accessories', '/smt-peripherals/esd-equipment'],
]

export function Peripherals() {
  return (
    <Section id="peripherals" labelledBy="peripherals-h">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <MediaSlot code="P1" brief="Loader and conveyor in a clean line, natural light" sizes="(min-width: 1024px) 600px, 100vw" className="aspect-[4/3.4] rounded-card" />
        <div>
          <span className="eyebrow">SMT peripherals</span>
          <h2 id="peripherals-h" className="mb-8 text-[clamp(1.75rem,3.4vw,2.625rem)] font-bold">The equipment that keeps a line moving.</h2>
          <ul className="border-t border-line">
            {items.map(([l, h]) => (
              <li key={h} className="border-b border-line">
                <Link href={h} className="group flex items-center justify-between gap-4 py-4 font-heading text-[1.1875rem] font-bold text-dark-900 transition-colors hover:text-accent-text">
                  {l}<span aria-hidden className="text-accent-text transition-transform motion-safe:group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/smt-peripherals" className="mt-6 inline-block font-semibold text-accent-text hover:text-dark-900">View all peripherals →</Link>
        </div>
      </div>
    </Section>
  )
}
