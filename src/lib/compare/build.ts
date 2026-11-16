/**
 * Turns a few products into the rows of the comparison table and works out which rows differ.
 * Plain data in and out, so it can be tested without a database.
 */

export type CmpInput = {
  id: number
  title: string
  href: string
  image: { url: string; alt: string } | null
  partNumber: string | null
  originLabel: string | null
  brand: string | null
  specs: { id: number; label: string; unit: string | null; value: string; order: number }[]
  /** Verified machine models only, for example "Brand A Model X". */
  fits: string[]
  datasheet: { url: string; label: string } | null
}

export type CmpCell = { text: string | null; tags?: string[]; link?: { href: string; label: string } }
export type CmpSection = 'Overview' | 'Specifications' | 'Verified machine compatibility' | 'Documents'
export type CmpRow = {
  id: string
  section: CmpSection
  label: string
  cells: CmpCell[]
  /** The products do not all have the same value here. */
  differs: boolean
  /** Shown even when "differences only" is on (documents are links, not values to compare). */
  alwaysShow: boolean
}

const norm = (c: CmpCell) => (c.tags ? [...c.tags].sort().join('|').toLowerCase() : (c.text ?? '').trim().toLowerCase())
const hasValue = (c: CmpCell) => (c.tags ? c.tags.length > 0 : Boolean(c.text && c.text.trim()))
const differ = (cells: CmpCell[]) => new Set(cells.map(norm)).size > 1

export function buildRows(products: CmpInput[]): CmpRow[] {
  const rows: CmpRow[] = []
  const push = (r: Omit<CmpRow, 'differs' | 'alwaysShow'> & { alwaysShow?: boolean; forceDiffers?: boolean }) => {
    if (!r.cells.some(hasValue) && !r.alwaysShow) return
    rows.push({ id: r.id, section: r.section, label: r.label, cells: r.cells, differs: r.forceDiffers ?? differ(r.cells), alwaysShow: Boolean(r.alwaysShow) })
  }

  push({ id: 'brand', section: 'Overview', label: 'Manufacturer', cells: products.map((p) => ({ text: p.brand })) })
  push({ id: 'condition', section: 'Overview', label: 'Condition', cells: products.map((p) => ({ text: p.originLabel })) })
  push({ id: 'part', section: 'Overview', label: 'Part number', cells: products.map((p) => ({ text: p.partNumber })) })

  const attrs = new Map<number, { label: string; unit: string | null; order: number }>()
  for (const p of products) {
    for (const s of p.specs) {
      const cur = attrs.get(s.id)
      if (!cur) attrs.set(s.id, { label: s.label, unit: s.unit, order: s.order })
      else cur.order = Math.min(cur.order, s.order)
    }
  }
  for (const [id, a] of [...attrs].sort((x, y) => x[1].order - y[1].order || x[1].label.localeCompare(y[1].label))) {
    push({
      id: `spec-${id}`,
      section: 'Specifications',
      label: a.label,
      cells: products.map((p) => {
        const s = p.specs.find((x) => x.id === id)
        return { text: s ? (a.unit ? `${s.value} ${a.unit}` : s.value) : null }
      }),
    })
  }

  push({
    id: 'fits',
    section: 'Verified machine compatibility',
    label: 'Fits',
    cells: products.map((p) => ({ text: null, tags: p.fits })),
    alwaysShow: products.some((p) => p.fits.length > 0),
  })

  push({
    id: 'datasheet',
    section: 'Documents',
    label: 'Datasheet',
    cells: products.map((p) => ({ text: null, link: p.datasheet ? { href: p.datasheet.url, label: p.datasheet.label } : undefined })),
    alwaysShow: products.some((p) => p.datasheet),
    forceDiffers: false,
  })
  return rows
}

/** Rows hidden by "differences only". */
export const identicalRows = (rows: CmpRow[]) => rows.filter((r) => !r.differs && !r.alwaysShow)
