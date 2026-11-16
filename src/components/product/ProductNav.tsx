'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function ProductNav({ sections, title, rfqHref }: { sections: { id: string; label: string }[]; title: string; rfqHref: string }) {
  const [active, setActive] = useState(sections[0]?.id)
  const [showCta, setShowCta] = useState(false)

  useEffect(() => {
    // The active section is the last one whose top has scrolled above the reading line
    // (site header 72px + this bar 56px + breathing room).
    const READING_LINE = 190
    const update = () => {
      let current = sections[0]?.id
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= READING_LINE) current = s.id
      }
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    const cta = document.getElementById('product-cta')
    const io = cta ? new IntersectionObserver(([e]) => setShowCta(!e.isIntersecting && e.boundingClientRect.top < 0), { rootMargin: '-80px 0px 0px 0px' }) : null
    if (cta) io?.observe(cta)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      io?.disconnect()
    }
  }, [sections])

  return (
    <div className="sticky top-[4.5rem] z-40 border-y border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-page items-center gap-6 px-6 lg:px-10">
        <nav aria-label="On this page" className="min-w-0 flex-1 overflow-x-auto">
          <ul className="flex min-w-max gap-6 text-[0.9375rem] font-semibold">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? 'location' : undefined}
                  className={`block py-[1.0625rem] transition-colors ${active === s.id ? 'text-accent-text shadow-[inset_0_-3px_0_var(--color-accent)]' : 'text-ink hover:text-accent-text'}`}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={`hidden shrink-0 items-center gap-4 md:flex ${showCta ? '' : 'invisible'}`}>
          <span className="max-w-[16rem] truncate text-sm text-muted">{title}</span>
          <Link href={rfqHref} className="inline-flex h-10 items-center rounded-control bg-accent px-[1.125rem] text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover">
            Request a quote
          </Link>
        </div>
      </div>
    </div>
  )
}
