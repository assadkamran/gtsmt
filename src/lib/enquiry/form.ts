import { parseNumber } from '../specs'
import { validateEnquiry } from './schema'

/**
 * Form-side helpers for the enquiry wizard: the state shape, which steps each kind of enquiry has, and how a field
 * error maps back to a step. Pure functions, so they can be tested without a browser.
 */

export type Need = 'line' | 'equipment' | 'part' | 'peripherals'
export type StepId = 'need' | 'boards' | 'components' | 'site' | 'budget' | 'details' | 'contact' | 'review'
export type Unit = 'mm' | 'in'

/** The form state is a plain nested object of strings, arrays and booleans: what text boxes and checkboxes produce. */
export type Form = Record<string, unknown>

export function stepsFor(type: Need | ''): StepId[] {
  if (type === 'line') return ['need', 'boards', 'components', 'site', 'budget', 'contact', 'review']
  if (type) return ['need', 'details', 'contact', 'review']
  return ['need']
}

export function stepTitle(step: StepId, type: Need | ''): string {
  switch (step) {
    case 'need': return 'What do you need?'
    case 'boards': return 'Production and boards'
    case 'components': return 'Components'
    case 'site': return 'Equipment and site'
    case 'budget': return 'Budget'
    case 'contact': return 'Your details'
    case 'review': return 'Review'
    case 'details': return type === 'part' ? 'Your parts' : type === 'peripherals' ? 'Your peripherals' : 'Your equipment'
  }
}

/* ------------------------------------------------------------------ paths */
export function getIn(obj: unknown, path: string): unknown {
  let cur: unknown = obj
  for (const key of path.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[key]
  }
  return cur
}

/** Immutable set by dotted path ("part.items.0.ref"). Numeric keys address array entries. */
export function setIn<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split('.')
  const isIndex = /^\d+$/.test(head)
  const base: Record<string, unknown> | unknown[] = Array.isArray(obj) ? [...obj] : { ...((obj as Record<string, unknown>) ?? {}) }
  const key = isIndex ? Number(head) : head
  const current = (base as Record<string | number, unknown>)[key]
  ;(base as Record<string | number, unknown>)[key] = rest.length ? setIn(current ?? (/^\d+$/.test(rest[0]) ? [] : {}), rest.join('.'), value) : value
  return base as T
}

/* ------------------------------------------------------------------ initial state */
const emptyRange = () => ({ min: '', max: '' })
const emptyBudget = () => ({ currency: '', range: '' })

export type Initial = { need?: Need; products?: number[]; topic?: string; part?: string }

export function initialForm(i: Initial = {}): Form {
  return {
    type: i.need ?? '',
    products: i.products ?? [],
    topic: i.topic ?? '',
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    jobTitle: '',
    consent: false,
    message: '',
    boardUnit: 'mm' as Unit,
    /** Board sizes in millimetres, exactly, whatever unit is on screen. The text boxes only show them. */
    boardMm: {} as Record<string, number>,
    line: {
      volume: '', volumeUnit: 'day', length: emptyRange(), width: emptyRange(), thickness: emptyRange(), assembly: '',
      smallestComponent: '', features: [], componentsPerBoard: '', leadFree: '',
      project: '', stations: [], existing: '', timeline: '', budget: emptyBudget(),
    },
    equipment: { what: '', quantity: '', condition: '', requirements: '', timeline: '', budget: emptyBudget() },
    part: { items: [{ ref: i.part ?? '', qty: '' }], machineBrand: '', machineModel: '', accept: '' },
    peripherals: { what: '', quantity: '', existingLine: '', requirements: '', timeline: '', budget: emptyBudget() },
    contactTopic: 'sales',
  }
}

/* ------------------------------------------------------------------ units */
const MM_PER_INCH = 25.4
const round = (n: number, places: number) => Math.round(n * 10 ** places) / 10 ** places

export const toMm = (n: number, from: Unit) => (from === 'mm' ? n : round(n * MM_PER_INCH, 3))
export const fromMm = (mm: number, to: Unit) => String(to === 'mm' ? mm : round(mm / MM_PER_INCH, 3))

const DIMENSIONS = ['length', 'width', 'thickness'] as const
const SIDES = ['min', 'max'] as const
const BOARD_PATHS = DIMENSIONS.flatMap((d) => SIDES.map((s) => `${d}.${s}`))

/**
 * Typing a board size: keep what was typed for display and remember the exact millimetre value. Switching units later
 * shows the same size in the other unit without rounding it twice (250 mm never turns into 250.01 mm).
 */
export function setBoardValue(form: Form, path: string, value: string): Form {
  const unit = (form.boardUnit as Unit) ?? 'mm'
  const n = parseNumber(value)
  const mm = { ...((form.boardMm as Record<string, number> | undefined) ?? {}) }
  if (n === null) delete mm[path]
  else mm[path] = toMm(n, unit)
  return { ...setIn(form, `line.${path}`, value), boardMm: mm }
}

/** Show the board sizes in the other unit. Sizes that are not a number yet (half-typed) are left alone. */
export function convertBoardUnit(form: Form, to: Unit): Form {
  if (((form.boardUnit as Unit) ?? 'mm') === to) return form
  const mm = (form.boardMm as Record<string, number> | undefined) ?? {}
  let next: Form = { ...form, boardUnit: to }
  for (const path of BOARD_PATHS) if (mm[path] !== undefined) next = setIn(next, `line.${path}`, fromMm(mm[path], to))
  return next
}

/* ------------------------------------------------------------------ to the shape the schema expects */
const COMMON = ['type', 'products', 'topic', 'name', 'company', 'email', 'phone', 'country', 'jobTitle', 'consent', 'message'] as const

/** Only the part of the form that belongs to the chosen kind of enquiry, with board sizes in millimetres. */
export function toInput(form: Form): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k of COMMON) out[k] = form[k]
  const type = form.type as string
  if (type === 'line') {
    let line = form.line as Record<string, unknown>
    const mm = (form.boardMm as Record<string, number> | undefined) ?? {}
    for (const path of BOARD_PATHS) if (mm[path] !== undefined) line = setIn(line, path, String(mm[path]))
    out.line = line
  } else if (type === 'equipment' || type === 'part' || type === 'peripherals') {
    out[type] = form[type]
  } else if (type === 'contact') {
    out.contactTopic = form.contactTopic
  }
  return out
}

/* ------------------------------------------------------------------ errors and steps */
const CONTACT_FIELDS = new Set(['name', 'company', 'email', 'phone', 'country', 'jobTitle', 'consent'])
const BOARDS = new Set(['volume', 'volumeUnit', 'length', 'width', 'thickness', 'assembly'])
const COMPONENTS = new Set(['smallestComponent', 'features', 'componentsPerBoard', 'leadFree'])
const SITE = new Set(['project', 'stations', 'existing', 'timeline'])

export function stepOfPath(type: Need | '' | 'contact', path: string): StepId {
  const [root, field] = path.split('.')
  if (CONTACT_FIELDS.has(root)) return 'contact'
  if (type === 'line' && root === 'line') {
    if (BOARDS.has(field)) return 'boards'
    if (COMPONENTS.has(field)) return 'components'
    if (SITE.has(field)) return 'site'
    if (field === 'budget') return 'budget'
  }
  if (root === 'type') return 'need'
  return 'details'
}

/** Errors for one step only. The rest of the form is not complete yet, so its errors are not shown. */
export function validateStep(type: Need | '', step: StepId, form: Form): Record<string, string> {
  if (step === 'need') return type ? {} : { type: 'Choose what you need.' }
  const r = validateEnquiry(toInput(form))
  if (r.ok) return {}
  return Object.fromEntries(Object.entries(r.errors).filter(([path]) => stepOfPath(type, path) === step))
}

/** Every error, grouped by the step it belongs to, in step order. Used by the review step. */
export function validateAll(type: Need | '', form: Form): { step: StepId; errors: Record<string, string> }[] {
  const r = validateEnquiry(toInput(form))
  if (r.ok) return []
  const out: { step: StepId; errors: Record<string, string> }[] = []
  for (const step of stepsFor(type)) {
    const errors = Object.fromEntries(Object.entries(r.errors).filter(([path]) => stepOfPath(type, path) === step))
    if (Object.keys(errors).length) out.push({ step, errors })
  }
  return out
}

/** The id used on a field's control, so the error summary can link to it. */
export const fieldId = (path: string) => `f-${path.replace(/[^a-zA-Z0-9]+/g, '-')}`
