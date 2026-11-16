import type { BrowseProduct, BrowseResult, Dataset, FacetCounts, FacetDefs, FilterState, SortKey } from './types'
import { DEFAULT_SORT } from './types'

export function emptyState(over: Partial<FilterState> = {}): FilterState {
  return { brands: [], origins: [], models: [], choices: {}, ranges: {}, sort: DEFAULT_SORT, page: 1, ...over }
}

/** How many individual selections are active. Drives the "Filters (2)" badge. */
export function activeCount(s: FilterState): number {
  let n = s.brands.length + s.origins.length + s.models.length
  for (const v of Object.values(s.choices)) n += v.length
  for (const r of Object.values(s.ranges)) if (r.min != null || r.max != null) n += 1
  return n
}

type Skip = { group: 'brand' } | { group: 'origin' } | { group: 'model' } | { group: 'attr'; id: number } | null

/** Within one filter group the options are OR. Different groups are AND. `skip` leaves one group out (used for facet counts). */
export function matches(p: BrowseProduct, s: FilterState, skip: Skip = null): boolean {
  if (s.brands.length && skip?.group !== 'brand' && !(p.brandId != null && s.brands.includes(p.brandId))) return false
  if (s.origins.length && skip?.group !== 'origin' && !(p.origin && s.origins.includes(p.origin))) return false
  if (s.models.length && skip?.group !== 'model' && !p.modelIds.some((id) => s.models.includes(id))) return false
  for (const [key, values] of Object.entries(s.choices)) {
    if (!values.length) continue
    const id = Number(key)
    if (skip?.group === 'attr' && skip.id === id) continue
    const v = p.specs[id]?.v
    if (v === undefined || !values.includes(v)) return false
  }
  for (const [key, r] of Object.entries(s.ranges)) {
    if (r.min == null && r.max == null) continue
    const id = Number(key)
    if (skip?.group === 'attr' && skip.id === id) continue
    const n = p.specs[id]?.n
    if (n == null) return false
    if (r.min != null && n < r.min) return false
    if (r.max != null && n > r.max) return false
  }
  return true
}

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

export function comparator(sort: SortKey): (a: BrowseProduct, b: BrowseProduct) => number {
  switch (sort) {
    case '-title':
      return (a, b) => collator.compare(b.title, a.title) || a.id - b.id
    case 'newest':
      return (a, b) => b.created - a.created || collator.compare(a.title, b.title) || a.id - b.id
    case 'part':
      return (a, b) => {
        if (a.partNumber && !b.partNumber) return -1
        if (!a.partNumber && b.partNumber) return 1
        return collator.compare(a.partNumber ?? '', b.partNumber ?? '') || collator.compare(a.title, b.title) || a.id - b.id
      }
    default:
      return (a, b) => collator.compare(a.title, b.title) || a.id - b.id
  }
}

export function computeCounts(products: BrowseProduct[], defs: FacetDefs, s: FilterState): FacetCounts {
  const counts: FacetCounts = { brands: {}, origins: {}, models: {}, choices: {} }

  if (defs.brands.length) {
    for (const p of products) if (matches(p, s, { group: 'brand' }) && p.brandId != null) counts.brands[p.brandId] = (counts.brands[p.brandId] ?? 0) + 1
  }
  if (defs.origins.length) {
    for (const p of products) if (matches(p, s, { group: 'origin' }) && p.origin) counts.origins[p.origin] = (counts.origins[p.origin] ?? 0) + 1
  }
  if (defs.models.length) {
    for (const p of products) if (matches(p, s, { group: 'model' })) for (const m of p.modelIds) counts.models[m] = (counts.models[m] ?? 0) + 1
  }
  for (const a of defs.attributes) {
    if (a.type === 'number') continue
    const byValue: Record<string, number> = {}
    for (const p of products) {
      if (!matches(p, s, { group: 'attr', id: a.id })) continue
      const v = p.specs[a.id]?.v
      if (v !== undefined) byValue[v] = (byValue[v] ?? 0) + 1
    }
    counts.choices[a.id] = byValue
  }
  return counts
}

export function runBrowse(ds: Dataset, state: FilterState, pageSize: number): BrowseResult {
  const matched = ds.products.filter((p) => matches(p, state)).sort(comparator(state.sort))
  const totalDocs = matched.length
  const totalPages = Math.max(1, Math.ceil(totalDocs / pageSize))
  const page = Math.min(Math.max(1, Math.floor(state.page) || 1), totalPages)
  return {
    items: matched.slice((page - 1) * pageSize, page * pageSize),
    totalDocs,
    totalPages,
    page,
    counts: computeCounts(ds.products, ds.defs, state),
  }
}
