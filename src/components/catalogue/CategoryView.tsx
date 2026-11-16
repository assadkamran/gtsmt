import { notFound } from 'next/navigation'
import type { Category } from '@/payload-types'
import { divisions, getProductCounts, type CategoryTree, type Division } from '@/lib/catalogue'
import { browseCategory } from '@/lib/browse/data'
import { emptyState } from '@/lib/browse/engine'
import { PAGE_SIZE } from '@/lib/browse/types'
import { rfqHref, type Need } from '@/lib/rfq'
import { Button } from '../Button'
import { DocImage } from '../DocImage'
import { PageBand } from '../PageBand'
import { RfqBanner } from '../RfqBanner'
import { RichText, hasRichText } from '../RichText'
import { CategoryCard } from './CategoryCard'
import { CategoryRail } from './CategoryRail'
import { BrowseProvider } from './BrowseProvider'
import { EmptyState } from './EmptyState'
import { FilterCard } from './FilterPanel'
import { LineStripStatic } from './LineStripStatic'
import { ResultsSection } from './ResultsSection'

const needFor: Record<Division, Need> = { equipment: 'equipment', parts: 'part', peripherals: 'peripherals' }

export async function CategoryView({ division, tree, category, page }: { division: Division; tree: CategoryTree; category: Category; page: number }) {
  const cfg = divisions[division]
  const [browse, counts] = await Promise.all([browseCategory(category.id, emptyState({ page }), PAGE_SIZE), getProductCounts()])
  // The engine clamps a too-high page to the last one (right for filter links); a static "/page/N" address beyond the end is a 404.
  if (page > 1 && (!browse || browse.result.page !== page)) notFound()
  const total = browse?.total ?? 0

  const kids = tree.childrenOf(category)
  const trail = tree.trail(category)
  const crumbs = [{ label: cfg.label, href: cfg.base }, ...trail.map((c, i) => ({ label: c.name, href: i === trail.length - 1 ? undefined : tree.urlOf(c) }))]
  const base = tree.urlOf(category)
  const need = needFor[division]
  const noun = division === 'parts' ? 'this part' : 'this equipment'
  const showFit = hasRichText(category.description)

  const subCategories =
    kids.length > 0 ? (
      <section aria-labelledby="sub-h" className={total > 0 ? 'mb-12' : ''}>
        <h2 id="sub-h" className="mb-5 font-heading text-xl font-bold text-dark-900">Browse {category.name.toLowerCase()}</h2>
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {kids.map((k) => (
            <li key={k.id}><CategoryCard category={k} href={tree.urlOf(k)} count={counts.get(k.id)} /></li>
          ))}
        </ul>
      </section>
    ) : null

  return (
    <>
      <PageBand
        crumbs={crumbs}
        eyebrow={cfg.eyebrow}
        title={category.name}
        intro={category.summary}
        actions={
          <>
            <Button href={rfqHref({ need, topic: category.name })} size="lg">Request a quote</Button>
            <Button href={rfqHref({ need, topic: `Question about ${category.name}` })} variant="outline" size="lg">Ask about {noun}</Button>
          </>
        }
        media={<DocImage media={category.image} brief={category.name} tone="light" priority sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[16/10] rounded-card border border-line" />}
      />

      <section aria-label={`${category.name} products`} className="bg-white">
        {total > 0 && browse ? (
          <BrowseProvider
            categoryId={category.id}
            categoryName={category.name}
            basePath={base}
            page={page}
            defs={browse.defs}
            initial={browse.result}
            totalInCategory={total}
            compare={category.allowCompare && total >= 2 ? { id: category.id, name: category.name, href: base } : null}
            rfqHref={rfqHref({ need, topic: category.name })}
          >
            <div className="mx-auto grid max-w-page gap-8 px-6 py-10 lg:grid-cols-[18.5rem_1fr] lg:gap-12 lg:px-10 lg:py-14">
              <CategoryRail division={division} tree={tree} current={category} topic={category.name} before={<FilterCard />} />
              <div className="min-w-0">
                {subCategories}
                <ResultsSection />
              </div>
            </div>
          </BrowseProvider>
        ) : (
          <div className="mx-auto grid max-w-page gap-8 px-6 py-10 lg:grid-cols-[17rem_1fr] lg:gap-12 lg:px-10 lg:py-14">
            <CategoryRail division={division} tree={tree} current={category} topic={category.name} />
            <div className="min-w-0">
              {subCategories}
              {kids.length === 0 && (
                <EmptyState
                  title="Products for this category are being added."
                  text="Tell us what you need and we will respond with options."
                  href={rfqHref({ need, topic: category.name })}
                />
              )}
            </div>
          </div>
        )}
      </section>

      {showFit && (
        <section aria-labelledby="fit-h" className="border-t border-line bg-surface">
          <div className="mx-auto grid max-w-page items-center gap-10 px-6 py-12 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:px-10 lg:py-14">
            <div>
              <h2 id="fit-h" className="mb-4 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">{category.lineStation ? 'How this equipment fits in the line' : `About ${category.name.toLowerCase()}`}</h2>
              <RichText data={category.description} />
            </div>
            {category.lineStation && <LineStripStatic active={category.lineStation} />}
          </div>
        </section>
      )}

      <RfqBanner id="cat-rfq" title={`Looking for ${category.name.toLowerCase()}? Tell us what you need.`} href={rfqHref({ need, topic: category.name })} />
    </>
  )
}
