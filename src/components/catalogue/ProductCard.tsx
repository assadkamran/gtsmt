import type { Product } from '@/payload-types'
import { mediaOf } from '@/lib/catalogue'
import { specRows, specText } from '@/lib/specs'
import { originOf } from '@/lib/origin'
import { ProductCardView } from './ProductCardView'

/** Card for a full CMS product (related products, accessories, brand pages). Listings use ProductCardView directly. */
export function ProductCard({ product, href, tag }: { product: Product; href: string; tag?: string }) {
  const media = mediaOf(product.gallery?.[0]?.image)
  const specLine = specRows(product).slice(0, 2).map((s) => `${s.label}: ${specText(s)}`).join(' · ')
  return (
    <ProductCardView
      data={{
        title: product.title,
        href,
        partNumber: product.partNumber,
        specLine,
        image: media?.url ? { url: media.url, alt: media.alt } : null,
        tag: tag ?? originOf(product.partOrigin)?.label,
      }}
    />
  )
}
