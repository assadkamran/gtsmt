import Link from 'next/link'
import { getPublishedArticles } from '@/lib/articles'
import { Button } from '../Button'
import { Section, SectionHead } from '../Section'
import Image from 'next/image'

export async function Resources() {
  const articles = await getPublishedArticles(5)
  if (articles.length === 0) return null
  const [featured, ...list] = articles
  const img = featured.image && typeof featured.image === 'object' ? featured.image : null
  return (
    <Section tone="surface" id="resources" labelledBy="resources-h">
      <SectionHead eyebrow="Technical resources" id="resources-h" title="SMT knowledge centre">
        <Button href="/resources" variant="outline" size="sm">All resources</Button>
      </SectionHead>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
        <Link href={`/resources/${featured.slug}`} className="group overflow-hidden rounded-card border border-line bg-white transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(11,17,36,0.12)]">
          {img?.url ? (
            <div className="relative aspect-[16/8]"><Image src={img.url} alt={img.alt ?? ''} fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" /></div>
          ) : (
            <div className="aspect-[16/8] bg-surface" aria-hidden="true" />
          )}
          <div className="p-6 sm:p-7">
            <span className="eyebrow !mb-2">Guide</span>
            <h3 className="text-[1.5rem] font-bold text-dark-900 transition-colors group-hover:text-accent-text">{featured.title}</h3>
            {featured.excerpt && <p className="mt-2 text-muted">{featured.excerpt}</p>}
          </div>
        </Link>
        <ul className="border-t border-line">
          {list.map((article) => (
            <li key={article.id} className="border-b border-line">
              <Link href={`/resources/${article.slug}`} className="group flex items-center justify-between gap-4 py-5 font-heading text-xl font-bold text-dark-900 transition-colors hover:text-accent-text">
                {article.title}<span aria-hidden className="text-accent-text transition-transform motion-safe:group-hover:translate-x-1">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
