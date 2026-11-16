import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { unbuiltRoutes } from '@/lib/nav'
import { PlannedPage } from '@/components/PlannedPage'

type Props = { params: Promise<{ slug: string[] }> }

const routes = unbuiltRoutes()
const find = (slug: string[]) => routes.find((r) => r.href === '/' + slug.join('/'))

export const dynamicParams = false
export function generateStaticParams() {
  return routes.map((r) => ({ slug: r.href.split('/').filter(Boolean) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  // Pages that are not built yet must not be indexed.
  return { title: find(slug)?.label ?? 'Page', robots: { index: false, follow: true } }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const r = find(slug)
  if (!r) notFound()
  return <PlannedPage route={r} />
}
