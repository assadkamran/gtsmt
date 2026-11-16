import type { Metadata } from 'next'
import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { getCms } from '@/lib/cms'
import { rfqHref } from '@/lib/rfq'
import type { SearchKind } from '@/lib/search/indexer'
import { recordMiss } from '@/lib/search/misses'
import { searchSite } from '@/lib/search/query'
import { Button } from '@/components/Button'
import { PageBand } from '@/components/PageBand'
import { RfqBanner } from '@/components/RfqBanner'
import { SearchResultRow } from '@/components/search/SearchResultRow'

const PAGE = 10
const KINDS: SearchKind[] = ['product', 'category', 'solution', 'industry', 'brand']
const TAB: Record<SearchKind, string> = { product: 'Products', category: 'Categories', solution: 'Solutions', industry: 'Industries', brand: 'Brands' }

type Props = { searchParams: Promise<{ q?: string; type?: string; page?: string; brand?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  // Search results are never indexed.
  return { title: q?.trim() ? `Search results for “${q.trim().slice(0, 60)}”` : 'Search', robots: { index: false, follow: true } }
}

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams
  const q = (sp.q ?? '').trim().slice(0, 80)
  const type: SearchKind | 'all' = KINDS.includes(sp.type as SearchKind) ? (sp.type as SearchKind) : 'all'
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)
  const brandId = Number(sp.brand) > 0 ? Number(sp.brand) : null

  const payload = await getCms()
  const [result, brand] = await Promise.all([
    q.length >= 2 ? searchSite(payload, { q, kind: type, limit: PAGE, offset: (page - 1) * PAGE, brandId }) : Promise.resolve(null),
    brandId ? payload.findByID({ collection: 'manufacturers', id: brandId, depth: 0 }).catch(() => null) : Promise.resolve(null),
  ])
  if (result && result.total === 0 && page === 1) await recordMiss(payload, q)

  const href = (o: { type?: string; page?: number; brand?: number | null }) => {
    const p = new URLSearchParams({ q })
    if (o.type && o.type !== 'all') p.set('type', o.type)
    if (o.brand) p.set('brand', String(o.brand))
    if (o.page && o.page > 1) p.set('page', String(o.page))
    return `/search?${p}`
  }

  const shown = result ? (type === 'all' ? result.total : result.counts[type]) : 0
  const pages = Math.max(1, Math.ceil(shown / PAGE))
  const exact = result && page === 1 && (type === 'all' || type === 'product') ? result.items.filter((i) => i.exact) : []
  const rest = result ? result.items.filter((i) => !exact.some((e) => e.id === i.id && e.kind === i.kind)) : []

  const title = !q ? 'Search' : result?.total === 0 ? `No results for “${q}”` : `${result?.total ?? 0} ${result?.total === 1 ? 'result' : 'results'} for “${q}”`

  return (
    <>
      <PageBand crumbs={[{ label: 'Search' }]} eyebrow="Search" title={title}>
        <form action="/search" method="get" role="search" aria-label="Search the site" className="mt-6 flex max-w-2xl gap-3">
          <label htmlFor="search-page-q" className="sr-only">Search parts, machines and pages</label>
          <input id="search-page-q" name="q" type="search" defaultValue={q} placeholder="Part number, machine or feeder type" autoComplete="off" className="h-12 min-w-0 flex-1 rounded-control border border-line bg-white px-4 text-base text-ink placeholder:text-muted" />
          {brandId && <input type="hidden" name="brand" value={brandId} />}
          <button type="submit" className="h-12 shrink-0 rounded-control bg-accent px-6 font-semibold text-on-accent transition-colors hover:bg-accent-hover">Search</button>
        </form>
        {brand && (
          <p className="mt-4 text-sm text-muted">
            Limited to <span className="font-semibold text-ink">{brand.name}</span>.{' '}
            <Link href={href({ type, brand: null })} className="font-semibold text-accent-text hover:text-dark-900">Search all brands</Link>
          </p>
        )}
      </PageBand>

      <section aria-label="Search results" className="bg-white">
        <div className="mx-auto max-w-page px-6 py-10 lg:px-10 lg:py-14">
          {!q || q.length < 2 ? (
            <div className="max-w-2xl">
              <p className="text-lg text-muted">Type a part number, a machine type or a feeder size. Spaces and dashes in part numbers do not matter.</p>
              <div className="mt-6 flex flex-wrap gap-3"><Button href="/spare-parts" variant="outline">Browse spare parts</Button><Button href="/smt-equipment" variant="outline">Browse equipment</Button></div>
            </div>
          ) : result && result.total > 0 ? (
            <>
              <nav aria-label="Result types" className="mb-8 flex flex-wrap gap-2.5">
                <Link href={href({ type: 'all', brand: brandId })} aria-current={type === 'all' ? 'page' : undefined} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${type === 'all' ? 'border-accent bg-accent text-on-accent' : 'border-line text-dark-900 hover:border-dark-600'}`}>All {result.total}</Link>
                {KINDS.filter((k) => result.counts[k] > 0).map((k) => (
                  <Link key={k} href={href({ type: k, brand: brandId })} aria-current={type === k ? 'page' : undefined} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${type === k ? 'border-accent bg-accent text-on-accent' : 'border-line text-dark-900 hover:border-dark-600'}`}>{TAB[k]} {result.counts[k]}</Link>
                ))}
              </nav>

              {exact.length > 0 && (
                <ul aria-label="Exact part number matches" className="mb-6 overflow-hidden rounded-card border-2 border-accent">
                  {exact.map((i) => <li key={`${i.kind}-${i.id}`} className="border-b border-line last:border-b-0"><SearchResultRow item={i} tokens={result.tokens} emphasise /></li>)}
                </ul>
              )}

              {rest.length > 0 && (
                <ol className="divide-y divide-line overflow-hidden rounded-card border border-line">
                  {rest.map((i) => <li key={`${i.kind}-${i.id}`}><SearchResultRow item={i} tokens={result.tokens} /></li>)}
                </ol>
              )}

              {pages > 1 && (
                <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  {page > 1 && <Link href={href({ type, page: page - 1, brand: brandId })} rel="prev" className="grid h-11 place-items-center rounded-control border border-line px-4 text-[0.9375rem] font-semibold hover:border-dark-600">Previous</Link>}
                  <span className="px-3 text-sm text-muted">Page {page} of {pages}</span>
                  {page < pages && <Link href={href({ type, page: page + 1, brand: brandId })} rel="next" className="grid h-11 place-items-center rounded-control border border-line px-4 text-[0.9375rem] font-semibold hover:border-dark-600">Next</Link>}
                </nav>
              )}
            </>
          ) : (
            <div className="max-w-2xl rounded-card border border-dashed border-line p-7">
              <SearchX aria-hidden className="size-8 text-muted" strokeWidth={1.5} />
              <p className="mt-3 font-heading text-xl font-bold text-dark-900">Nothing matched &ldquo;{q}&rdquo;.</p>
              <p className="mt-1.5 text-muted">Check the spelling, try fewer words, or send us the part number or your machine model and we will reply.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href={rfqHref({ need: 'part', topic: q })}>Request this part</Button>
                <Button href="/spare-parts" variant="outline">Browse spare parts</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <RfqBanner id="search-rfq" eyebrow="Can't find it?" title="Send us the part number or your machine model." href={rfqHref({ need: 'part', topic: q || undefined })} cta="Request a part" />
    </>
  )
}
