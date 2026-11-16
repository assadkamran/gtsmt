import Link from 'next/link'
import type { Category, Solution } from '@/payload-types'
import { getIndustriesForSolution, getSolutions, getTrees } from '@/lib/catalogue'
import { rfqHref } from '@/lib/rfq'
import { Button } from '../Button'
import { ConfigQuestions } from '../ConfigQuestions'
import { DarkHero } from '../DarkHero'
import { DocImage } from '../DocImage'
import { FaqList } from '../FaqList'
import { JsonLd } from '../JsonLd'
import { LineSequence, type SequenceStation } from '../LineSequence'
import { PageBand } from '../PageBand'
import { RfqBanner } from '../RfqBanner'
import { RichText, hasRichText } from '../RichText'
import { LineExplorer } from '../home/LineExplorer'
import { CategoryCard } from '../catalogue/CategoryCard'
import { SolutionCard } from './Cards'

export async function SolutionsHub() {
  const solutions = await getSolutions()
  return (
    <>
      <PageBand
        crumbs={[{ label: 'SMT Solutions' }]}
        eyebrow="SMT solutions"
        title="SMT Solutions"
        intro="From a single line to a complete factory. Choose the kind of solution closest to what you are building."
        actions={<Button href={rfqHref({ need: 'line' })} size="lg">Plan my line</Button>}
      />
      <section aria-labelledby="sol-list-h" className="bg-white">
        <div className="mx-auto max-w-page px-6 py-12 lg:px-10 lg:py-16">
          <h2 id="sol-list-h" className="sr-only">All solutions</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((s) => <li key={s.id} className="reveal"><SolutionCard solution={s} /></li>)}
          </ul>
        </div>
      </section>
      <section aria-labelledby="hub-line-h" className="border-t border-line bg-surface">
        <div className="mx-auto max-w-page px-6 py-14 lg:px-10 lg:py-20">
          <span className="eyebrow">How a line fits together</span>
          <h2 id="hub-line-h" className="mb-3 text-[clamp(1.75rem,3.4vw,2.625rem)] font-bold text-dark-900">See how a line fits together.</h2>
          <p className="mb-10 max-w-2xl text-muted">Select a station to see its role in the process and the equipment category that supplies it. Configurations vary with board, capacity and budget.</p>
          <LineExplorer />
        </div>
      </section>
      <RfqBanner id="sol-hub-rfq" title="Not sure which solution fits? Tell us what you are building." href={rfqHref({ need: 'line' })} cta="Plan my line" />
    </>
  )
}

export async function SolutionView({ solution }: { solution: Solution }) {
  const [trees, industries] = await Promise.all([getTrees(), getIndustriesForSolution(solution.id)])
  const seq = solution.lineSequence ?? []
  const cats: Category[] = []
  const stations: SequenceStation[] = seq.map((s) => {
    const raw = s.category && typeof s.category === 'object' ? s.category : null
    const cat = raw ? trees.equipment.byId.get(raw.id) ?? raw : null
    if (cat && !cats.some((c) => c.id === cat.id)) cats.push(cat)
    return { name: s.station, note: s.note ?? '', optional: Boolean(s.optional), href: cat ? trees.equipment.urlOf(cat) : undefined, categoryName: cat?.name }
  })
  const faqs = solution.faqs ?? []
  const quote = rfqHref({ need: 'line', topic: solution.title })
  const crumbs = [{ label: 'SMT Solutions', href: '/smt-solutions' }, { label: solution.title }]

  return (
    <>
      <DarkHero
        crumbs={crumbs}
        eyebrow="SMT solutions"
        title={solution.title}
        summary={solution.summary}
        actions={<><Button href={quote} size="lg">Plan this line</Button><Button href={rfqHref({ topic: solution.title })} variant="outline-light" size="lg">Request a quote</Button></>}
        media={<DocImage media={solution.heroImage} brief={`${solution.title}: hero photo`} priority sizes="(min-width: 1024px) 58vw, 100vw" className="min-h-[16rem] sm:min-h-[22rem] lg:min-h-[28rem]" />}
      />

      {hasRichText(solution.body) && (
        <section aria-labelledby="sol-overview-h" className="bg-white">
          <div className="mx-auto grid max-w-page gap-6 px-6 py-12 lg:grid-cols-[1fr_2fr] lg:gap-14 lg:px-10 lg:py-16">
            <h2 id="sol-overview-h" className="text-[1.75rem] font-bold text-dark-900 lg:text-3xl">Overview</h2>
            <RichText data={solution.body} />
          </div>
        </section>
      )}

      {stations.length > 0 && (
        <section aria-labelledby="sol-seq-h" className="border-t border-line bg-surface">
          <div className="mx-auto max-w-page px-6 py-14 lg:px-10 lg:py-20">
            <span className="eyebrow">Typical equipment sequence</span>
            <h2 id="sol-seq-h" className="mb-8 text-[clamp(1.75rem,3.4vw,2.625rem)] font-bold text-dark-900">From bare board to inspected assembly.</h2>
            <LineSequence stations={stations} />
          </div>
        </section>
      )}

      <section aria-labelledby="sol-config-h" className="bg-white">
        <div className="mx-auto max-w-page px-6 py-14 lg:px-10 lg:py-20">
          <span className="eyebrow">Configuration</span>
          <h2 id="sol-config-h" className="mb-8 text-[clamp(1.75rem,3.4vw,2.625rem)] font-bold text-dark-900">What shapes your line</h2>
          <ConfigQuestions />
        </div>
      </section>

      {(cats.length > 0 || industries.length > 0) && (
        <section aria-labelledby="sol-equip-h" className="border-t border-line bg-surface">
          <div className="mx-auto max-w-page px-6 py-12 lg:px-10 lg:py-16">
            {cats.length > 0 && (
              <>
                <h2 id="sol-equip-h" className="mb-6 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">Equipment in this line</h2>
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {cats.map((c) => <li key={c.id}><CategoryCard category={c} href={trees.equipment.urlOf(c)} /></li>)}
                </ul>
              </>
            )}
            {industries.length > 0 && (
              <div className={`flex flex-wrap items-center gap-3 ${cats.length > 0 ? 'mt-10' : ''}`}>
                <span className="font-heading font-bold text-dark-900">Used in:</span>
                {industries.map((i) => <Link key={i.id} href={`/industries/${i.slug}`} className="rounded-full bg-accent-tint px-4 py-1.5 text-[0.9375rem] font-semibold text-accent-text transition-colors hover:bg-line">{i.title}</Link>)}
              </div>
            )}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section aria-labelledby="sol-faq-h" className="bg-white">
          <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }} />
          <div className="mx-auto max-w-page px-6 py-14 lg:px-10 lg:py-20">
            <h2 id="sol-faq-h" className="mb-6 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">Questions about this solution</h2>
            <FaqList items={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
          </div>
        </section>
      )}

      <RfqBanner id="sol-rfq" eyebrow="Plan this line" title="Tell us what you are building." chips={['Capacity', 'Board size', 'Sides', 'Budget']} href={quote} cta="Start the line enquiry" />
    </>
  )
}
