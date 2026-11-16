'use client'

import Link from 'next/link'
import type { MouseEvent } from 'react'

type Props = {
  page: number
  totalPages: number
  /** Static category pages: "/page/2" links. Omit when `hrefFor` is given. */
  basePath?: string
  /** Filtered listings: link to the same state on another page. With `onSelect`, a normal click is handled without reloading. */
  hrefFor?: (n: number) => string
  onSelect?: (n: number) => void
}

export function Pagination({ page, totalPages, basePath = '', hrefFor, onSelect }: Props) {
  if (totalPages <= 1) return null
  const href = hrefFor ?? ((n: number) => (n === 1 ? basePath : `${basePath}/page/${n}`))
  const nums: number[] = []
  for (let n = Math.max(1, page - 2); n <= Math.min(totalPages, page + 2); n++) nums.push(n)
  const box = 'grid h-11 min-w-11 place-items-center rounded-control border px-3 text-[0.9375rem] font-semibold transition-colors'
  const click = (n: number) => (e: MouseEvent) => {
    if (!onSelect || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    onSelect(n)
  }
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && <Link href={href(page - 1)} rel="prev" onClick={click(page - 1)} className={`${box} border-line hover:border-dark-600`}>Previous</Link>}
      {nums.map((n) => (
        <Link key={n} href={href(n)} aria-label={`Page ${n}`} aria-current={n === page ? 'page' : undefined} onClick={click(n)} className={`${box} ${n === page ? 'border-accent bg-accent text-on-accent' : 'border-line hover:border-dark-600'}`}>{n}</Link>
      ))}
      {page < totalPages && <Link href={href(page + 1)} rel="next" onClick={click(page + 1)} className={`${box} border-line hover:border-dark-600`}>Next</Link>}
    </nav>
  )
}
