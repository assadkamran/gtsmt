import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { JsonLd } from './JsonLd'
import { abs } from '@/lib/seo'

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items, tone = 'light', className = '' }: { items: Crumb[]; tone?: 'light' | 'dark'; className?: string }) {
  const all: Crumb[] = [{ label: 'Home', href: '/' }, ...items]
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, ...(c.href ? { item: abs(c.href) } : {}) })),
  }
  const dark = tone === 'dark'
  return (
    <>
      <JsonLd data={ld} />
      <nav aria-label="Breadcrumb" className={`text-sm ${dark ? 'text-on-dark-muted' : 'text-muted'} ${className}`}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((c, i) => {
            const last = i === all.length - 1
            return (
              <li key={`${c.label}-${i}`} className="flex items-center gap-2">
                {i > 0 && <ChevronRight aria-hidden className="size-3.5 opacity-60" />}
                {last || !c.href ? (
                  <span aria-current={last ? 'page' : undefined} className={last ? (dark ? 'text-white' : 'text-ink') : ''}>{c.label}</span>
                ) : (
                  <Link href={c.href} className={dark ? 'hover:text-white' : 'hover:text-accent-text'}>{c.label}</Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
