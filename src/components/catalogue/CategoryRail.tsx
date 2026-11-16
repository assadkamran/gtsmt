import type { ReactNode } from 'react'
import Link from 'next/link'
import type { Category } from '@/payload-types'
import { divisions, type CategoryTree, type Division } from '@/lib/catalogue'
import { rfqHref } from '@/lib/rfq'
import { Button } from '../Button'

const noun: Record<Division, string> = { equipment: 'equipment', parts: 'spare parts', peripherals: 'peripherals' }

export function RailList({ division, tree, current }: { division: Division; tree: CategoryTree; current?: Category }) {
  const open = new Set(current ? tree.trail(current).map((c) => c.id) : [])
  const row = (c: Category, depth: number) => {
    const active = current?.id === c.id
    const kids = tree.childrenOf(c)
    return (
      <li key={c.id}>
        <Link
          href={tree.urlOf(c)}
          aria-current={active ? 'page' : undefined}
          className={`block rounded-md py-2 pr-3 text-[0.9375rem] transition-colors ${depth ? 'pl-7' : 'pl-3'} ${active ? 'bg-accent-tint font-semibold text-accent-text shadow-[inset_3px_0_0_var(--color-accent)]' : 'text-ink hover:bg-surface hover:text-accent-text'}`}
        >
          {c.name}
        </Link>
        {kids.length > 0 && open.has(c.id) && <ul>{kids.map((k) => row(k, depth + 1))}</ul>}
      </li>
    )
  }
  return (
    <>
      <ul>{tree.roots.map((c) => row(c, 0))}</ul>
      <Link href={divisions[division].base} className="mt-1 block px-3 py-2 text-sm font-semibold text-accent-text hover:text-dark-900">All {noun[division]} &rarr;</Link>
    </>
  )
}

export function CategoryRail({ division, tree, current, topic, before }: { division: Division; tree: CategoryTree; current?: Category; topic?: string; before?: ReactNode }) {
  return (
    <aside className="space-y-5">
      {before}
      <div className="hidden rounded-card border border-line bg-white p-3.5 lg:block">
        <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">Browse {noun[division]}</p>
        <nav aria-label={`Browse ${noun[division]}`}><RailList division={division} tree={tree} current={current} /></nav>
      </div>
      <details className="rounded-card border border-line bg-white lg:hidden">
        <summary className="cursor-pointer list-none px-4 py-3.5 text-[0.9375rem] font-semibold text-dark-900 [&::-webkit-details-marker]:hidden">Browse {noun[division]}</summary>
        <nav aria-label={`Browse ${noun[division]} (mobile)`} className="border-t border-line p-3"><RailList division={division} tree={tree} current={current} /></nav>
      </details>
      <div className="on-dark rounded-card bg-dark-900 p-5 text-white">
        <p className="font-heading text-lg font-bold">Can&apos;t find it?</p>
        <p className="mb-4 mt-1 text-sm text-on-dark">Tell us what you need.</p>
        <Button href={rfqHref({ topic })} size="sm">Send an enquiry</Button>
      </div>
    </aside>
  )
}
