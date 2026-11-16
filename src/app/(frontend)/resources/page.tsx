import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getPublishedArticles } from '@/lib/articles'
import { pageMeta } from '@/lib/seo'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const articles = await getPublishedArticles()
  return pageMeta({
    title: 'SMT Resources and Technical Guides',
    description: 'Practical guides to SMT production lines, equipment selection, inspection, feeders, factory planning and maintenance.',
    path: '/resources',
    noindex: articles.length === 0,
  })
}

function formatDate(date?: string | null) {
  if (!date) return null
  const value = new Date(date)
  return Number.isNaN(value.getTime()) ? null : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(value)
}

export default async function ResourcesPage() {
  const articles = await getPublishedArticles()

  return (
    <section className="min-h-[60vh] bg-white py-12 md:py-16">
      <div className="mx-auto max-w-page px-6 lg:px-10">
        <Breadcrumbs items={[{ label: 'Resources' }]} />
        <header className="max-w-3xl py-12 md:py-16">
          <span className="eyebrow">Knowledge center</span>
          <h1 className="mt-3 text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-tight text-dark-900">SMT resources and technical guides</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">Practical information for planning, selecting and maintaining SMT production equipment.</p>
        </header>

        {articles.length ? (
          <div className="grid gap-6 border-t border-line py-10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const image = article.image && typeof article.image === 'object' ? article.image : null
              return (
                <article key={article.id} className="overflow-hidden rounded-card border border-line bg-white">
                  <Link href={`/resources/${article.slug}`} className="group block h-full">
                    {image?.url && (
                      <div className="relative aspect-[16/9] bg-surface">
                        <Image src={image.url} alt={image.alt || article.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02]" />
                      </div>
                    )}
                    <div className="p-6">
                      <span className="eyebrow !mb-2">{article.topic ? article.topic.replace(/-/g, ' ') : 'Technical guide'}</span>
                      <h2 className="text-xl font-bold text-dark-900 transition-colors group-hover:text-accent-text">{article.title}</h2>
                      {article.excerpt && <p className="mt-3 leading-relaxed text-muted">{article.excerpt}</p>}
                      {formatDate(article.publishedAt) && <time className="mt-5 block text-sm text-muted" dateTime={article.publishedAt ?? undefined}>{formatDate(article.publishedAt)}</time>}
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="border-t border-line py-12 md:py-16">
            <div className="max-w-2xl rounded-card border border-line bg-surface p-7 md:p-10">
              <h2 className="text-2xl font-bold text-dark-900">Technical guides are being prepared</h2>
              <p className="mt-3 leading-relaxed text-muted">Our Knowledge Center will feature practical information on SMT equipment, production planning and maintenance. In the meantime, tell us what you are planning and our team can help.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/request-a-quote">Talk to our team</Button>
                <Button href="/contact" variant="outline">Contact GTSMT</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
