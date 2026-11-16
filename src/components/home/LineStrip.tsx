import Link from 'next/link'

const stations = [
  { label: 'Loader', href: '/smt-equipment/pcb-loaders' },
  { label: 'Printer', href: '/smt-equipment/solder-paste-printers' },
  { label: 'SPI', href: '/smt-equipment/spi-solder-paste-inspection' },
  { label: 'Pick & Place', href: '/smt-equipment/pick-and-place-machines', key: true },
  { label: 'Reflow', href: '/smt-equipment/reflow-soldering-ovens' },
  { label: 'AOI', href: '/smt-equipment/aoi-automated-optical-inspection' },
  { label: 'Unloader', href: '/smt-equipment/pcb-unloaders' },
]

export function LineStrip() {
  return (
    <nav aria-label="Typical SMT production line" className="rounded-card border border-line bg-white px-5 py-5 shadow-[0_18px_40px_-18px_rgba(11,17,36,0.35)] lg:flex lg:items-center lg:gap-7 lg:px-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted lg:mb-0 lg:w-36 lg:shrink-0">Typical SMT line</p>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2 lg:flex-1 lg:flex-nowrap lg:justify-between lg:gap-x-0">
        {stations.map((s, i) => (
          <li key={s.label} className="flex items-center lg:flex-1 lg:last:flex-none">
            <Link
              href={s.href}
              className={`rounded-[5px] px-2.5 py-1.5 font-heading text-[0.9375rem] font-bold transition-colors ${s.key ? 'bg-accent text-on-accent hover:bg-accent-hover' : 'text-dark-900 hover:text-accent-text'}`}
            >
              <span className="mr-1.5 text-[0.6875rem] font-semibold text-muted lg:hidden">{String(i + 1).padStart(2, '0')}</span>
              {s.label}
            </Link>
            {i < stations.length - 1 && <span aria-hidden className="mx-2 hidden h-0.5 flex-1 bg-accent/60 lg:block" />}
          </li>
        ))}
      </ol>
    </nav>
  )
}
