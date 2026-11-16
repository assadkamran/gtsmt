import { cache } from 'react'
import type { Article } from '@/payload-types'
import { getCms } from '@/lib/cms'

type LexicalNode = { text?: unknown; children?: LexicalNode[] }

export function articleTextLength(article: Pick<Article, 'body'>): number {
  const collect = (node: LexicalNode | undefined): string => {
    if (!node) return ''
    const ownText = typeof node.text === 'string' ? node.text : ''
    return ownText + (node.children ?? []).map(collect).join(' ')
  }
  return collect(article.body?.root as LexicalNode | undefined).replace(/\s+/g, ' ').trim().length
}

/** Published articles render publicly. Only substantive, described articles enter search and the sitemap. */
export function articleIndexable(article: Article): boolean {
  return !article.seo?.noindex
    && Boolean(article.excerpt?.trim())
    && articleTextLength(article) >= 500
}

export const getPublishedArticles = cache(async (limit = 100) => {
  try {
    const payload = await getCms()
    const result = await payload.find({
      collection: 'articles',
      where: { _status: { equals: 'published' } },
      limit,
      pagination: false,
      depth: 1,
      sort: '-publishedAt',
    })
    return result.docs
  } catch (error) {
    console.error('[articles] could not load published articles', error instanceof Error ? error.message : error)
    return []
  }
})

export const getPublishedArticle = cache(async (slug: string) => {
  try {
    const payload = await getCms()
    const result = await payload.find({
      collection: 'articles',
      where: {
        and: [
          { slug: { equals: slug } },
          { _status: { equals: 'published' } },
        ],
      },
      limit: 1,
      depth: 2,
    })
    return result.docs[0] ?? null
  } catch (error) {
    console.error('[articles] could not load article', error instanceof Error ? error.message : error)
    return null
  }
})

export function articleTopicLabel(topic: Article['topic']): string {
  const labels: Record<NonNullable<Article['topic']>, string> = {
    'production-lines': 'Production lines',
    'feeders-parts': 'Feeders and parts',
    inspection: 'Inspection',
    'factory-planning': 'Factory planning',
    maintenance: 'Maintenance',
  }
  return topic ? labels[topic] : 'Technical guide'
}
