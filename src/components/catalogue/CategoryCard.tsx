import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Category } from '@/payload-types'
import { DocImage } from '../DocImage'

export function CategoryCard({ category, href, count }: { category: Category; href: string; count?: number }) {
  return (
    <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(11,17,36,0.12)]">
      <DocImage media={category.image} brief={category.name} tone="light" sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 100vw" className="aspect-[16/10]" imgClassName="transition-transform duration-500 motion-safe:group-hover:scale-[1.03]" />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1.1875rem] font-bold text-dark-900 transition-colors group-hover:text-accent-text">{category.name}</h3>
        {category.summary && <p className="mt-1.5 line-clamp-3 text-[0.9375rem] text-muted">{category.summary}</p>}
        <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-semibold text-accent-text">
          {count ? `${count} ${count === 1 ? 'product' : 'products'}` : 'Browse'}
          <ArrowRight aria-hidden className="size-4 transition-transform motion-safe:group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}
