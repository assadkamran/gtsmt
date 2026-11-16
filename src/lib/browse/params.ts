import { parseNumber } from '../specs'
import { emptyState } from './engine'
import { DEFAULT_SORT, isSortKey, type FacetDefs, type FilterState } from './types'

/**
 * Filter state <-> URL query string. One definition used by the browser (to write and read the address bar)
 * and by the API (to read the request), so a shared link means the same thing everywhere.
 *
 *   ?brand=3&origin=genuine-oem&model=12&s.tape_width=8+mm&s.feed_pitch.min=2&s.feed_pitch.max=8&sort=-title&page=2
 *
 * Anything unknown, malformed or no longer offered is dropped rather than trusted.
 */

const MAX_VALUES = 40

const unique = <T,>(xs: T[]) => [...new Set(xs)]
const toIds = (raw: string[]) =>
  unique(raw.slice(0, MAX_VALUES).map((v) => (/^\d{1,9}$/.test(v) ? Number(v) : NaN)).filter((n) => Number.isInteger(n) && n > 0))

export function parseState(sp: URLSearchParams, defs: FacetDefs): FilterState {
  const s = emptyState()

  const brandIds = new Set(defs.brands.map((b) => b.id))
  s.brands = toIds(sp.getAll('brand')).filter((id) => brandIds.has(id))

  const origins = new Set(defs.origins.map((o) => o.value))
  s.origins = unique(sp.getAll('origin').slice(0, MAX_VALUES)).filter((v) => origins.has(v))

  const modelIds = new Set(defs.models.map((m) => m.id))
  s.models = toIds(sp.getAll('model')).filter((id) => modelIds.has(id))

  for (const a of defs.attributes) {
    if (a.type === 'number') {
      const min = parseNumber(sp.get(`s.${a.key}.min`) ?? '')
      const max = parseNumber(sp.get(`s.${a.key}.max`) ?? '')
      if (min != null || max != null) s.ranges[a.id] = { ...(min != null ? { min } : {}), ...(max != null ? { max } : {}) }
    } else {
      const byLower = new Map(a.choices.map((c) => [c.toLowerCase(), c]))
      const picked = unique(
        sp.getAll(`s.${a.key}`).slice(0, MAX_VALUES).map((v) => byLower.get(v.trim().toLowerCase())).filter((v): v is string => Boolean(v)),
      )
      if (picked.length) s.choices[a.id] = picked
    }
  }

  const sort = sp.get('sort')
  s.sort = isSortKey(sort) ? sort : DEFAULT_SORT
  const page = Number(sp.get('page'))
  s.page = Number.isInteger(page) && page >= 1 && page <= 10000 ? page : 1
  return s
}

/** Canonical ordering, so the same selection always gives the same URL (and the same cache key). */
export function stateToParams(s: FilterState, defs: FacetDefs): URLSearchParams {
  const q = new URLSearchParams()
  for (const id of [...s.brands].sort((a, b) => a - b)) q.append('brand', String(id))
  for (const o of defs.origins) if (s.origins.includes(o.value)) q.append('origin', o.value)
  for (const id of [...s.models].sort((a, b) => a - b)) q.append('model', String(id))
  for (const a of defs.attributes) {
    if (a.type === 'number') {
      const r = s.ranges[a.id]
      if (r?.min != null) q.set(`s.${a.key}.min`, String(r.min))
      if (r?.max != null) q.set(`s.${a.key}.max`, String(r.max))
    } else {
      const picked = s.choices[a.id] ?? []
      for (const c of a.choices) if (picked.includes(c)) q.append(`s.${a.key}`, c)
    }
  }
  if (s.sort !== DEFAULT_SORT) q.set('sort', s.sort)
  if (s.page > 1) q.set('page', String(s.page))
  return q
}

/** True when the address carries any listing state (so the page must ask the API instead of showing its static page). */
export function hasBrowseParams(sp: URLSearchParams): boolean {
  for (const k of sp.keys()) if (k === 'brand' || k === 'origin' || k === 'model' || k === 'sort' || k === 'page' || k.startsWith('s.')) return true
  return false
}
