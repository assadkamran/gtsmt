import type { Product } from '@/payload-types'

export type SpecType = 'text' | 'number' | 'choice' | 'yesno'

/** Parse a plain number. Accepts a decimal comma when there is no dot ("12,5"). Rejects ranges and units. */
export function parseNumber(raw: string): number | null {
  const s = raw.trim().replace(/\s+/g, '')
  if (!s) return null
  const t = /^-?\d+,\d+$/.test(s) ? s.replace(',', '.') : s
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

const YES = new Set(['yes', 'y', 'true', '1'])
const NO = new Set(['no', 'n', 'false', '0'])

export type Normalised = { ok: true; value: string; number: number | null } | { ok: false; error: string }

/** One rule set for validation (admin), canonicalising (save) and filtering (site). */
export function normaliseSpecValue(attr: { type: SpecType; choices?: { value: string }[] | null }, raw: unknown): Normalised {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return { ok: false, error: 'Enter a value.' }
  switch (attr.type) {
    case 'number': {
      const n = parseNumber(value)
      return n === null ? { ok: false, error: 'Enter a plain number, for example 12.5. The unit belongs to the attribute.' } : { ok: true, value: String(n), number: n }
    }
    case 'choice': {
      const choices = (attr.choices ?? []).map((c) => c.value)
      const hit = choices.find((c) => c.toLowerCase() === value.toLowerCase())
      return hit ? { ok: true, value: hit, number: null } : { ok: false, error: `Choose one of: ${choices.slice(0, 8).join(', ')}${choices.length > 8 ? ', ...' : ''}` }
    }
    case 'yesno': {
      const l = value.toLowerCase()
      if (YES.has(l)) return { ok: true, value: 'Yes', number: null }
      if (NO.has(l)) return { ok: true, value: 'No', number: null }
      return { ok: false, error: 'Enter Yes or No.' }
    }
    default:
      return { ok: true, value, number: null }
  }
}

export type SpecRow = {
  id: number
  key: string
  label: string
  type: SpecType
  unit: string | null
  value: string
  number: number | null
  filterable: boolean
  comparable: boolean
  sortOrder: number
}

/** Flatten a product's spec rows (attribute populated) in the category's display order. */
export function specRows(product: Pick<Product, 'specs'>, order?: number[]): SpecRow[] {
  const rows: SpecRow[] = []
  for (const s of product.specs ?? []) {
    const a = s.attribute && typeof s.attribute === 'object' ? s.attribute : null
    if (!a) continue
    rows.push({ id: a.id, key: a.key, label: a.label, type: a.type, unit: a.unit ?? null, value: s.value, number: s.valueNumber ?? null, filterable: Boolean(a.filterable), comparable: a.comparable !== false, sortOrder: a.sortOrder ?? 100 })
  }
  const idx = new Map((order ?? []).map((id, i) => [id, i]))
  return rows.sort((x, y) => (idx.get(x.id) ?? 1e6) - (idx.get(y.id) ?? 1e6) || x.sortOrder - y.sortOrder)
}

export const specText = (r: { value: string; unit?: string | null }) => (r.unit ? `${r.value} ${r.unit}` : r.value)
