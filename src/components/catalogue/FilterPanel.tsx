'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { parseNumber } from '@/lib/specs'
import type { AttributeDef } from '@/lib/browse/types'
import { Tick } from '../ui/Tick'
import { useBrowse } from './BrowseProvider'

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

/* ------------------------------------------------------------------ applied filters */
export function AppliedChips({ className = '' }: { className?: string }) {
  const { chips } = useBrowse()
  if (!chips.length) return null
  return (
    <ul aria-label="Applied filters" className={`flex flex-wrap gap-2 ${className}`}>
      {chips.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={c.remove}
            aria-label={`Remove filter: ${c.label}`}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-surface py-1 pl-3 pr-2.5 text-sm font-semibold text-dark-900 transition-colors hover:border-dark-600"
          >
            {c.label}
            <X aria-hidden className="size-3.5 text-muted" />
          </button>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------ one checkbox option */
function Option({ id, label, count, checked, onChange }: { id: string; label: string; count: number; checked: boolean; onChange: () => void }) {
  const disabled = count === 0 && !checked
  return (
    <label htmlFor={id} className={`flex items-center gap-3 py-2 text-[0.9375rem] leading-6 lg:py-1.5 ${disabled ? 'cursor-not-allowed text-muted/70' : 'cursor-pointer text-ink'}`}>
      <input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={onChange} className="peer sr-only" />
      <Tick />
      <span className="min-w-0 flex-1">
        {label}
        <span className="sr-only">, {count} {plural(count, 'product', 'products')}</span>
      </span>
      <span aria-hidden className="text-sm tabular-nums text-muted">{count}</span>
    </label>
  )
}

type Opt = { key: string; label: string; count: number }

/** A short list with "Show all" for long ones, and a find box when it is very long. */
function OptionList({ idPrefix, options, selected, onToggle, noun }: { idPrefix: string; options: Opt[]; selected: Set<string>; onToggle: (key: string) => void; noun: string }) {
  const [all, setAll] = useState(false)
  const [q, setQ] = useState('')
  const LIMIT = 6
  const needle = q.trim().toLowerCase()
  const matching = needle ? options.filter((o) => o.label.toLowerCase().includes(needle)) : options
  const shown = all || needle ? matching : matching.filter((o, i) => i < LIMIT || selected.has(o.key))
  const hidden = matching.length - shown.length
  return (
    <div>
      {options.length > 10 && (
        <div className="mb-2">
          <label htmlFor={`${idPrefix}-find`} className="sr-only">Find a {noun}</label>
          <input
            id={`${idPrefix}-find`}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Find a ${noun}`}
            autoComplete="off"
            className="h-10 w-full rounded-control border border-field bg-white px-3 text-base text-ink placeholder:text-muted hover:border-dark-600 lg:text-[0.9375rem]"
          />
        </div>
      )}
      {shown.map((o) => (
        <Option key={o.key} id={`${idPrefix}-${o.key.replace(/[^a-z0-9]+/gi, '-')}`} label={o.label} count={o.count} checked={selected.has(o.key)} onChange={() => onToggle(o.key)} />
      ))}
      {needle && matching.length === 0 && <p className="py-1.5 text-[0.9375rem] text-muted">Nothing matches &ldquo;{q.trim()}&rdquo;.</p>}
      {!needle && hidden > 0 && (
        <button type="button" onClick={() => setAll(true)} className="mt-1 py-1.5 text-[0.9375rem] font-semibold text-accent-text hover:underline">Show all {matching.length}</button>
      )}
      {!needle && all && options.length > LIMIT && (
        <button type="button" onClick={() => setAll(false)} className="mt-1 py-1.5 text-[0.9375rem] font-semibold text-accent-text hover:underline">Show fewer</button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ machine model: one at a time */
function ModelSelect({ id }: { id: string }) {
  const { defs, state, result, setModel } = useBrowse()
  const selected = state.models[0] ?? null
  const byBrand = new Map<string, typeof defs.models>()
  for (const m of defs.models) byBrand.set(m.brandName || 'Other', [...(byBrand.get(m.brandName || 'Other') ?? []), m])
  return (
    <div>
      <div className="relative">
        <select
          id={id}
          value={selected ?? ''}
          onChange={(e) => setModel(e.target.value ? Number(e.target.value) : null)}
          className="h-11 w-full appearance-none rounded-control border border-field bg-white pl-3 pr-9 text-base text-ink hover:border-dark-600 lg:text-[0.9375rem]"
        >
          <option value="">Any machine</option>
          {[...byBrand].map(([brand, models]) => (
            <optgroup key={brand} label={brand}>
              {models.map((m) => {
                const n = result.counts.models[m.id] ?? 0
                return <option key={m.id} value={m.id} disabled={n === 0 && selected !== m.id}>{m.name} ({n})</option>
              })}
            </optgroup>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </div>
      <p className="mt-1.5 text-[0.8125rem] leading-snug text-muted">Shows only products verified to fit this model.</p>
    </div>
  )
}

/* ------------------------------------------------------------------ number range */
function RangeFields({ a, idPrefix }: { a: AttributeDef; idPrefix: string }) {
  const { state, setRange } = useBrowse()
  const r = state.ranges[a.id]
  const [lo, setLo] = useState(r?.min != null ? String(r.min) : '')
  const [hi, setHi] = useState(r?.max != null ? String(r.max) : '')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Keep the text in step when the range is changed elsewhere (clear all, chip, back button) without disturbing typing.
  useEffect(() => {
    setLo((cur) => ((parseNumber(cur) ?? null) === (r?.min ?? null) ? cur : r?.min != null ? String(r.min) : ''))
    setHi((cur) => ((parseNumber(cur) ?? null) === (r?.max ?? null) ? cur : r?.max != null ? String(r.max) : ''))
  }, [r?.min, r?.max])
  useEffect(() => () => clearTimeout(timer.current), [])

  const commit = (l: string, h: string) => {
    clearTimeout(timer.current)
    let min = parseNumber(l) ?? undefined
    let max = parseNumber(h) ?? undefined
    if (min != null && max != null && min > max) [min, max] = [max, min]
    if ((min ?? null) === (r?.min ?? null) && (max ?? null) === (r?.max ?? null)) return
    setRange(a.id, { min, max })
  }
  const later = (l: string, h: string) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => commit(l, h), 500)
  }
  const field = 'h-11 w-full rounded-control border border-field bg-white px-3 text-base text-ink placeholder:text-muted hover:border-dark-600 lg:text-[0.9375rem]'
  const unit = a.unit ? ` ${a.unit}` : ''
  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label htmlFor={`${idPrefix}-min`} className="mb-1 block text-[0.8125rem] font-semibold text-muted">From</label>
          <input id={`${idPrefix}-min`} type="text" inputMode="decimal" autoComplete="off" placeholder={String(a.min)} value={lo} className={field}
            onChange={(e) => { setLo(e.target.value); later(e.target.value, hi) }}
            onBlur={() => commit(lo, hi)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(lo, hi) } }} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-max`} className="mb-1 block text-[0.8125rem] font-semibold text-muted">To</label>
          <input id={`${idPrefix}-max`} type="text" inputMode="decimal" autoComplete="off" placeholder={String(a.max)} value={hi} className={field}
            onChange={(e) => { setHi(e.target.value); later(lo, e.target.value) }}
            onBlur={() => commit(lo, hi)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(lo, hi) } }} />
        </div>
      </div>
      <p className="mt-1.5 text-[0.8125rem] leading-snug text-muted">Available: {a.min} to {a.max}{unit}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ the groups */
type Group = { id: string; title: string; active: boolean; body: ReactNode }

function Shell({ title, collapsible, open, children }: { title: string; collapsible: boolean; open: boolean; children: ReactNode }) {
  if (collapsible) {
    return (
      <details open={open} className="group/d border-b border-line">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-heading text-[0.9375rem] font-bold text-dark-900 [&::-webkit-details-marker]:hidden">
          {title}
          <ChevronDown aria-hidden className="size-4 text-muted transition-transform group-open/d:rotate-180" />
        </summary>
        <fieldset className="min-w-0 pb-3">
          <legend className="sr-only">{title}</legend>
          {children}
        </fieldset>
      </details>
    )
  }
  return (
    <fieldset className="min-w-0 border-t border-line py-4">
      <legend className="float-left mb-2 w-full p-0 font-heading text-[0.9375rem] font-bold text-dark-900">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  )
}

const FIRST_VISIBLE = 4

function FilterGroups({ idPrefix, collapsible = false }: { idPrefix: string; collapsible?: boolean }) {
  const c = useBrowse()
  const { defs, state, result } = c
  const [more, setMore] = useState(false)

  const groups: Group[] = []
  if (defs.brands.length) {
    groups.push({
      id: 'brand',
      title: 'Brand',
      active: state.brands.length > 0,
      body: (
        <OptionList idPrefix={`${idPrefix}-brand`} noun="brand" selected={new Set(state.brands.map(String))} onToggle={(k) => c.toggleBrand(Number(k))}
          options={defs.brands.map((b) => ({ key: String(b.id), label: b.name, count: result.counts.brands[b.id] ?? 0 }))} />
      ),
    })
  }
  if (defs.models.length) groups.push({ id: 'model', title: 'Machine model', active: state.models.length > 0, body: <ModelSelect id={`${idPrefix}-model`} /> })
  if (defs.origins.length) {
    groups.push({
      id: 'origin',
      title: 'Condition',
      active: state.origins.length > 0,
      body: (
        <OptionList idPrefix={`${idPrefix}-origin`} noun="condition" selected={new Set(state.origins)} onToggle={c.toggleOrigin}
          options={defs.origins.map((o) => ({ key: o.value, label: o.label, count: result.counts.origins[o.value] ?? 0 }))} />
      ),
    })
  }
  for (const a of defs.attributes) {
    const active = a.type === 'number' ? Boolean(state.ranges[a.id]) : (state.choices[a.id]?.length ?? 0) > 0
    groups.push({
      id: `a-${a.id}`,
      title: a.type === 'number' && a.unit ? `${a.label} (${a.unit})` : a.label,
      active,
      body:
        a.type === 'number' ? (
          <RangeFields a={a} idPrefix={`${idPrefix}-a${a.id}`} />
        ) : (
          <OptionList idPrefix={`${idPrefix}-a${a.id}`} noun={a.label.toLowerCase()} selected={new Set(state.choices[a.id] ?? [])} onToggle={(v) => c.toggleChoice(a.id, v)}
            options={a.choices.map((v) => ({ key: v, label: v, count: result.counts.choices[a.id]?.[v] ?? 0 }))} />
        ),
    })
  }

  const visible = collapsible ? groups : groups.filter((g, i) => i < FIRST_VISIBLE || more || g.active)
  const hiddenCount = groups.length - visible.length
  return (
    <div>
      {visible.map((g, i) => (
        <Shell key={g.id} title={g.title} collapsible={collapsible} open={i === 0 || g.active}>{g.body}</Shell>
      ))}
      {!collapsible && hiddenCount > 0 && (
        <button type="button" onClick={() => setMore(true)} className="w-full border-t border-line pt-3.5 text-left text-[0.9375rem] font-semibold text-accent-text hover:underline">
          Show {hiddenCount} more {plural(hiddenCount, 'filter', 'filters')}
        </button>
      )}
      {!collapsible && more && groups.length > FIRST_VISIBLE && hiddenCount === 0 && !groups.slice(FIRST_VISIBLE).some((g) => g.active) && (
        <button type="button" onClick={() => setMore(false)} className="w-full border-t border-line pt-3.5 text-left text-[0.9375rem] font-semibold text-accent-text hover:underline">Show fewer filters</button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ desktop card */
export function FilterCard() {
  const c = useBrowse()
  const uid = useId()
  if (!c.hasFacets) return null
  return (
    <section aria-labelledby={`${uid}-h`} className="hidden rounded-card border border-line bg-white p-5 pb-4 lg:block">
      <div className="flex items-center justify-between gap-3">
        <h2 id={`${uid}-h`} className="font-heading text-lg font-bold text-dark-900">Filters</h2>
        {c.count > 0 && <button type="button" onClick={c.clearAll} className="text-sm font-semibold text-accent-text hover:underline">Clear all</button>}
      </div>
      {c.chips.length > 0 && <AppliedChips className="mt-3.5" />}
      <div className="mt-3"><FilterGroups idPrefix={`${uid}d`} /></div>
    </section>
  )
}

/* ------------------------------------------------------------------ phone: bottom sheet */
export function FilterSheet() {
  const c = useBrowse()
  const ref = useRef<HTMLDialogElement>(null)
  const uid = useId()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (c.sheetOpen && !el.open) {
      el.showModal()
      document.documentElement.style.overflow = 'hidden'
    } else if (!c.sheetOpen && el.open) {
      el.close()
    }
  }, [c.sheetOpen])

  // Rotating a tablet or resizing past the breakpoint hides the sheet: close it properly so the page can scroll again.
  const { setSheetOpen } = c
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => { if (mq.matches) setSheetOpen(false) }
    mq.addEventListener('change', onChange)
    return () => {
      mq.removeEventListener('change', onChange)
      document.documentElement.style.overflow = ''
    }
  }, [setSheetOpen])

  if (!c.hasFacets) return null
  const n = c.result.totalDocs
  return (
    <dialog
      ref={ref}
      aria-labelledby={`${uid}-t`}
      onClose={() => { document.documentElement.style.overflow = ''; c.setSheetOpen(false) }}
      onClick={(e) => { if (e.target === e.currentTarget) c.setSheetOpen(false) }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-dark-900/60 lg:hidden"
    >
      <div className="absolute inset-x-0 bottom-0 top-14 flex flex-col rounded-t-[18px] bg-white shadow-[0_-12px_40px_rgba(11,17,36,0.25)]">
        <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-[#c9d2e1]" />
        <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-3">
          <h2 id={`${uid}-t`} className="font-heading text-lg font-bold text-dark-900">Filters</h2>
          <div className="flex items-center gap-1">
            {c.count > 0 && <button type="button" onClick={c.clearAll} className="min-h-11 px-2 text-sm font-semibold text-accent-text">Clear all</button>}
            <button type="button" onClick={() => c.setSheetOpen(false)} aria-label="Close filters" className="grid size-11 place-items-center rounded-control text-dark-900 hover:bg-surface"><X aria-hidden className="size-5" /></button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4"><FilterGroups idPrefix={`${uid}m`} collapsible /></div>
        <div className="shrink-0 border-t border-line bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={() => c.setSheetOpen(false)} className="h-12 w-full rounded-control bg-accent text-base font-semibold text-on-accent transition-colors hover:bg-accent-hover">
            Show {n} {plural(n, 'result', 'results')}
          </button>
        </div>
      </div>
    </dialog>
  )
}
