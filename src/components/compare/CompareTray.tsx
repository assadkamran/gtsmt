'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, X } from 'lucide-react'
import { MAX_COMPARE, clearCompare, dismissNotice, removeItem, startNew, useCompare, useNotice } from '@/lib/compare/store'

/**
 * Bottom bar showing what is selected for comparison. Appears once something is selected, stays out of the way on the
 * compare page itself and on the enquiry form (where it would cover the Continue button).
 */
export function CompareTray() {
  const pathname = usePathname()
  const { items, category } = useCompare()
  const notice = useNotice()
  const barRef = useRef<HTMLDivElement>(null)

  const hidden = pathname === '/compare' || pathname.startsWith('/request-a-quote')
  const visible = !hidden && (items.length > 0 || notice !== null)

  // Reserve room at the bottom of the page so the bar never covers the footer or the last row of results.
  useEffect(() => {
    const root = document.documentElement
    const el = barRef.current
    if (!visible || !el) {
      root.style.removeProperty('--compare-tray-h')
      return
    }
    const set = () => root.style.setProperty('--compare-tray-h', `${el.offsetHeight}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => {
      ro.disconnect()
      root.style.removeProperty('--compare-tray-h')
    }
  }, [visible])

  if (!visible) return null

  const n = items.length
  const ready = n >= 2
  const href = `/compare?items=${items.map((i) => i.id).join(',')}`
  const slots = Array.from({ length: MAX_COMPARE }, (_, i) => items[i] ?? null)

  return (
    <div ref={barRef} role="region" aria-label="Compare products" className="on-dark fixed inset-x-0 bottom-0 z-40 bg-dark-900 text-white shadow-[0_-10px_30px_rgba(7,11,22,0.35)]">
      {notice && (
        <div role="status" className="border-b border-dark-700 bg-dark-800">
          <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-5 gap-y-2 px-6 py-3 text-[0.9375rem] text-on-dark lg:px-10">
            <p className="min-w-0 flex-1">
              {notice.kind === 'full'
                ? `You can compare up to ${MAX_COMPARE} products at a time. Remove one to add another.`
                : `Your comparison is for ${notice.current}. Products from one category can be compared at a time, so ${notice.next} cannot be added to it.`}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {notice.kind === 'other-category' && (
                <button type="button" onClick={() => startNew(notice.pending.item, notice.pending.category)} className="min-h-10 font-semibold text-accent-on-dark underline underline-offset-2 hover:text-white">
                  Start a new comparison with this product
                </button>
              )}
              <button type="button" onClick={dismissNotice} className="min-h-10 font-semibold text-on-dark hover:text-white">Dismiss</button>
            </div>
          </div>
        </div>
      )}
      {n > 0 && (
        <div className="mx-auto flex max-w-page items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 lg:px-10">
          <div className="min-w-0">
            <p className="font-heading text-[0.9375rem] font-bold sm:text-[1.0625rem]">
              Compare<span className="sm:hidden"> ({n})</span>
            </p>
            <p aria-live="polite" className="hidden text-[0.8125rem] text-on-dark sm:block">
              {n} of {MAX_COMPARE} selected{category ? ` in ${category.name}` : ''}. {ready ? 'Saved on this device.' : 'Add one more to compare.'}
            </p>
          </div>

          <ul className="ml-1 hidden gap-2.5 md:flex" aria-label="Selected products">
            {slots.map((it, i) => (
              <li key={it?.id ?? `empty-${i}`}>
                {it ? (
                  <div className="relative h-12 w-16 overflow-hidden rounded-[7px] bg-placeholder">
                    {/* eslint-disable-next-line @next/next/no-img-element -- tiny thumbnail from storage, no optimiser needed */}
                    {it.image ? <img src={it.image} alt="" className="size-full object-contain p-1" /> : <span aria-hidden className="grid size-full place-items-center text-placeholder-text"><Camera className="size-4 opacity-70" strokeWidth={1.5} /></span>}
                    <button type="button" onClick={() => removeItem(it.id)} aria-label={`Remove ${it.title} from comparison`} className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-white/90 text-dark-900 hover:bg-white">
                      <X aria-hidden className="size-3" />
                    </button>
                  </div>
                ) : (
                  <div aria-hidden className="h-12 w-16 rounded-[7px] border-[1.5px] border-dashed border-dark-600" />
                )}
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <button type="button" onClick={clearCompare} className="min-h-11 px-2 text-[0.9375rem] font-semibold text-on-dark hover:text-white">Clear</button>
            {ready ? (
              <Link href={href} className="inline-flex h-11 items-center rounded-control bg-accent px-4 text-[0.9375rem] font-semibold text-on-accent transition-colors hover:bg-accent-hover sm:h-12 sm:px-6">
                <span className="sm:hidden">Compare now</span>
                <span className="hidden sm:inline">Compare {n} products</span>
              </Link>
            ) : (
              <span aria-disabled className="inline-flex h-11 items-center rounded-control bg-dark-700 px-4 text-[0.9375rem] font-semibold text-on-dark-muted sm:h-12 sm:px-6">
                <span className="sm:hidden">Add one more</span>
                <span className="hidden sm:inline">Compare products</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
