import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SolutionView } from '@/components/solutions/SolutionViews'
import { PlannedPage } from '@/components/PlannedPage'
import { documentIndexable, getSolution, getSolutions, mediaOf } from '@/lib/catalogue'
import { isDev } from '@/lib/cms'
import { findNavRoute } from '@/lib/nav'
import { pageMeta } from '@/lib/seo'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  if (isDev) return []
  try {
    return (await getSolutions()).map((s) => ({ slug: s.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const s = await getSolution(slug)
  if (!s) {
    const planned = findNavRoute(`/smt-solutions/${slug}`)
    return planned ? { title: planned.label, robots: { index: false, follow: true } } : { title: 'Page not found', robots: { index: false } }
  }
  return pageMeta({
    title: s.seo?.title || `${s.title} | SMT Solutions`,
    description: s.seo?.description || s.summary,
    path: `/smt-solutions/${s.slug}`,
    image: mediaOf(s.seo?.image)?.url ?? mediaOf(s.heroImage)?.url,
    noindex: !documentIndexable(s),
  })
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const s = await getSolution(slug)
  if (s) return <SolutionView solution={s} />
  const planned = findNavRoute(`/smt-solutions/${slug}`)
  if (planned) return <PlannedPage route={planned} />
  notFound()
}
