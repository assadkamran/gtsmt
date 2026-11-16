import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ImagePlaceholder } from '../ImagePlaceholder'

export type CardData = {
  title: string
  href: string
  partNumber?: string | null
  specLine?: string | null
  image?: { url: string; alt: string } | null
  tag?: string | null
}

/**
 * The one product card. Plain data in, so it renders the same on the server (related products, brand pages) and in
 * the browser (filtered listings). The whole card is clickable through the title link; `footer` (the compare
 * checkbox) sits above that link so it stays a separate control instead of being nested inside it.
 */
export function ProductCardView({ data, footer }: { data: CardData; footer?: ReactNode }) {
  const { title, href, partNumber, specLine, image, tag } = data
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition duration-200 has-[h3_a:focus-visible]:outline-2 has-[h3_a:focus-visible]:outline-offset-2 has-[h3_a:focus-visible]:outline-accent-text motion-safe:hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(11,17,36,0.12)]">
      <div className="relative aspect-[4/3] bg-surface">
        {image ? (
          <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1280px) 280px, (min-width: 640px) 45vw, 100vw" className="object-contain p-4 transition-transform duration-500 motion-safe:group-hover:scale-[1.04]" />
        ) : (
          <ImagePlaceholder tone="light" brief="Product photo" className="h-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {tag && <span className="mb-2.5 w-fit rounded-full bg-accent-tint px-2.5 py-1 text-xs font-semibold text-accent-text">{tag}</span>}
        <h3 className="text-[1.1875rem] font-bold text-dark-900 transition-colors group-hover:text-accent-text">
          <Link href={href} className="outline-none after:absolute after:inset-0">{title}</Link>
        </h3>
        {partNumber && <p className="mt-1 text-sm text-muted">Part no. {partNumber}</p>}
        {specLine && <p className="mt-1 text-sm text-muted">{specLine}</p>}
        <div className={`mt-auto flex items-center gap-3 pt-4 ${footer ? 'mt-4 justify-between border-t border-line' : ''}`}>
          {footer && <div className="relative z-10">{footer}</div>}
          <span aria-hidden className="text-sm font-semibold text-accent-text">View details &rarr;</span>
        </div>
      </div>
    </article>
  )
}
