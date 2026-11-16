import Link from 'next/link'
import type { Category } from '@/payload-types'

const STATIONS: { key: NonNullable<Category['lineStation']>; label: string; slug: string }[] = [
  { key: 'loader', label: 'Loader', slug: 'pcb-loaders' },
  { key: 'printer', label: 'Printer', slug: 'solder-paste-printers' },
  { key: 'spi', label: 'SPI', slug: 'spi-solder-paste-inspection' },
  { key: 'placer', label: 'Pick & Place', slug: 'pick-and-place-machines' },
  { key: 'reflow', label: 'Reflow', slug: 'reflow-soldering-ovens' },
  { key: 'aoi', label: 'AOI', slug: 'aoi-automated-optical-inspection' },
  { key: 'unloader', label: 'Unloader', slug: 'pcb-unloaders' },
]

/** Position of a piece of equipment in a typical SMT line. */
export function LineStripStatic({ active }: { active: NonNullable<Category['lineStation']> }) {
  return (
    <nav aria-label="Position in a typical SMT line" className="rounded-card border border-line bg-white px-5 py-5">
      <ol className="flex flex-wrap items-center gap-y-2">
        {STATIONS.map((s, i) => (
          <li key={s.key} className="flex items-center">
            <Link
              href={`/smt-equipment/${s.slug}`}
              aria-current={s.key === active ? 'step' : undefined}
              className={`whitespace-nowrap rounded-[5px] px-2.5 py-1.5 font-heading text-[0.9375rem] font-bold transition-colors ${s.key === active ? 'bg-accent text-on-accent' : 'text-dark-900 hover:text-accent-text'}`}
            >
              {s.label}
            </Link>
            {i < STATIONS.length - 1 && <span aria-hidden className="mx-1 h-0.5 w-3 shrink-0 bg-accent/50" />}
          </li>
        ))}
      </ol>
    </nav>
  )
}
