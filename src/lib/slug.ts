import type { FieldHook } from 'payload'

export const toSlug = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const slugFromTitle =
  (source: string): FieldHook =>
  ({ value, data }) => {
    if (typeof value === 'string' && value.length > 0) return toSlug(value)
    const s = data?.[source]
    return typeof s === 'string' ? toSlug(s) : value
  }
