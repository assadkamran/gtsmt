import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IndustryView } from '@/components/solutions/IndustryViews'
import { PlannedPage } from '@/components/PlannedPage'
import { documentIndexable, getIndustries, getIndustry, mediaOf } from '@/lib/catalogue'
import { isDev } from '@/lib/cms'
import { findNavRoute } from '@/lib/nav'
import { pageMeta } from '@/lib/seo'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  if (isDev) return []
  try {
    return (await getIndustries()).map((i) => ({ slug: i.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const i = await getIndustry(slug)
  if (!i) {
    const planned = findNavRoute(`/industries/${slug}`)
    return planned ? { title: planned.label, robots: { index: false, follow: true } } : { title: 'Page not found', robots: { index: false } }
  }
  return pageMeta({
    title: i.seo?.title || `${i.title} | SMT Equipment and Solutions`,
    description: i.seo?.description || i.intro,
    path: `/industries/${i.slug}`,
    image: mediaOf(i.seo?.image)?.url ?? mediaOf(i.image)?.url,
    noindex: !documentIndexable(i),
  })
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const i = await getIndustry(slug)
  if (i) return <IndustryView industry={i} />
  const planned = findNavRoute(`/industries/${slug}`)
  if (planned) return <PlannedPage route={planned} />
  notFound()
}
