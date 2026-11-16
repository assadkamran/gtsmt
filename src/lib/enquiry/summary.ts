import { countryName } from '../countries'
import type { EnquiryData } from './schema'
import {
  ACCEPT, ASSEMBLY, BUDGET_RANGES, COMPONENT_FEATURES, COMPONENTS_PER_BOARD, CONDITION, CONTACT_TOPICS, CURRENCIES, LEAD_FREE, NEED_LABEL, PROJECT, SMALLEST_COMPONENT, STATIONS, TIMELINE, VOLUME_UNITS, labelOf,
  type Opt,
} from './options'

/**
 * The buyer's answers in plain words. Used on the review step, in the notification email and in the admin, so all three
 * always say the same thing. Only what the buyer answered is listed.
 */

export type SummaryRow = { label: string; value: string }
export type SummarySection = { heading: string; rows: SummaryRow[] }

const rows = (...r: (SummaryRow | null)[]) => r.filter((x): x is SummaryRow => Boolean(x))
const row = (label: string, value: string | number | undefined | null): SummaryRow | null => {
  const v = value === undefined || value === null ? '' : String(value).trim()
  return v ? { label, value: v } : null
}
const many = (opts: Opt[], values: string[]) => values.map((v) => labelOf(opts, v)).filter(Boolean).join(', ')

const fmt = (n: number) => new Intl.NumberFormat('en', { maximumFractionDigits: 3 }).format(n)
function rangeText(r: { min?: number; max?: number } | undefined, unit: string): string {
  if (!r || (r.min === undefined && r.max === undefined)) return ''
  if (r.min !== undefined && r.max !== undefined) return r.min === r.max ? `${fmt(r.min)} ${unit}` : `${fmt(r.min)} to ${fmt(r.max)} ${unit}`
  return r.min !== undefined ? `from ${fmt(r.min)} ${unit}` : `up to ${fmt(r.max as number)} ${unit}`
}
function budgetText(b: { currency?: string; range?: string } | undefined): string {
  if (!b || !b.range) return ''
  const range = labelOf(BUDGET_RANGES, b.range)
  if (b.range === 'discuss') return range
  const code = b.currency && b.currency !== 'other' ? `${b.currency} ` : b.currency === 'other' ? '(another currency) ' : ''
  return `${code}${range}`.trim()
}

export function answerSections(d: EnquiryData): SummarySection[] {
  const out: SummarySection[] = []
  switch (d.type) {
    case 'line': {
      const l = d.line
      out.push({
        heading: 'Production and boards',
        rows: rows(
          row('Boards', l.volume ? `${fmt(l.volume)} ${labelOf(VOLUME_UNITS, l.volumeUnit)}`.trim() : ''),
          row('Board length', rangeText(l.length, 'mm')),
          row('Board width', rangeText(l.width, 'mm')),
          row('Board thickness', rangeText(l.thickness, 'mm')),
          row('Assembly', labelOf(ASSEMBLY, l.assembly)),
        ),
      })
      out.push({
        heading: 'Components',
        rows: rows(
          row('Smallest component', labelOf(SMALLEST_COMPONENT, l.smallestComponent)),
          row('Includes', many(COMPONENT_FEATURES, l.features)),
          row('Components per board', labelOf(COMPONENTS_PER_BOARD, l.componentsPerBoard)),
          row('Solder', labelOf(LEAD_FREE, l.leadFree)),
        ),
      })
      out.push({
        heading: 'Equipment and site',
        rows: rows(row('Project', labelOf(PROJECT, l.project)), row('Stations needed', many(STATIONS, l.stations)), row('Already in place', l.existing), row('Timeline', labelOf(TIMELINE, l.timeline))),
      })
      out.push({ heading: 'Budget', rows: rows(row('Indication', budgetText(l.budget))) })
      break
    }
    case 'equipment': {
      const e = d.equipment
      out.push({
        heading: 'What you need',
        rows: rows(row('Looking for', e.what), row('Quantity', e.quantity), row('Condition', labelOf(CONDITION, e.condition)), row('Requirements', e.requirements), row('Timeline', labelOf(TIMELINE, e.timeline)), row('Budget', budgetText(e.budget))),
      })
      break
    }
    case 'part': {
      const p = d.part
      const items = p.items.filter((i) => i.ref)
      out.push({
        heading: 'Parts',
        rows: rows(
          ...items.map((i, n) => row(`Part ${n + 1}`, `${i.ref}${i.qty ? ` × ${fmt(i.qty)}` : ''}`)),
          row('Machine', [p.machineBrand, p.machineModel].filter(Boolean).join(' ')),
          row('Condition accepted', labelOf(ACCEPT, p.accept)),
        ),
      })
      break
    }
    case 'peripherals': {
      const p = d.peripherals
      out.push({
        heading: 'What you need',
        rows: rows(row('Looking for', p.what), row('Quantity', p.quantity), row('For this line', p.existingLine), row('Requirements', p.requirements), row('Timeline', labelOf(TIMELINE, p.timeline)), row('Budget', budgetText(p.budget))),
      })
      break
    }
    case 'contact':
      out.push({ heading: 'Topic', rows: rows(row('About', labelOf(CONTACT_TOPICS, d.contactTopic))) })
      break
  }
  return out.filter((s) => s.rows.length > 0)
}

export function contactRows(d: EnquiryData): SummaryRow[] {
  return rows(row('Name', d.name), row('Company', d.company), row('Job title', d.jobTitle), row('Email', d.email), row('Phone', d.phone), row('Country', d.country ? countryName(d.country) : ''))
}

/** Everything, as plain text. `titles` are the names of the catalogue products the buyer came from. */
export function summaryText(d: EnquiryData, o: { titles?: string[]; includeContact?: boolean } = {}): string {
  const blocks: string[] = [NEED_LABEL[d.type] ?? d.type]
  if (d.topic) blocks.push(`Came from: ${d.topic}`)
  if (o.titles?.length) blocks.push(['Products selected:', ...o.titles.map((t) => `  - ${t}`)].join('\n'))
  for (const s of answerSections(d)) blocks.push([s.heading.toUpperCase(), ...s.rows.map((r) => `${r.label}: ${r.value}`)].join('\n'))
  if (d.message) blocks.push(['MESSAGE', d.message].join('\n'))
  if (o.includeContact) blocks.push(['CONTACT', ...contactRows(d).map((r) => `${r.label}: ${r.value}`)].join('\n'))
  return blocks.join('\n\n')
}
