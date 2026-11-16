import { z } from 'zod'
import { isCountryCode } from '../countries'
import { parseNumber } from '../specs'
import { ACCEPT, ASSEMBLY, BUDGET_RANGES, COMPONENT_FEATURES, COMPONENTS_PER_BOARD, CONDITION, CONTACT_TOPICS, CURRENCIES, LEAD_FREE, MAX_PARTS, PROJECT, SMALLEST_COMPONENT, STATIONS, TIMELINE, VOLUME_UNITS, type Opt } from './options'

/**
 * One definition of what an enquiry may contain. The browser uses it to check each step; the server uses the very
 * same schema to check the submission again, because the browser is never trusted. Unknown fields are dropped.
 * Field names here are also the keys of the structured answers stored with the enquiry.
 */

/* ------------------------------------------------------------------ building blocks */
// Control characters have no place in a business enquiry and can confuse email clients and exports.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const clean = (s: string) => s.replace(/\r\n?/g, '\n').replace(CONTROL, '').trim()

/** Trimmed text with a length cap. Empty is allowed and means "not answered". */
const text = (max: number) => z.string().transform(clean).pipe(z.string().max(max, `Keep this under ${max} characters.`)).default('')
const required = (max: number, empty: string) => z.string({ error: empty }).transform(clean).pipe(z.string().min(1, empty).max(max, `Keep this under ${max} characters.`))

/** A choice from a fixed list, or nothing. Anything else is an error, so a tampered value never reaches the database. */
const choice = (opts: Opt[]) => z.enum(['', ...opts.map((o) => o.value)] as [string, ...string[]]).default('')
const choices = (opts: Opt[]) => z.array(z.enum(opts.map((o) => o.value) as [string, ...string[]])).max(opts.length).default([])

/** A whole or decimal number typed into a text box. "" means not answered. */
const num = (o: { min?: number; max: number; int?: boolean; what: string }) =>
  z
    .string()
    .max(30)
    .transform((v) => v.trim())
    .refine((v) => v === '' || parseNumber(v) !== null, `Enter ${o.what} as a plain number.`)
    .transform((v) => (v === '' ? undefined : (parseNumber(v) as number)))
    .refine((n) => n === undefined || (o.int ? Number.isInteger(n) : true), 'Enter a whole number.')
    .refine((n) => n === undefined || (n >= (o.min ?? 0) && n <= o.max), `Enter a value between ${o.min ?? 0} and ${o.max}.`)
    .optional()
    // prefault runs the default through the checks above ("" becomes undefined). A plain default would skip them.
    .prefault('')

const range = (what: string, max = 5000) =>
  z
    .object({ min: num({ max, what }), max: num({ max, what }) })
    .prefault({ min: '', max: '' })
    .refine((r) => r.min === undefined || r.max === undefined || r.min <= r.max, 'The maximum cannot be lower than the minimum.')

/* ------------------------------------------------------------------ shared pieces */
export const contactShape = {
  name: required(120, 'Enter your name'),
  company: required(160, 'Enter your company'),
  email: z
    .string({ error: 'Enter your email address' })
    .transform((v) => clean(v).toLowerCase())
    .pipe(z.string().min(1, 'Enter your email address').max(254).pipe(z.email('Enter a valid email address, like name@company.com'))),
  phone: z
    .string()
    .transform(clean)
    .pipe(z.string().max(40, 'Keep this under 40 characters.').regex(/^[+()\d\s.\-]*$/, 'Use digits, spaces and + ( ) - only.'))
    .default(''),
  country: z.string({ error: 'Choose your country' }).transform(clean).pipe(z.string().min(1, 'Choose your country').refine(isCountryCode, 'Choose your country from the list')),
  jobTitle: text(120),
}
export const contactSchema = z.object(contactShape)

export const consentShape = { consent: z.literal(true, { error: 'Please agree so that we can reply to you.' }) }

const budget = z
  .object({ currency: choice(CURRENCIES), range: choice(BUDGET_RANGES) })
  .default({ currency: '', range: '' })

/* ------------------------------------------------------------------ one schema per kind of enquiry */
export const lineSchema = z.object({
  // production and boards
  volume: num({ min: 1, max: 100_000_000, int: true, what: 'the number of boards' }),
  volumeUnit: choice(VOLUME_UNITS),
  length: range('a length in millimetres'),
  width: range('a width in millimetres'),
  thickness: range('a thickness in millimetres', 50),
  assembly: choice(ASSEMBLY),
  // components
  smallestComponent: choice(SMALLEST_COMPONENT),
  features: choices(COMPONENT_FEATURES),
  componentsPerBoard: choice(COMPONENTS_PER_BOARD),
  leadFree: choice(LEAD_FREE),
  // equipment and site
  project: choice(PROJECT),
  stations: choices(STATIONS),
  existing: text(1000),
  timeline: choice(TIMELINE),
  // budget
  budget,
})

export const equipmentSchema = z.object({
  what: text(300),
  quantity: num({ min: 1, max: 999, int: true, what: 'a quantity' }),
  condition: choice(CONDITION),
  requirements: text(2000),
  timeline: choice(TIMELINE),
  budget,
})

export const partItemSchema = z.object({
  ref: text(200),
  qty: num({ min: 1, max: 100_000, int: true, what: 'a quantity' }),
})
export const partSchema = z.object({
  items: z.array(partItemSchema).max(MAX_PARTS).default([]),
  machineBrand: text(120),
  machineModel: text(120),
  accept: choice(ACCEPT),
})

export const peripheralsSchema = z.object({
  what: text(300),
  quantity: num({ min: 1, max: 999, int: true, what: 'a quantity' }),
  existingLine: text(300),
  requirements: text(2000),
  timeline: choice(TIMELINE),
  budget,
})

/* ------------------------------------------------------------------ the whole enquiry */
const base = {
  ...contactShape,
  ...consentShape,
  message: text(4000),
  /** Product ids from "Request a quote" buttons and the compare page. Checked against the catalogue on the server. */
  products: z.array(z.number().int().positive().max(999_999_999)).max(10).default([]),
  /** What the visitor was looking at, from the link they followed. Context only. */
  topic: text(200),
}

export const enquirySchema = z.discriminatedUnion('type', [
  z.object({ ...base, type: z.literal('line'), line: lineSchema.default(lineSchema.parse({})) }),
  z.object({ ...base, type: z.literal('equipment'), equipment: equipmentSchema.default(equipmentSchema.parse({})) }),
  z.object({ ...base, type: z.literal('part'), part: partSchema.default(partSchema.parse({})) }),
  z.object({ ...base, type: z.literal('peripherals'), peripherals: peripheralsSchema.default(peripheralsSchema.parse({})) }),
  // A general question does not need a company name, so this one kind overrides the shared rule.
  z.object({ ...base, company: text(160), type: z.literal('contact'), contactTopic: choice(CONTACT_TOPICS).default('sales') }),
])

export type EnquiryInput = z.input<typeof enquirySchema>
export type EnquiryData = z.output<typeof enquirySchema>
export type EnquiryType = EnquiryData['type']

/**
 * Rules that depend on more than one field. They read the raw submission, not the parsed result, so that a problem in
 * one part of the form (say, a missing email) does not hide a problem in another (say, no part number).
 */
export function crossChecks(raw: unknown): { path: string; message: string }[] {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const text = (path: string): string => {
    let cur: unknown = r
    for (const k of path.split('.')) {
      if (!cur || typeof cur !== 'object') return ''
      cur = (cur as Record<string, unknown>)[k]
    }
    return typeof cur === 'string' ? clean(cur) : ''
  }
  const picked = Array.isArray(r.products) && r.products.length > 0
  const issues: { path: string; message: string }[] = []
  if (r.type === 'part') {
    const items = (r.part as { items?: unknown } | undefined)?.items
    const named = Array.isArray(items) && items.some((_, i) => text(`part.items.${i}.ref`) !== '')
    if (!named && !picked) issues.push({ path: 'part.items.0.ref', message: 'Add the part number or a short description of the part.' })
  }
  if (r.type === 'equipment' && !text('equipment.what') && !picked) issues.push({ path: 'equipment.what', message: 'Tell us which equipment you are looking for.' })
  if (r.type === 'peripherals' && !text('peripherals.what') && !picked) issues.push({ path: 'peripherals.what', message: 'Tell us which peripherals you are looking for.' })
  if (r.type === 'contact' && text('message').length < 10) issues.push({ path: 'message', message: 'Write a short message so that we know how to help.' })
  return issues
}

/** Zod issues as { "path.to.field": "message" }, first message per field. */
export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const i of issues) {
    const key = i.path.map(String).join('.') || '_form'
    out[key] ??= i.message
  }
  return out
}

/** Parse, then run the cross-field checks. All problems are reported together, the field's own message first. */
export function validateEnquiry(raw: unknown): { ok: true; data: EnquiryData } | { ok: false; errors: Record<string, string> } {
  const parsed = enquirySchema.safeParse(raw)
  const errors: Record<string, string> = parsed.success ? {} : fieldErrors(parsed.error.issues)
  for (const c of crossChecks(raw)) errors[c.path] ??= c.message
  if (Object.keys(errors).length > 0 || !parsed.success) return { ok: false, errors }
  return { ok: true, data: parsed.data }
}

/** Anything that is not part of the enquiry itself: spam traps, verification and where it came from. */
export const metaSchema = z.object({
  website: z.string().max(200).default(''),
  elapsedMs: z.number().int().min(0).max(86_400_000).default(0),
  turnstileToken: z.string().max(2048).default(''),
  page: z.string().max(300).default(''),
  referrer: z.string().max(300).default(''),
  utm: z.record(z.string().max(40), z.string().max(120)).default({}),
})
export type EnquiryMeta = z.output<typeof metaSchema>
