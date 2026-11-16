import Link from 'next/link'
import { getSettings } from '@/lib/cms'
import { Logo } from './Logo'
import { solutionLinks, equipmentGroups, partsGroups } from '@/lib/nav'

const col = 'mb-3 text-sm font-bold uppercase tracking-[0.1em] text-white'
const lnkBase = 'block py-1 text-[0.9375rem] transition-colors'
const lnk = `${lnkBase} text-on-dark-muted hover:text-accent-on-dark`
const lnkAccent = `${lnkBase} text-accent-on-dark hover:text-white`

export async function SiteFooter() {
  const s = await getSettings()
  const year = new Date().getFullYear()
  return (
    <footer className="on-dark bg-dark-950 text-on-dark-muted">
      <div className="mx-auto max-w-page px-6 pb-8 pt-16 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <address className="mt-4 space-y-1 text-[0.9375rem] not-italic">
              {s?.legalName && <p className="font-semibold text-white">{s.legalName}</p>}
              {s?.address && <p className="whitespace-pre-line">{s.address}</p>}
              {s?.email && <p><a className="hover:text-accent-on-dark" href={`mailto:${s.email}`}>{s.email}</a></p>}
              {s?.phone && <p><a className="hover:text-accent-on-dark" href={`tel:${s.phone.replace(/\s+/g, '')}`}>{s.phone}</a></p>}
              {!s?.legalName && !s?.address && !s?.email && !s?.phone && <p>Contact details are being added.</p>}
            </address>
          </div>
          <nav aria-label="Solutions">
            <p className={col}>Solutions</p>
            {solutionLinks.slice(0, 5).map((l) => <Link key={l.href} href={l.href} className={lnk}>{l.label.replace(' SMT Production Lines', ' Lines').replace('SMT ', '')}</Link>)}
          </nav>
          <nav aria-label="Equipment">
            <p className={col}>Equipment</p>
            {equipmentGroups.flatMap((g) => g.links).slice(0, 5).map((l) => <Link key={l.href} href={l.href} className={lnk}>{l.label}</Link>)}
            <Link href="/smt-equipment" className={lnkAccent}>All equipment</Link>
          </nav>
          <nav aria-label="Spare parts">
            <p className={col}>Parts</p>
            {partsGroups[0].links.slice(0, 3).map((l) => <Link key={l.href} href={l.href} className={lnk}>{l.label}</Link>)}
            <Link href="/spare-parts/nozzles" className={lnk}>Nozzles</Link>
            <Link href="/spare-parts" className={lnkAccent}>All spare parts</Link>
          </nav>
          <nav aria-label="Company">
            <p className={col}>Company</p>
            <Link href="/about-us" className={lnk}>About Us</Link>
            <Link href="/industries" className={lnk}>Industries</Link>
            <Link href="/resources" className={lnk}>Resources</Link>
            <Link href="/contact" className={lnk}>Contact</Link>
            <Link href="/request-a-quote" className={lnkAccent}>Request a Quote</Link>
          </nav>
        </div>
        <div className="mt-12 flex flex-wrap items-start justify-between gap-4 border-t border-dark-600/60 pt-6 text-[0.8125rem]">
          <p>© {year} GTSMT. All rights reserved.</p>
          <p className="max-w-xl">Third-party brand names are used only to identify compatibility. GTSMT is not affiliated with those companies unless stated.</p>
          <p className="flex gap-4"><Link href="/privacy-policy" className="hover:text-accent-on-dark">Privacy</Link><Link href="/terms" className="hover:text-accent-on-dark">Terms</Link></p>
        </div>
      </div>
    </footer>
  )
}
