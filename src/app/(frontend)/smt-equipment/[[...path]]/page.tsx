import type { Metadata } from 'next'
import { CataloguePage, catalogueMetadata, catalogueParams } from '@/components/catalogue/route'

export const revalidate = 3600

type Props = { params: Promise<{ path?: string[] }> }

export const generateStaticParams = () => catalogueParams('equipment')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return catalogueMetadata('equipment', (await params).path)
}

export default async function Page({ params }: Props) {
  return <CataloguePage division="equipment" segments={(await params).path} />
}
