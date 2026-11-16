'use client'

import { addItem, removeItem, useCompare, type CompareCategory, type CompareItem } from '@/lib/compare/store'
import { Tick } from '../ui/Tick'

/** "Compare" checkbox on a product card. Selection lives in the compare store, shown in the tray. */
export function CompareToggle({ item, category }: { item: CompareItem; category: CompareCategory }) {
  const { items } = useCompare()
  const checked = items.some((i) => i.id === item.id)
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[0.9375rem] font-medium text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => (checked ? removeItem(item.id) : addItem(item, category))}
        className="peer sr-only"
      />
      <Tick />
      <span>
        Compare<span className="sr-only"> {item.title}</span>
      </span>
    </label>
  )
}

/** Button form for the product page. */
export function AddToCompare({ item, category }: { item: CompareItem; category: CompareCategory }) {
  const { items } = useCompare()
  const checked = items.some((i) => i.id === item.id)
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => (checked ? removeItem(item.id) : addItem(item, category))}
      className="inline-flex h-11 items-center justify-center gap-2.5 rounded-control border-[1.5px] border-line px-4 text-[0.9375rem] font-semibold text-dark-900 transition-colors hover:border-dark-600 aria-pressed:border-accent aria-pressed:bg-accent-tint aria-pressed:text-accent-text"
    >
      <span
        aria-hidden
        className={`grid size-[1.125rem] place-items-center rounded-[4px] border-[1.5px] ${checked ? 'border-accent bg-accent text-on-accent' : 'border-[#6b7794] bg-white text-transparent'}`}
      >
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
      {checked ? 'Added to compare' : 'Add to compare'}
    </button>
  )
}
