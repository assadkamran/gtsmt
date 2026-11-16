import type { Metadata } from 'next'

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
export const abs = (path: string) => new URL(path, siteUrl).toString()

/** Collapse whitespace and cut at a word boundary. */
export function clip(text: string | null | undefined, max = 158): string | undefined {
  if (!text) return undefined
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  return cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length).replace(/[.,;:\s]+$/, '') + '…'
}

export function pageMeta(o: { title: string; description?: string | null; path: string; image?: string | null; noindex?: boolean }): Metadata {
  const description = clip(o.description)
  return {
    title: o.title,
    description,
    alternates: { canonical: o.path },
    robots: o.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: o.title,
      description,
      url: o.path,
      type: 'website',
      siteName: 'GTSMT',
      images: o.image ? [{ url: o.image }] : undefined,
    },
  }
}
