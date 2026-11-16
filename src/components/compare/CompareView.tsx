'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Download, EyeOff } from 'lucide-react'
import { clearCompare, removeItem } from '@/lib/compare/store'
import { identicalRows, type CmpRow, type CmpSection } from '@/lib/compare/build'
import { rfqHref, type Need } from '@/lib/rfq'
import { ImagePlaceholder } from '../ImagePlaceholder'
import { Button } from '../Button'

export type CompareProduct = { id: number; title: string; href: string; image: { url: string; alt: string } | null; partNumber: string | null; originLabel: string | null }

const MAX = 4
/** Height of the sticky site header. The slim bar sits just below it. */
const SITE_HEADER = 72
const LABEL_COL = '15rem'

/** The comparison table. Rows that differ are tinted; "differences only" hides the identical ones. */
export function CompareView({ category, need, products, rows }: { category: { id: number; name: string; href: string }; need: Need; products: CompareProduct[]; rows: CmpRow[] }) {
  const router = useRouter()
  const hiddenWhenOn = identicalRows(rows)
  const canFilter = hiddenWhenOn.length > 0 && hiddenWhenOn.length < rows.length
  const [diffOnly, setDiffOnly] = useState(canFilter)
  const headRef = useRef<HTMLTableSectionElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const [stuck, setStuck] = useState(false)

  // Once the product headers scroll out of view, a slim bar with just the names keeps the columns identifiable.
  useEffect(() => {
    const head = headRef.current
    const table = tableRef.current
    if (!head || !table) return
    let headVisible = true
    let tableVisible = true
    const update = () => setStuck(!headVisible && tableVisible)
    const a = new IntersectionObserver(([e]) => { headVisible = e.isIntersecting; update() }, { rootMargin: `-${SITE_HEADER}px 0px 0px 0px` })
    const b = new IntersectionObserver(([e]) => { tableVisible = e.isIntersecting; update() }, { rootMargin: `-${SITE_HEADER + 56}px 0px 0px 0px` })
    a.observe(head)
    b.observe(table)
    return () => { a.disconnect(); b.disconnect() }
  }, [])
  const showDiffOnly = canFilter && diffOnly
  const shown = showDiffOnly ? rows.filter((r) => r.differs || r.alwaysShow) : rows
  const n = products.length

  const remove = (id: number) => {
    removeItem(id)
    const rest = products.filter((p) => p.id !== id).map((p) => p.id)
    router.replace(rest.length ? `/compare?items=${rest.join(',')}` : category.href)
  }
  const clear = () => {
    clearCompare()
    router.push(category.href)
  }

  const sections: CmpSection[] = []
  for (const r of shown) if (!sections.includes(r.section)) sections.push(r.section)

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        <label className={`flex items-center gap-3 text-base font-semibold ${canFilter ? 'cursor-pointer text-ink' : 'cursor-not-allowed text-muted'}`}>
          <input type="checkbox" role="switch" checked={showDiffOnly} disabled={!canFilter} onChange={(e) => setDiffOnly(e.target.checked)} className="peer sr-only" />
          <span aria-hidden className="relative inline-block h-[1.625rem] w-[2.875rem] rounded-full bg-[#7c88a8] transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text peer-disabled:bg-line">
            <span className="absolute left-[3px] top-[3px] size-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none" style={{ transform: showDiffOnly ? 'translateX(1.25rem)' : undefined }} />
          </span>
          Show differences only
        </label>
        {n < MAX && <Link href={category.href} className="text-[0.9375rem] font-semibold text-accent-text hover:underline">Add another</Link>}
        <button type="button" onClick={clear} className="text-[0.9375rem] font-semibold text-muted hover:text-dark-900 hover:underline">Clear all</button>
      </div>

      {stuck && (
        <div aria-hidden inert className="fixed inset-x-0 z-30 hidden border-b border-line bg-white shadow-[0_6px_16px_rgba(11,17,36,0.08)] lg:block" style={{ top: SITE_HEADER }}>
          <div className="mx-auto max-w-page px-10">
            <div className="grid items-center" style={{ gridTemplateColumns: `${LABEL_COL} repeat(${n}, minmax(0, 1fr))` }}>
              <div />
              {products.map((p) => (
                <div key={p.id} className="flex min-w-0 items-center gap-3 border-l border-line px-4 py-2.5">
                  <div className="relative h-9 w-12 shrink-0 overflow-hidden rounded bg-surface">
                    {p.image && <Image src={p.image.url} alt="" fill sizes="48px" className="object-contain p-0.5" />}
                  </div>
                  <span className="min-w-0 truncate font-heading text-sm font-bold text-dark-900">{p.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="mb-3 text-sm text-muted lg:hidden">Scroll sideways to see every product.</p>
      <div className="overflow-x-auto rounded-card border border-line lg:overflow-visible">
        <table ref={tableRef} className="w-full table-fixed border-collapse text-left min-w-[var(--min)] lg:min-w-0" style={{ ['--min' as string]: `${8 + n * 13}rem` }}>
          <caption className="sr-only">Comparison of {n} products from {category.name}. Rows with different values are marked.</caption>
          <thead ref={headRef}>
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-28 border-b border-line bg-white p-4 align-bottom text-sm font-normal text-muted sm:w-36 lg:static lg:w-60"><span className="sr-only">Specification</span></th>
              {products.map((p, i) => (
                <th key={p.id} scope="col" className="border-b border-l border-line bg-white p-4 align-top font-normal">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface">
                    {p.image ? <Image src={p.image.url} alt={p.image.alt} fill priority={i < 2} sizes="(min-width: 1024px) 220px, 200px" className="object-contain p-3" /> : <ImagePlaceholder tone="light" brief="Product photo" className="h-full" />}
                  </div>
                  {p.originLabel && <span className="mt-3 inline-block rounded-full bg-accent-tint px-2.5 py-1 text-xs font-semibold text-accent-text">{p.originLabel}</span>}
                  <p className="mt-2 font-heading text-[1.0625rem] font-bold leading-snug text-dark-900 lg:text-[1.1875rem]">
                    <Link href={p.href} className="hover:text-accent-text">{p.title}</Link>
                  </p>
                  {p.partNumber && <p className="mt-0.5 text-sm text-muted">Part no. {p.partNumber}</p>}
                  <Button href={rfqHref({ need, product: p.id, part: p.partNumber ?? undefined, topic: p.title })} size="sm" className="mt-3 w-full">Request a quote</Button>
                  <button type="button" onClick={() => remove(p.id)} className="mt-2 block w-full min-h-10 text-center text-sm font-semibold text-muted hover:text-dark-900 hover:underline">
                    Remove<span className="sr-only"> {p.title}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <Fragment key={section}>
                <tr>
                  <th colSpan={n + 1} scope="colgroup" className="border-b border-line bg-surface px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-muted">{section}</th>
                </tr>
                {shown.filter((r) => r.section === section).map((r) => (
                  <tr key={r.id} className={r.differs ? 'bg-[#f3f6ff]' : undefined}>
                    <th scope="row" className={`sticky left-0 z-10 border-b border-line px-4 py-3.5 text-[0.9375rem] font-semibold text-dark-900 lg:static ${r.differs ? 'bg-[#f3f6ff] shadow-[inset_3px_0_0_var(--color-accent)]' : 'bg-white'}`}>
                      {r.label}
                      {r.differs && <span className="sr-only"> (differs between these products)</span>}
                    </th>
                    {r.cells.map((c, i) => (
                      <td key={products[i].id} className="border-b border-l border-line px-4 py-3.5 align-top text-[0.9375rem] text-ink">
                        {c.link ? (
                          <a href={c.link.href} className="inline-flex items-center gap-1.5 font-semibold text-accent-text hover:underline"><Download aria-hidden className="size-4" />{c.link.label} (PDF)</a>
                        ) : c.tags ? (
                          c.tags.length ? (
                            <ul className="flex flex-wrap gap-1.5">{c.tags.map((t) => <li key={t} className="rounded-full bg-accent-tint px-2.5 py-1 text-xs font-semibold text-accent-text">{t}</li>)}</ul>
                          ) : (
                            <span className="text-muted">None verified yet</span>
                          )
                        ) : c.text ? (
                          c.text
                        ) : (
                          <span className="text-muted"><span aria-hidden>&ndash;</span><span className="sr-only">Not listed</span></span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
            {showDiffOnly && hiddenWhenOn.length > 0 && (
              <tr>
                <td colSpan={n + 1} className="px-4 py-3 text-sm text-muted">
                  <span className="inline-flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-2"><EyeOff aria-hidden className="size-4" />{hiddenWhenOn.length} {hiddenWhenOn.length === 1 ? 'row with identical values is' : 'rows with identical values are'} hidden</span>
                    <button type="button" onClick={() => setDiffOnly(false)} className="font-semibold text-accent-text hover:underline">Show all rows</button>
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!canFilter && rows.length > 0 && hiddenWhenOn.length === rows.length && <p className="mt-3 text-sm text-muted">These products have identical listed values.</p>}
    </>
  )
}
