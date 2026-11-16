'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, Menu, Search, X } from 'lucide-react'
import { Logo } from './Logo'
import { Button } from './Button'
import { openSearch } from './search/openSearch'
import { equipmentGroups, partsGroups, solutionLinks, type NavGroup, type NavLink } from '@/lib/nav'

type MegaId = 'solutions' | 'equipment' | 'parts'

const simple: NavLink[] = [
  { label: 'Peripherals', href: '/smt-peripherals' },
  { label: 'Industries', href: '/industries' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/about-us' },
]

const linkCls = 'block py-1.5 text-[0.9375rem] text-ink transition-colors hover:text-accent-text'

function GroupCol({ g }: { g: NavGroup }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">{g.title}</p>
      <ul>
        {g.links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={linkCls}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Feature({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="on-dark rounded-card bg-dark-900 p-5 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-on-dark">{title}</p>
      <p className="mt-2 text-sm text-on-dark">{text}</p>
      <Link href={href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-on-dark hover:text-white">
        {cta} <ArrowRight aria-hidden className="size-4" />
      </Link>
    </div>
  )
}

export function HeaderNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState<MegaId | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [mobileSection, setMobileSection] = useState<MegaId | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({})
  const uid = useId()

  const close = useCallback((returnFocus = false) => {
    setOpen((cur) => {
      if (cur && returnFocus) triggers.current[cur]?.focus()
      return null
    })
  }, [])

  useEffect(() => { setOpen(null); setDrawer(false) }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(true); setDrawer(false) }
    }
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [close])

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawer])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const trigger = (id: MegaId, label: string, base: string) => (
    <button
      type="button"
      ref={(el) => { triggers.current[id] = el }}
      aria-expanded={open === id}
      aria-controls={`${uid}-${id}`}
      onClick={() => setOpen(open === id ? null : id)}
      className={`flex items-center gap-1 whitespace-nowrap px-2 py-[1.625rem] 2xl:px-2.5 text-[0.78125rem] font-semibold uppercase tracking-[0.04em] transition-colors ${open === id || isActive(base) ? 'text-accent-text shadow-[inset_0_-3px_0_var(--color-accent)]' : 'text-dark-900 hover:text-accent-text'}`}
    >
      {label}
      <ChevronDown aria-hidden className={`size-3.5 transition-transform motion-reduce:transition-none ${open === id ? 'rotate-180' : ''}`} />
    </button>
  )

  return (
    <div ref={headerRef} className="relative">
      <div className="mx-auto flex h-[4.5rem] max-w-page items-center gap-3 px-5 sm:gap-6 sm:px-6 lg:px-10 xl:gap-4 2xl:gap-6">
        <Logo />
        <nav aria-label="Primary" className="ml-1 hidden flex-1 items-center xl:flex 2xl:ml-2">
          <Link href="/" className={`whitespace-nowrap px-2 py-[1.625rem] 2xl:px-2.5 text-[0.78125rem] font-semibold uppercase tracking-[0.04em] ${pathname === '/' ? 'text-accent-text shadow-[inset_0_-3px_0_var(--color-accent)]' : 'text-dark-900 hover:text-accent-text'}`}>Home</Link>
          {trigger('solutions', 'SMT Solutions', '/smt-solutions')}
          {trigger('equipment', 'SMT Equipment', '/smt-equipment')}
          {trigger('parts', 'Spare Parts', '/spare-parts')}
          {simple.map((l) => (
            <Link key={l.href} href={l.href} className={`whitespace-nowrap px-2 py-[1.625rem] 2xl:px-2.5 text-[0.78125rem] font-semibold uppercase tracking-[0.04em] ${isActive(l.href) ? 'text-accent-text shadow-[inset_0_-3px_0_var(--color-accent)]' : 'text-dark-900 hover:text-accent-text'}`}>{l.label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <button type="button" aria-label="Search" onClick={openSearch} className="flex size-11 items-center justify-center rounded-control text-dark-900 hover:bg-surface">
            <Search aria-hidden className="size-5" />
          </button>
          <Button href="/request-a-quote" size="sm" className="px-4 sm:px-5" aria-label="Request a Quote"><span aria-hidden className="sm:hidden">Quote</span><span aria-hidden className="hidden sm:inline">Request a Quote</span></Button>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-control border border-line text-dark-900 xl:hidden"
            aria-label="Open menu"
            aria-expanded={drawer}
            aria-controls={`${uid}-drawer`}
            onClick={() => setDrawer(true)}
          >
            <Menu aria-hidden className="size-5" />
          </button>
        </div>
      </div>

      {/* Desktop mega panels */}
      <div id={`${uid}-solutions`} hidden={open !== 'solutions'} className="absolute inset-x-0 top-full hidden border-t border-line bg-white shadow-[0_24px_48px_rgba(11,17,36,0.14)] data-[open=true]:block lg:data-[open=true]:block" data-open={open === 'solutions'}>
        <div className="mx-auto grid max-w-page grid-cols-[1fr_1fr_18rem] gap-10 px-10 py-8">
          <ul className="col-span-2 grid grid-cols-2 gap-x-8 gap-y-1">
            {solutionLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded-control p-3 hover:bg-surface">
                  <span className="block font-heading text-[0.9375rem] font-bold text-dark-900">{l.label}</span>
                  <span className="block text-sm text-muted">{l.description}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Feature title="Plan your line" text="Tell us capacity, board size and sides. We turn it into a structured enquiry for our team." href="/request-a-quote?need=line" cta="Start the line enquiry" />
        </div>
      </div>
      <div id={`${uid}-equipment`} hidden={open !== 'equipment'} className="absolute inset-x-0 top-full hidden border-t border-line bg-white shadow-[0_24px_48px_rgba(11,17,36,0.14)] data-[open=true]:block" data-open={open === 'equipment'}>
        <div className="mx-auto grid max-w-page grid-cols-[1fr_1fr_1fr_1.3fr_16rem] gap-8 px-10 py-8">
          {equipmentGroups.map((g) => <GroupCol key={g.title} g={g} />)}
          <Feature title="Compare" text="Select up to four products from one category and compare their listed specifications side by side." href="/compare" cta="Open comparison" />
        </div>
        <div className="border-t border-line bg-surface">
          <div className="mx-auto flex max-w-page items-center justify-between px-10 py-3 text-sm text-muted">
            <span>Listed in production-line order, from paste printing to unloading.</span>
            <Link href="/smt-equipment" className="font-semibold text-accent-text hover:text-dark-900">View all equipment →</Link>
          </div>
        </div>
      </div>
      <div id={`${uid}-parts`} hidden={open !== 'parts'} className="absolute inset-x-0 top-full hidden border-t border-line bg-white shadow-[0_24px_48px_rgba(11,17,36,0.14)] data-[open=true]:block" data-open={open === 'parts'}>
        <div className="mx-auto grid max-w-page grid-cols-[1.1fr_1fr_1fr_18rem] gap-8 px-10 py-8">
          {partsGroups.map((g) => <GroupCol key={g.title} g={g} />)}
          <div>
            <Feature title="Find a part" text="Search by part number, brand or machine model. Compatibility is shown only when verified." href="/spare-parts" cta="Open parts search" />
            <Link href="/request-a-quote?need=part" className="mt-3 block text-sm font-semibold text-accent-text hover:text-dark-900">Can&apos;t find it? Send us the part →</Link>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div id={`${uid}-drawer`} role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[60] flex flex-col bg-white xl:hidden">
          <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-line px-6">
            <Logo />
            <button type="button" aria-label="Close menu" className="flex size-11 items-center justify-center rounded-control border border-line" onClick={() => setDrawer(false)}>
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <button type="button" onClick={() => { setDrawer(false); setTimeout(openSearch, 60) }} className="mt-4 flex h-12 w-full items-center gap-2.5 rounded-control border border-line px-4 text-left text-muted">
              <Search aria-hidden className="size-4" /> Search parts or part number
            </button>
            <ul className="mt-2 font-heading text-lg font-bold text-dark-900">
              {([['solutions', 'SMT Solutions', solutionLinks.map((l) => l)], ['equipment', 'SMT Equipment', equipmentGroups.flatMap((g) => g.links)], ['parts', 'Spare Parts', partsGroups.flatMap((g) => g.links)]] as const).map(([id, label, links]) => (
                <li key={id} className="border-b border-line">
                  <button type="button" className="flex w-full items-center justify-between py-4 text-left" aria-expanded={mobileSection === id} onClick={() => setMobileSection(mobileSection === id ? null : id)}>
                    {label}
                    <ChevronDown aria-hidden className={`size-5 text-accent-text transition-transform motion-reduce:transition-none ${mobileSection === id ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileSection === id && (
                    <ul className="mb-3 space-y-0.5 font-sans text-base font-normal">
                      <li><Link href={`/${id === 'solutions' ? 'smt-solutions' : id === 'equipment' ? 'smt-equipment' : 'spare-parts'}`} className="block py-2 font-semibold text-accent-text">View all</Link></li>
                      {links.map((l) => <li key={l.href}><Link href={l.href} className="block py-2 text-ink">{l.label}</Link></li>)}
                    </ul>
                  )}
                </li>
              ))}
              {[...simple, { label: 'Contact', href: '/contact' }].map((l) => (
                <li key={l.href} className="border-b border-line"><Link href={l.href} className="block py-4">{l.label === 'Peripherals' ? 'SMT Peripherals' : l.label === 'About' ? 'About Us' : l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="shrink-0 border-t border-line p-6">
            <Button href="/request-a-quote" size="lg" className="w-full">Request a Quote</Button>
          </div>
        </div>
      )}
    </div>
  )
}
