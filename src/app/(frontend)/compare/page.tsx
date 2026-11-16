import type { Metadata } from 'next'
import Link from 'next/link'
import { buildRows } from '@/lib/compare/build'
import { loadComparison, parseIds } from '@/lib/compare/load'
import { MAX_COMPARE } from '@/lib/compare/store-limits'
import { rfqHref, type Need } from '@/lib/rfq'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Button } from '@/components/Button'
import { CompareView } from '@/components/compare/CompareView'
import { RfqBanner } from '@/components/RfqBanner'

type Props = { searchParams: Promise<{ items?: string | string[] }> }

export const metadata: Metadata = { title: 'Compare products', robots: { index: false, follow: false } }

const needFor = { equipment: 'equipment', parts: 'part', peripherals: 'peripherals' } as const satisfies Record<string, Need>

function Frame({ children, crumbs = true }: { children: React.ReactNode; crumbs?: boolean }) {
  return (
    <div className="mx-auto max-w-page px-6 pb-14 pt-6 lg:px-10">
      {crumbs && <Breadcrumbs items={[{ label: 'Compare' }]} />}
      {children}
    </div>
  )
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <Frame>
      <h1 className="mt-8 text-[clamp(1.875rem,4vw,2.625rem)] font-extrabold text-dark-900">Compare products</h1>
      <div className="mt-8 max-w-2xl rounded-card border-2 border-dashed border-line p-6 sm:p-8">
        <p className="font-heading text-xl font-bold text-dark-900">{title}</p>
        <p className="mt-2 text-muted">{text}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/smt-equipment" size="sm">Browse SMT equipment</Button>
          <Button href="/smt-peripherals" size="sm" variant="outline">Browse peripherals</Button>
        </div>
      </div>
    </Frame>
  )
}

export default async function ComparePage({ searchParams }: Props) {
  const ids = parseIds((await searchParams).items)
  const loaded = await loadComparison(ids)

  if (!loaded) return <Empty title="Nothing to compare yet." text={`Tick Compare on a product card, then open the comparison from the bar at the bottom of the page. You can compare up to ${MAX_COMPARE} products from one category at a time.`} />
  if (!loaded.category.allowCompare) return <Empty title={`Comparison is not available for ${loaded.category.name}.`} text="Open the product pages to see their details, or send us a quote request." />
  if (loaded.products.length < 2) {
    return (
      <Empty
        title="Add at least one more product to compare."
        text={`You have ${loaded.products[0]?.title ?? 'one product'} selected. Go back to ${loaded.category.name} and tick Compare on another.${loaded.skipped > 0 ? ' The other products in the link belong to a different category or are no longer available, so they cannot be compared with this one.' : ''}`}
      />
    )
  }

  const { category, products } = loaded
  const rows = buildRows(products)
  const need = needFor[category.division]
  const quoteAll = rfqHref({ need, product: products.map((p) => p.id), topic: `Comparison: ${category.name}` })

  return (
    <>
      <Frame>
        <div className="mb-8 mt-8">
          <h1 className="text-[clamp(1.875rem,4vw,2.625rem)] font-extrabold text-dark-900">Compare products</h1>
          <p className="mt-2 text-[1.0625rem] text-muted">
            {products.length} products from <Link href={category.href} className="font-semibold text-ink hover:text-accent-text">{category.name}</Link>. Products can be compared within one category.
          </p>
          {loaded.skipped > 0 && <p role="status" className="mt-3 text-sm text-muted">{loaded.skipped === 1 ? 'One product was' : `${loaded.skipped} products were`} left out because {loaded.skipped === 1 ? 'it is' : 'they are'} no longer available or belong to a different category.</p>}
        </div>
        <CompareView
          category={{ id: category.id, name: category.name, href: category.href }}
          need={need}
          products={products.map((p) => ({ id: p.id, title: p.title, href: p.href, image: p.image, partNumber: p.partNumber, originLabel: p.originLabel }))}
          rows={rows}
        />
      </Frame>
      <RfqBanner id="cmp-rfq" title={`One enquiry for all ${products.length} products`} chips={products.map((p) => p.title)} href={quoteAll} cta={`Request a quote for all ${products.length}`} />
    </>
  )
}
