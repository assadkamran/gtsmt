import Image from 'next/image'
import Link from 'next/link'
import { Factory, LayoutGrid, Package, Route, Tag } from 'lucide-react'
import type { SearchItem } from '@/lib/search/query'
import { originOf } from '@/lib/origin'
import { Highlight } from './Highlight'

const KIND = {
  product: { label: 'Product', icon: Package },
  category: { label: 'Category', icon: LayoutGrid },
  solution: { label: 'Solution', icon: Route },
  industry: { label: 'Industry', icon: Factory },
  brand: { label: 'Brand', icon: Tag },
} as const

export function SearchResultRow({ item, tokens, emphasise = false }: { item: SearchItem; tokens: string[]; emphasise?: boolean }) {
  const k = KIND[item.kind]
  const Icon = k.icon
  const origin = originOf(item.origin)
  return (
    <div className={`flex items-start gap-4 p-4 sm:p-5 ${emphasise ? 'bg-accent-tint/60' : ''}`}>
      <Link href={item.url} tabIndex={-1} aria-hidden className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-placeholder text-placeholder-text sm:size-20">
        {item.imageUrl && item.kind === 'product' ? <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-contain p-1.5" /> : <Icon className="size-7" strokeWidth={1.5} />}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="rounded-full bg-accent-tint px-2.5 py-0.5 text-xs font-semibold text-accent-text">{emphasise ? 'Exact part number match' : k.label}</span>
          {item.subtitle && <span className="text-[0.8125rem] text-muted">{item.subtitle}</span>}
        </div>
        <h3 className="mt-1.5 text-lg font-bold leading-snug text-dark-900">
          <Link href={item.url} className="hover:text-accent-text"><Highlight text={item.title} tokens={tokens} /></Link>
        </h3>
        {item.excerpt && <p className="mt-1 line-clamp-2 text-[0.9375rem] text-muted"><Highlight text={item.excerpt} tokens={tokens} /></p>}
        {(item.partNumbers || origin) && (
          <p className="mt-1.5 text-sm text-muted">
            {item.partNumbers && <>Part no. <span className="font-semibold text-ink"><Highlight text={item.partNumbers} tokens={tokens} /></span></>}
            {item.partNumbers && origin ? ' · ' : ''}
            {origin?.label}
          </p>
        )}
      </div>
    </div>
  )
}
