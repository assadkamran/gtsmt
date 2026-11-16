import { describe, expect, it } from 'vitest'
import { convertBoardUnit, fieldId, fromMm, getIn, initialForm, setBoardValue, setIn, stepOfPath, stepsFor, toInput, toMm, validateAll, validateStep, type Form } from '@/lib/enquiry/form'
import { validateEnquiry } from '@/lib/enquiry/schema'

const filled = (over: Record<string, unknown> = {}): Form => ({ ...initialForm({ need: 'part' }), name: 'Alex', company: 'Example Ltd', email: 'alex@example.com', country: 'DE', consent: true, ...over })

describe('paths', () => {
  it('reads and writes nested values without mutating the original', () => {
    const a = { part: { items: [{ ref: 'A', qty: '' }] } }
    const b = setIn(a, 'part.items.0.ref', 'B')
    expect(getIn(b, 'part.items.0.ref')).toBe('B')
    expect(getIn(a, 'part.items.0.ref')).toBe('A')
    expect(Array.isArray(getIn(b, 'part.items'))).toBe(true)
  })
  it('creates missing branches, arrays for numeric keys', () => {
    expect(getIn(setIn({}, 'a.b.c', 1), 'a.b.c')).toBe(1)
    expect(Array.isArray(getIn(setIn({}, 'list.0', 'x'), 'list'))).toBe(true)
  })
  it('is safe against prototype keys', () => {
    const out = setIn({}, '__proto__.polluted', true) as Record<string, unknown>
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(out).toBeTruthy()
  })
})

describe('steps', () => {
  it('has seven steps for a line and four for the others', () => {
    expect(stepsFor('line')).toHaveLength(7)
    for (const t of ['equipment', 'part', 'peripherals'] as const) expect(stepsFor(t)).toEqual(['need', 'details', 'contact', 'review'])
    expect(stepsFor('')).toEqual(['need'])
  })
  it('maps an error back to the step that owns the field', () => {
    expect(stepOfPath('line', 'line.length.min')).toBe('boards')
    expect(stepOfPath('line', 'line.features')).toBe('components')
    expect(stepOfPath('line', 'line.timeline')).toBe('site')
    expect(stepOfPath('line', 'line.budget.range')).toBe('budget')
    expect(stepOfPath('part', 'part.items.0.ref')).toBe('details')
    expect(stepOfPath('part', 'email')).toBe('contact')
    expect(stepOfPath('part', 'consent')).toBe('contact')
  })
  it('builds element ids from paths', () => {
    expect(fieldId('part.items.0.ref')).toBe('f-part-items-0-ref')
  })
})

describe('validating one step at a time', () => {
  it('does not complain about the contact form while the buyer is still on the first step', () => {
    expect(validateStep('part', 'details', initialForm({ need: 'part' }))).toEqual({ 'part.items.0.ref': 'Add the part number or a short description of the part.' })
  })
  it('asks for what is missing on the contact step only', () => {
    const errors = validateStep('part', 'contact', filled({ email: 'nope', consent: false }))
    expect(Object.keys(errors).sort()).toEqual(['consent', 'email'])
  })
  it('needs a choice on the first step', () => {
    expect(validateStep('', 'need', initialForm())).toEqual({ type: 'Choose what you need.' })
    expect(validateStep('line', 'need', initialForm({ need: 'line' }))).toEqual({})
  })
  it('lists every problem by step for the review', () => {
    const all = validateAll('part', initialForm({ need: 'part' }))
    expect(all.map((s) => s.step)).toEqual(['details', 'contact'])
  })
  it('passes a complete enquiry', () => {
    const f = setIn(filled(), 'part.items.0.ref', 'AB-12345')
    expect(validateAll('part', f)).toEqual([])
    expect(validateEnquiry(toInput(f)).ok).toBe(true)
  })
})

describe('board units', () => {
  it('converts between the units', () => {
    expect(toMm(1, 'in')).toBe(25.4)
    expect(toMm(250, 'mm')).toBe(250)
    expect(fromMm(25.4, 'in')).toBe('1')
    expect(fromMm(250, 'mm')).toBe('250')
  })
  it('shows the same size in the other unit without rounding it twice', () => {
    let f = setBoardValue(initialForm({ need: 'line' }), 'width.max', '250')
    f = convertBoardUnit(f, 'in')
    expect(getIn(f, 'line.width.max')).toBe('9.843')
    f = convertBoardUnit(f, 'mm')
    expect(getIn(f, 'line.width.max')).toBe('250')
    expect(getIn(toInput(f), 'line.width.max')).toBe('250')
  })
  it('keeps what is typed in inches exact in millimetres', () => {
    let f = convertBoardUnit(initialForm({ need: 'line' }), 'in')
    f = setBoardValue(f, 'width.min', '2')
    expect(getIn(f, 'line.width.min')).toBe('2')
    expect(getIn(toInput(f), 'line.width.min')).toBe('50.8')
  })
  it('leaves half-typed text alone when the unit changes', () => {
    let f = setBoardValue(initialForm({ need: 'line' }), 'length.min', '12.')
    f = convertBoardUnit(f, 'in')
    expect(getIn(f, 'line.length.min')).toBe('12.')
  })
  it('sends only the part of the form that belongs to the chosen kind', () => {
    const input = toInput(filled())
    expect(Object.keys(input)).toContain('part')
    expect(Object.keys(input)).not.toContain('line')
    expect(Object.keys(input)).not.toContain('equipment')
  })
})
