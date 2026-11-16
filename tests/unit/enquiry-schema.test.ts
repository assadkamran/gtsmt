import { describe, expect, it } from 'vitest'
import { validateEnquiry } from '@/lib/enquiry/schema'

const contact = { name: 'Alex Example', company: 'Example Electronics Ltd', email: 'Alex@Example.COM ', country: 'DE', consent: true }

describe('enquiry schema', () => {
  it('accepts a minimal spare-parts request and tidies the values', () => {
    const r = validateEnquiry({ type: 'part', ...contact, part: { items: [{ ref: '  AB-12345 ', qty: '2' }] } })
    expect(r.ok).toBe(true)
    if (r.ok && r.data.type === 'part') {
      expect(r.data.email).toBe('alex@example.com')
      expect(r.data.part.items[0]).toEqual({ ref: 'AB-12345', qty: 2 })
      expect(r.data.part.accept).toBe('')
    }
  })

  it('drops unknown fields', () => {
    const r = validateEnquiry({ type: 'contact', ...contact, message: 'Hello, I have a question.', isAdmin: true, __proto__: { x: 1 } })
    expect(r.ok).toBe(true)
    if (r.ok) expect('isAdmin' in r.data).toBe(false)
  })

  it('requires consent, a real email and a country from the list', () => {
    const r = validateEnquiry({ type: 'contact', ...contact, consent: false, email: 'alex@example', country: 'ZZ', message: 'Hello there, a question.' })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(['consent', 'country', 'email'])
    }
  })

  it('asks for missing required fields in plain words, even when the field is absent', () => {
    const r = validateEnquiry({ type: 'part', consent: true, part: { items: [{ ref: 'A', qty: '1' }] } })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.errors.name).toBe('Enter your name')
      expect(r.errors.company).toBe('Enter your company')
      expect(r.errors.email).toBe('Enter your email address')
      expect(r.errors.country).toBe('Choose your country')
    }
  })

  it('does not insist on a company for a general question', () => {
    const { company: _omit, ...noCompany } = contact
    expect(validateEnquiry({ type: 'contact', ...noCompany, message: 'A question about feeders.' }).ok).toBe(true)
    expect(validateEnquiry({ type: 'part', ...noCompany, part: { items: [{ ref: 'A', qty: '1' }] } }).ok).toBe(false)
  })

  it('rejects an unknown kind of enquiry', () => {
    expect(validateEnquiry({ type: 'admin', ...contact }).ok).toBe(false)
    expect(validateEnquiry({ ...contact }).ok).toBe(false)
  })

  it('rejects values outside a fixed list instead of storing them', () => {
    const r = validateEnquiry({ type: 'line', ...contact, line: { assembly: 'drop table', volumeUnit: 'fortnight' } })
    expect(r.ok).toBe(false)
  })

  it('reads numbers typed with a decimal comma and rejects text', () => {
    const ok = validateEnquiry({ type: 'line', ...contact, line: { volume: '1500', length: { min: '50,5', max: '300' } } })
    expect(ok.ok).toBe(true)
    if (ok.ok && ok.data.type === 'line') {
      expect(ok.data.line.volume).toBe(1500)
      expect(ok.data.line.length).toEqual({ min: 50.5, max: 300 })
    }
    const bad = validateEnquiry({ type: 'line', ...contact, line: { volume: 'lots' } })
    expect(bad.ok).toBe(false)
  })

  it('leaves unanswered numbers empty instead of inventing a value', () => {
    const r = validateEnquiry({ type: 'line', ...contact })
    expect(r.ok).toBe(true)
    if (r.ok && r.data.type === 'line') {
      expect(r.data.line.volume).toBeUndefined()
      expect(r.data.line.length).toEqual({ min: undefined, max: undefined })
      expect(r.data.line.features).toEqual([])
      expect(r.data.line.budget).toEqual({ currency: '', range: '' })
    }
  })

  it('rejects a range whose maximum is below its minimum', () => {
    const r = validateEnquiry({ type: 'line', ...contact, line: { width: { min: '300', max: '50' } } })
    expect(r.ok).toBe(false)
  })

  it('needs a part number for a parts request, unless products were picked', () => {
    expect(validateEnquiry({ type: 'part', ...contact, part: { items: [{ ref: '', qty: '' }] } }).ok).toBe(false)
    expect(validateEnquiry({ type: 'part', ...contact, products: [12], part: { items: [] } }).ok).toBe(true)
  })

  it('needs a message for a general enquiry', () => {
    expect(validateEnquiry({ type: 'contact', ...contact, message: 'Hi' }).ok).toBe(false)
  })

  it('strips control characters and caps length', () => {
    const r = validateEnquiry({ type: 'contact', ...contact, message: 'Hello\u0000 there, a question.' })
    expect(r.ok && r.data.message).toBe('Hello there, a question.')
    const long = validateEnquiry({ type: 'contact', ...contact, message: 'x'.repeat(4001) })
    expect(long.ok).toBe(false)
  })

  it('limits how many parts and products one enquiry can carry', () => {
    const items = Array.from({ length: 11 }, (_, i) => ({ ref: `P${i}`, qty: '1' }))
    expect(validateEnquiry({ type: 'part', ...contact, part: { items } }).ok).toBe(false)
    expect(validateEnquiry({ type: 'part', ...contact, products: Array.from({ length: 11 }, (_, i) => i + 1), part: { items: [{ ref: 'A', qty: '1' }] } }).ok).toBe(false)
  })
})
