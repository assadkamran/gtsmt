import { Check } from 'lucide-react'
import type { Category, Industry, Solution } from '@/payload-types'
import { getIndustries, getTrees } from '@/lib/catalogue'
import { rfqHref } from '@/lib/rfq'
import { Button } from '../Button'
import { DarkHero } from '../DarkHero'
import { DocImage } from '../DocImage'
import { PageBand } from '../PageBand'
import { RfqBanner } from '../RfqBanner'
import { RichText, hasRichText } from '../RichText'
import { CategoryCard } from '../catalogue/CategoryCard'
import { IndustryCard, SolutionCard } from './Cards'

export async function IndustriesHub() {
  const industries = await getIndustries()
  return (
    <>
      <PageBand
        crumbs={[{ label: 'Industries' }]}
        eyebrow="Industries served"
        title="Built around how your industry builds boards"
        intro="Different industries put different demands on an SMT line. Choose yours to see how equipment and solutions fit."
      />
      <section aria-labelledby="ind-list-h" className="bg-white">
        <div className="mx-auto max-w-page px-6 py-12 lg:px-10 lg:py-16">
          <h2 id="ind-list-h" className="sr-only">All industries</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((i) => <li key={i.id} className="reveal"><IndustryCard industry={i} /></li>)}
          </ul>
        </div>
      </section>
      <RfqBanner id="ind-hub-rfq" title="Tell us what your industry needs from a line." href={rfqHref({ need: 'line' })} cta="Plan my line" />
    </>
  )
}

export async function IndustryView({ industry }: { industry: Industry }) {
  const trees = await getTrees()
  const solutions = (industry.relevantSolutions ?? []).filter((s): s is Solution => !!s && typeof s === 'object' && s._status === 'published')
  const cats = (industry.relevantCategories ?? []).filter((c): c is Category => !!c && typeof c === 'object').map((c) => trees.equipment.byId.get(c.id) ?? c)
  const requirements = industry.requirements ?? []
  const quote = rfqHref({ need: 'line', topic: industry.title })

  return (
    <>
      <DarkHero
        crumbs={[{ label: 'Industries', href: '/industries' }, { label: industry.title }]}
        eyebrow="Industries served"
        title={industry.title}
        summary={industry.intro}
        actions={<><Button href={quote} size="lg">Plan a line</Button><Button href={rfqHref({ topic: industry.title })} variant="outline-light" size="lg">Request a quote</Button></>}
        media={<DocImage media={industry.image} brief={`${industry.title}: hero photo`} priority sizes="(min-width: 1024px) 58vw, 100vw" className="min-h-[16rem] sm:min-h-[22rem] lg:min-h-[26rem]" />}
      />

      {(hasRichText(industry.body) || requirements.length > 0) && (
        <section aria-labelledby="ind-serve-h" className="bg-white">
          <div className="mx-auto grid max-w-page gap-10 px-6 py-12 lg:grid-cols-[1.3fr_1fr] lg:gap-14 lg:px-10 lg:py-16">
            {hasRichText(industry.body) && (
              <div>
                <h2 id="ind-serve-h" className="mb-5 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">How SMT serves {industry.title.toLowerCase()}</h2>
                <RichText data={industry.body} />
              </div>
            )}
            {requirements.length > 0 && (
              <div className="self-start rounded-card border border-line bg-surface p-6 lg:p-7">
                <h3 className="mb-4 text-xl font-bold text-dark-900">Typical requirements</h3>
                <ul>{requirements.map((r, i) => <li key={`${r.text}-${i}`} className="flex items-start gap-3 py-2"><Check aria-hidden className="mt-0.5 size-5 shrink-0 text-accent-text" />{r.text}</li>)}</ul>
              </div>
            )}
          </div>
        </section>
      )}

      {solutions.length > 0 && (
        <section aria-labelledby="ind-sol-h" className="border-t border-line bg-surface">
          <div className="mx-auto max-w-page px-6 py-12 lg:px-10 lg:py-16">
            <h2 id="ind-sol-h" className="mb-6 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">Recommended solutions</h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{solutions.map((s) => <li key={s.id}><SolutionCard solution={s} /></li>)}</ul>
          </div>
        </section>
      )}

      {cats.length > 0 && (
        <section aria-labelledby="ind-eq-h" className="bg-white">
          <div className="mx-auto max-w-page px-6 py-12 lg:px-10 lg:py-16">
            <h2 id="ind-eq-h" className="mb-6 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">Relevant equipment</h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{cats.map((c) => <li key={c.id}><CategoryCard category={c} href={trees.equipment.urlOf(c)} /></li>)}</ul>
          </div>
        </section>
      )}

      <RfqBanner id="ind-rfq" title={`Building ${industry.title.toLowerCase()}? Tell us what you need.`} href={quote} cta="Start your enquiry" />
    </>
  )
}
