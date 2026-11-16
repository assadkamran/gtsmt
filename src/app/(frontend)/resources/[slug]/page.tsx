import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { RichText, hasRichText } from '@/components/RichText'
import { articleIndexable, getPublishedArticle } from '@/lib/articles'
import { abs, pageMeta } from '@/lib/seo'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getPublishedArticle(slug)
  if (!article) return { title: 'Resource not found', robots: { index: false, follow: true } }

  const seoImage = article.seo?.image && typeof article.seo.image === 'object' ? article.seo.image.url : null
  const image = seoImage || (article.image && typeof article.image === 'object' ? article.image.url : null)
  const noindex = !articleIndexable(article)
  const meta = pageMeta({
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.excerpt,
    path: `/resources/${article.slug}`,
    image,
    noindex,
  })
  return {
    ...meta,
    openGraph: {
      title: article.seo?.title || article.title,
      description: article.seo?.description || article.excerpt || undefined,
      url: `/resources/${article.slug}`,
      type: 'article',
      siteName: 'GTSMT',
      publishedTime: article.publishedAt || article.createdAt,
      modifiedTime: article.updatedAt,
      authors: article.author ? [article.author] : undefined,
      images: image ? [{ url: image }] : undefined,
    },
  }
}

function dateLabel(date: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date))
}

export default async function ResourceArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getPublishedArticle(slug)
  if (!article) notFound()

  const image = article.image && typeof article.image === 'object' ? article.image : null
  const publishedAt = article.publishedAt || article.createdAt
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || undefined,
    mainEntityOfPage: abs(`/resources/${article.slug}`),
    datePublished: publishedAt,
    dateModified: article.updatedAt,
    author: article.author ? { '@type': 'Person', name: article.author } : { '@type': 'Organization', name: 'GTSMT' },
    publisher: { '@type': 'Organization', name: 'GTSMT', url: abs('/') },
    image: image?.url ? [image.url] : undefined,
  }

  return (
    <article className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-page px-6 lg:px-10">
        <Breadcrumbs items={[{ label: 'Resources', href: '/resources' }, { label: article.title }]} />
        <JsonLd data={schema} />
        <header className="mx-auto max-w-4xl py-10 md:py-14">
          <span className="eyebrow">{article.topic ? article.topic.replace(/-/g, ' ') : 'Technical guide'}</span>
          <h1 className="mt-3 text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-tight text-dark-900">{article.title}</h1>
          {article.excerpt && <p className="mt-5 text-xl leading-relaxed text-muted">{article.excerpt}</p>}
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {article.author && <span>By {article.author}</span>}
            <time dateTime={publishedAt}>{dateLabel(publishedAt)}</time>
          </div>
        </header>

        {image?.url && (
          <div className="relative mx-auto mb-12 aspect-[16/7] max-w-5xl overflow-hidden rounded-card bg-surface">
            <Image src={image.url} alt={image.alt || article.title} fill priority sizes="(min-width: 1280px) 1120px, 100vw" className="object-cover" />
          </div>
        )}

        <div className="mx-auto max-w-3xl">
          {hasRichText(article.body) ? (
            <RichText data={article.body} className="text-lg" />
          ) : (
            <p className="rounded-card border border-line bg-surface p-6 text-muted">The full guide is being prepared. Contact GTSMT if you need help with this topic.</p>
          )}
          {!!article.faqs?.length && (
            <section className="mt-12 border-t border-line pt-8" aria-labelledby="article-faq-heading">
              <h2 id="article-faq-heading" className="text-2xl font-bold text-dark-900">Frequently asked questions</h2>
              <dl className="mt-6 divide-y divide-line">
                {article.faqs.map((faq, index) => (
                  <div key={faq.id ?? index} className="py-5">
                    <dt className="font-bold text-dark-900">{faq.question}</dt>
                    <dd className="mt-2 leading-relaxed text-muted">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          <div className="mt-12 border-t border-line pt-8">
            <a href="/resources" className="font-semibold text-accent-text hover:underline">← All resources</a>
          </div>
        </div>
      </div>
    </article>
  )
}
