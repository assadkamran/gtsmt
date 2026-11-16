import type { Metadata } from 'next'
import { CataloguePage, catalogueMetadata, catalogueParams } from '@/components/catalogue/route'

export const revalidate = 3600

type Props = { params: Promise<{ path?: string[] }> }

export const generateStaticParams = () => catalogueParams('parts')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return catalogueMetadata('parts', (await params).path)
}

export default async function Page({ params }: Props) {
  return <CataloguePage division="parts" segments={(await params).path} />
}
