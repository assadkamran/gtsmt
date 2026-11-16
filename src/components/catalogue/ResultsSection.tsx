'use client'

import { useId } from 'react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { originOf } from '@/lib/origin'
import { SORTS } from '@/lib/browse/types'
import { Button } from '../Button'
import { CompareToggle } from '../compare/CompareToggle'
import { useBrowse } from './BrowseProvider'
import { AppliedChips, FilterSheet } from './FilterPanel'
import { Pagination } from './Pagination'
import { ProductCardView } from './ProductCardView'

function SortSelect() {
  const c = useBrowse()
  const id = useId()
  const options = SORTS.filter((s) => s.value !== 'part' || c.defs.hasPartNumbers)
  return (
    <div className="flex flex-1 items-center gap-2.5 lg:flex-none">
      <label htmlFor={id} className="sr-only lg:not-sr-only lg:text-[0.9375rem] lg:text-muted">Sort by</label>
      <div className="relative flex-1 lg:flex-none">
        <select
          id={id}
          value={c.state.sort}
          onChange={(e) => c.setSort(e.target.value as typeof c.state.sort)}
          className="h-11 w-full appearance-none rounded-control border border-field bg-white pl-3.5 pr-10 text-base text-ink hover:border-dark-600 lg:w-auto lg:text-[0.9375rem]"
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <ul aria-hidden className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => <li key={i} className="h-80 animate-pulse rounded-card border border-line bg-surface motion-reduce:animate-none" />)}
    </ul>
  )
}

export function ResultsSection() {
  const c = useBrowse()
  const { result } = c
  const n = result.totalDocs
  const showSort = c.totalInCategory > 1

  return (
    <section aria-labelledby="products-h">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h2 id="products-h" ref={c.headingRef} tabIndex={-1} aria-live="polite" aria-atomic="true" className="font-heading text-xl font-bold text-dark-900 outline-none">
            {c.skeleton ? 'Loading products' : `${n} ${n === 1 ? 'product' : 'products'}`}
          </h2>
          {!c.skeleton && result.totalPages > 1 && <p className="text-sm text-muted">Page {result.page} of {result.totalPages}</p>}
        </div>
        {(c.hasFacets || showSort) && (
          <div className="flex w-full items-center gap-2.5 lg:w-auto">
            {c.hasFacets && (
              <button
                type="button"
                onClick={() => c.setSheetOpen(true)}
                aria-haspopup="dialog"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-control border-[1.5px] border-dark-900 text-[0.9375rem] font-semibold text-dark-900 transition-colors hover:bg-surface lg:hidden"
              >
                <SlidersHorizontal aria-hidden className="size-4" />
                Filters{c.count > 0 ? ` (${c.count})` : ''}
              </button>
            )}
            {showSort && <SortSelect />}
          </div>
        )}
      </div>

      <AppliedChips className="mb-5 lg:hidden" />

      {c.failed && (
        <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-card border border-warn-border bg-warn-bg px-4 py-3 text-[0.9375rem] text-warn-text">
          <span>We could not update the results. Check your connection and try again.</span>
          <button type="button" onClick={c.retry} className="font-semibold underline underline-offset-2">Try again</button>
        </div>
      )}

      {c.skeleton ? (
        <SkeletonGrid />
      ) : result.items.length === 0 ? (
        <div className="rounded-card border-2 border-dashed border-line p-6 sm:p-8">
          <p className="font-heading text-xl font-bold text-dark-900">No products match these filters.</p>
          <p className="mt-1 max-w-xl text-muted">Remove a filter to see more, or tell us what you need and we will respond with options.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={c.clearAll} className="inline-flex h-11 items-center rounded-control border-2 border-dark-900 px-5 text-sm font-semibold text-dark-900 transition-colors hover:bg-dark-900 hover:text-white">Clear all filters</button>
            <Button href={c.rfqHref} size="sm">Request a quote</Button>
          </div>
        </div>
      ) : (
        <ul aria-busy={c.loading} className={`grid gap-6 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${c.loading ? 'opacity-60' : ''}`}>
          {result.items.map((p) => (
            <li key={p.id}>
              <ProductCardView
                data={{ title: p.title, href: p.href, partNumber: p.partNumber, specLine: p.specLine, image: p.image, tag: originOf(p.origin)?.label }}
                footer={c.compare ? <CompareToggle item={{ id: p.id, title: p.title, image: p.image?.url ?? null }} category={c.compare} /> : undefined}
              />
            </li>
          ))}
        </ul>
      )}

      {!c.skeleton &&
        (c.pathMode ? (
          <Pagination page={result.page} totalPages={result.totalPages} basePath={c.basePath} />
        ) : (
          <Pagination page={result.page} totalPages={result.totalPages} hrefFor={c.pageHref} onSelect={c.goPage} />
        ))}

      <FilterSheet />
    </section>
  )
}
