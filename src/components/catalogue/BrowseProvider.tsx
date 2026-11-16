'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { useRouter } from 'next/navigation'
import { activeCount, emptyState } from '@/lib/browse/engine'
import { hasBrowseParams, parseState, stateToParams } from '@/lib/browse/params'
import { PAGE_SIZE, type BrowseResult, type FacetDefs, type FilterState, type SortKey } from '@/lib/browse/types'

/**
 * State for a category listing: which filters are on, the current results, and the address bar.
 *
 * The category page itself stays static (fast, indexable). It ships with the unfiltered first page. When the address
 * carries filters, or the visitor changes one, this asks /api/catalogue and swaps the results in. The filters live in
 * the URL, so any filtered view can be bookmarked or sent to a colleague.
 */

export type Chip = { id: string; label: string; remove: () => void }

type Ctx = {
  defs: FacetDefs
  state: FilterState
  result: BrowseResult
  loading: boolean
  /** True while a link with filters in it is being resolved, so the unfiltered page is not shown by mistake. */
  skeleton: boolean
  failed: boolean
  /** Still showing the static "/page/N" listing, so pagination uses real page links. */
  pathMode: boolean
  hasFacets: boolean
  totalInCategory: number
  categoryName: string
  /** Set when products in this category can be compared; shows the Compare checkbox on cards. */
  compare: { id: number; name: string; href: string } | null
  rfqHref: string
  basePath: string
  count: number
  chips: Chip[]
  headingRef: RefObject<HTMLHeadingElement | null>
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  toggleBrand: (id: number) => void
  toggleOrigin: (value: string) => void
  setModel: (id: number | null) => void
  toggleChoice: (attrId: number, value: string) => void
  setRange: (attrId: number, range: { min?: number; max?: number }) => void
  setSort: (sort: SortKey) => void
  goPage: (n: number) => void
  pageHref: (n: number) => string
  clearAll: () => void
  retry: () => void
}

const BrowseContext = createContext<Ctx | null>(null)

export function useBrowse(): Ctx {
  const ctx = useContext(BrowseContext)
  if (!ctx) throw new Error('useBrowse must be used inside <BrowseProvider>')
  return ctx
}

const toggle = <T,>(list: T[], v: T): T[] => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

export function BrowseProvider({
  categoryId,
  categoryName,
  basePath,
  page,
  defs,
  initial,
  totalInCategory,
  compare,
  rfqHref,
  children,
}: {
  categoryId: number
  categoryName: string
  basePath: string
  page: number
  defs: FacetDefs
  initial: BrowseResult
  totalInCategory: number
  compare: { id: number; name: string; href: string } | null
  rfqHref: string
  children: ReactNode
}) {
  const router = useRouter()
  const [state, setStateRaw] = useState<FilterState>(() => emptyState({ page }))
  const stateRef = useRef(state)
  const [result, setResult] = useState<BrowseResult>(initial)
  const [loading, setLoading] = useState(false)
  const [skeleton, setSkeleton] = useState(false)
  const [failed, setFailed] = useState(false)
  const [pathMode, setPathMode] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const controller = useRef<AbortController | null>(null)
  const focusResults = useRef(false)

  const setState = useCallback((next: FilterState) => {
    stateRef.current = next
    setStateRaw(next)
  }, [])

  const writeUrl = useCallback(
    (next: FilterState) => {
      const qs = stateToParams(next, defs).toString()
      window.history.replaceState(window.history.state, '', basePath + (qs ? `?${qs}` : ''))
    },
    [basePath, defs],
  )

  const load = useCallback(
    async (next: FilterState) => {
      controller.current?.abort()
      const ac = new AbortController()
      controller.current = ac
      setLoading(true)
      setFailed(false)
      try {
        const q = stateToParams(next, defs)
        q.set('category', String(categoryId))
        q.set('pageSize', String(PAGE_SIZE))
        const res = await fetch(`/api/catalogue?${q.toString()}`, { signal: ac.signal, headers: { accept: 'application/json' } })
        if (!res.ok) throw new Error(`catalogue ${res.status}`)
        const data = (await res.json()) as BrowseResult
        if (ac.signal.aborted) return
        setResult(data)
        setSkeleton(false)
        if (data.page !== next.page) {
          // The page asked for no longer exists (products were removed). Land on the last one and fix the address.
          const fixed = { ...next, page: data.page }
          setState(fixed)
          writeUrl(fixed)
        }
      } catch {
        if (ac.signal.aborted) return
        setFailed(true)
        setSkeleton(false)
      } finally {
        if (controller.current === ac) setLoading(false)
      }
    },
    [categoryId, defs, setState, writeUrl],
  )

  const apply = useCallback(
    (next: FilterState, focus = false) => {
      setState(next)
      setPathMode(false)
      focusResults.current = focus
      if (window.location.pathname !== basePath) {
        // Leaving a "/page/N" address: go to the category's own address with the filters in it. That page reads them on arrival.
        const qs = stateToParams(next, defs).toString()
        router.replace(basePath + (qs ? `?${qs}` : ''), { scroll: false })
        return
      }
      writeUrl(next)
      void load(next)
    },
    [basePath, defs, load, router, setState, writeUrl],
  )

  // A shared link: filters are in the address, so ask for them instead of showing the unfiltered static page.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    if (!hasBrowseParams(sp)) return
    const next = parseState(sp, defs)
    setState(next)
    setPathMode(false)
    setSkeleton(true)
    void load(next)
    return () => controller.current?.abort()
    // Runs once when the listing appears; later changes go through apply().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onPop = () => {
      const sp = new URLSearchParams(window.location.search)
      const next = hasBrowseParams(sp) ? parseState(sp, defs) : emptyState()
      setState(next)
      setPathMode(false)
      void load(next)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [defs, load, setState])

  // After a page change or a removed filter chip, put keyboard focus and the viewport back on the results.
  useEffect(() => {
    if (loading || !focusResults.current) return
    focusResults.current = false
    const h = headingRef.current
    if (!h) return
    h.focus({ preventScroll: true })
    h.scrollIntoView({ block: 'start' })
  }, [loading, result])

  const act = useMemo(() => {
    const cur = () => stateRef.current
    return {
      toggleBrand: (id: number) => apply({ ...cur(), brands: toggle(cur().brands, id), page: 1 }),
      toggleOrigin: (value: string) => apply({ ...cur(), origins: toggle(cur().origins, value), page: 1 }),
      setModel: (id: number | null) => apply({ ...cur(), models: id == null ? [] : [id], page: 1 }),
      toggleChoice: (attrId: number, value: string) => {
        const next = toggle(cur().choices[attrId] ?? [], value)
        const choices = { ...cur().choices }
        if (next.length) choices[attrId] = next
        else delete choices[attrId]
        apply({ ...cur(), choices, page: 1 })
      },
      setRange: (attrId: number, range: { min?: number; max?: number }) => {
        const ranges = { ...cur().ranges }
        if (range.min == null && range.max == null) delete ranges[attrId]
        else ranges[attrId] = { ...(range.min != null ? { min: range.min } : {}), ...(range.max != null ? { max: range.max } : {}) }
        apply({ ...cur(), ranges, page: 1 })
      },
      setSort: (sort: SortKey) => apply({ ...cur(), sort, page: 1 }),
      goPage: (n: number) => apply({ ...cur(), page: n }, true),
      clearAll: () => apply(emptyState({ sort: cur().sort }), true),
      retry: () => void load(cur()),
    }
  }, [apply, load])

  const chips = useMemo<Chip[]>(() => {
    const out: Chip[] = []
    const withFocus = (fn: () => void) => () => {
      fn()
      focusResults.current = true
    }
    for (const id of state.brands) {
      const b = defs.brands.find((x) => x.id === id)
      if (b) out.push({ id: `brand-${id}`, label: `Brand: ${b.name}`, remove: withFocus(() => act.toggleBrand(id)) })
    }
    for (const v of state.origins) {
      const o = defs.origins.find((x) => x.value === v)
      if (o) out.push({ id: `origin-${v}`, label: o.label, remove: withFocus(() => act.toggleOrigin(v)) })
    }
    for (const id of state.models) {
      const m = defs.models.find((x) => x.id === id)
      if (m) out.push({ id: `model-${id}`, label: `Fits: ${m.brandName ? `${m.brandName} ` : ''}${m.name}`, remove: withFocus(() => act.setModel(null)) })
    }
    for (const a of defs.attributes) {
      for (const v of state.choices[a.id] ?? []) out.push({ id: `a-${a.id}-${v}`, label: `${a.label}: ${v}`, remove: withFocus(() => act.toggleChoice(a.id, v)) })
      const r = state.ranges[a.id]
      if (r && (r.min != null || r.max != null)) {
        const unit = a.unit ? ` ${a.unit}` : ''
        const text = r.min != null && r.max != null ? (r.min === r.max ? `${r.min}${unit}` : `${r.min} to ${r.max}${unit}`) : r.min != null ? `${r.min}${unit} or more` : `up to ${r.max}${unit}`
        out.push({ id: `r-${a.id}`, label: `${a.label}: ${text}`, remove: withFocus(() => act.setRange(a.id, {})) })
      }
    }
    return out
  }, [state, defs, act])

  const pageHref = useCallback(
    (n: number) => {
      const qs = stateToParams({ ...stateRef.current, page: n }, defs).toString()
      return basePath + (qs ? `?${qs}` : '')
    },
    [basePath, defs],
  )

  const value: Ctx = {
    defs,
    state,
    result,
    loading,
    skeleton,
    failed,
    pathMode,
    hasFacets: defs.brands.length + defs.origins.length + defs.models.length + defs.attributes.length > 0,
    totalInCategory,
    categoryName,
    compare,
    rfqHref,
    basePath,
    count: activeCount(state),
    chips,
    headingRef,
    sheetOpen,
    setSheetOpen,
    ...act,
    pageHref,
  }
  return <BrowseContext.Provider value={value}>{children}</BrowseContext.Provider>
}
