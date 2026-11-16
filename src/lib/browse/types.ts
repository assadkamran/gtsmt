import type { SpecType } from '../specs'

/** Everything here is plain data, safe to import in the browser and on the server. */

export const PAGE_SIZE = 12
export const MAX_PAGE_SIZE = 48

export type SortKey = 'title' | '-title' | 'newest' | 'part'
export const SORTS: { value: SortKey; label: string }[] = [
  { value: 'title', label: 'Name A to Z' },
  { value: '-title', label: 'Name Z to A' },
  { value: 'newest', label: 'Newest first' },
  { value: 'part', label: 'Part number' },
]
export const DEFAULT_SORT: SortKey = 'title'
export const isSortKey = (v: unknown): v is SortKey => SORTS.some((s) => s.value === v)

/** One product as the listing needs it. Small on purpose: this is what travels to the browser. */
export type BrowseProduct = {
  id: number
  title: string
  href: string
  partNumber: string | null
  brandId: number | null
  /** Condition or origin value, for example "genuine-oem". */
  origin: string | null
  /** Machine models this product is VERIFIED to fit. Unverified entries never get this far. */
  modelIds: number[]
  /** Spec values by attribute id. `n` is the numeric form used for range filters. */
  specs: Record<number, { v: string; n: number | null }>
  image: { url: string; alt: string } | null
  /** Pre-formatted summary shown on the card, for example "Tape width: 8 mm · Feed pitch: 4 mm". */
  specLine: string
  /** Epoch milliseconds, for "newest first". */
  created: number
}

export type AttributeDef = {
  id: number
  key: string
  label: string
  type: Exclude<SpecType, 'text'>
  unit: string | null
  /** Choice and yes/no attributes: the values present in this category, in the order the CMS defines them. */
  choices: string[]
  /** Number attributes: the lowest and highest value present in this category. */
  min: number | null
  max: number | null
}

/** The filters a category can offer. A filter that cannot narrow anything (fewer than two options) is not offered. */
export type FacetDefs = {
  brands: { id: number; name: string }[]
  origins: { value: string; label: string }[]
  models: { id: number; name: string; brandId: number | null; brandName: string }[]
  attributes: AttributeDef[]
  /** Whether "sort by part number" means anything in this category. */
  hasPartNumbers: boolean
}

export type FilterState = {
  brands: number[]
  origins: string[]
  models: number[]
  choices: Record<number, string[]>
  ranges: Record<number, { min?: number; max?: number }>
  sort: SortKey
  page: number
}

/** How many products each option would give, with every OTHER filter applied. */
export type FacetCounts = {
  brands: Record<number, number>
  origins: Record<string, number>
  models: Record<number, number>
  choices: Record<number, Record<string, number>>
}

export type BrowseResult = {
  items: BrowseProduct[]
  totalDocs: number
  totalPages: number
  page: number
  counts: FacetCounts
}

export type Dataset = {
  categoryId: number
  products: BrowseProduct[]
  defs: FacetDefs
}
