'use client'

import { useRouter } from 'next/navigation'
import { useId, useMemo, useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'

type Brand = { id: string; name: string; slug: string; hub?: boolean }
type Model = { id: string; name: string; slug: string; brandId: string }

const field = 'h-12 w-full rounded-control border border-line bg-white px-3 text-base text-ink placeholder:text-muted focus-visible:outline-accent-text disabled:bg-surface disabled:text-muted'
const lab = 'mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted'

export function PartsSearch({ brands, models, className = '' }: { brands: Brand[]; models: Model[]; className?: string }) {
  const router = useRouter()
  const id = useId()
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [q, setQ] = useState('')
  const available = useMemo(() => models.filter((m) => m.brandId === brand), [models, brand])
  const hasCatalogue = brands.length > 0

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const term = q.trim()
    if (hasCatalogue) {
      const b = brands.find((x) => x.id === brand)
      const m = models.find((x) => x.id === model)
      // A model means "parts that fit this machine". A part number or keyword means a search. A brand alone opens its page.
      if (b && m && !term) return router.push(`/spare-parts/brands/${b.slug}/${m.slug}`)
      if (term) return router.push(`/search?q=${encodeURIComponent(term)}${b ? `&brand=${b.id}` : ''}`)
      if (b?.hub) return router.push(`/spare-parts/brands/${b.slug}`)
      return router.push('/spare-parts/brands')
    }
    const text = [brand, model, term].map((x) => x.trim()).filter(Boolean).join(' ')
    router.push(text ? `/search?q=${encodeURIComponent(text)}` : '/search')
  }

  return (
    <form onSubmit={onSubmit} role="search" aria-label="Search spare parts" className={`grid gap-3 rounded-card bg-white p-4 text-ink md:grid-cols-[1fr_1fr_1.5fr_auto] md:items-end md:p-5 ${className}`}>
      <div>
        <label htmlFor={`${id}-b`} className={lab}>Brand</label>
        {hasCatalogue ? (
          <select id={`${id}-b`} className={field} value={brand} onChange={(e) => { setBrand(e.target.value); setModel('') }}>
            <option value="">All brands</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        ) : (
          <input id={`${id}-b`} className={field} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. machine brand" autoComplete="off" />
        )}
      </div>
      <div>
        <label htmlFor={`${id}-m`} className={lab}>Machine model</label>
        {hasCatalogue ? (
          <select id={`${id}-m`} className={field} value={model} disabled={!brand} onChange={(e) => setModel(e.target.value)}>
            <option value="">{brand ? 'All models' : 'Choose a brand first'}</option>
            {available.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        ) : (
          <input id={`${id}-m`} className={field} value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. machine model" autoComplete="off" />
        )}
      </div>
      <div>
        <label htmlFor={`${id}-q`} className={lab}>Part number or keyword</label>
        <input id={`${id}-q`} className={field} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Part number, feeder size, nozzle type" autoComplete="off" />
      </div>
      <button type="submit" className="flex h-12 items-center justify-center gap-2 rounded-control bg-accent px-6 font-semibold text-on-accent transition-colors hover:bg-accent-hover">
        <Search aria-hidden className="size-[1.125rem]" /> Search parts
      </button>
    </form>
  )
}
