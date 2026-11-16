import { afterEach, describe, expect, it, vi } from 'vitest'
import sharp from 'sharp'
import { notificationContent, recipientsOf, sendNotification } from '@/lib/enquiry/email'
import { processPhotos } from '@/lib/enquiry/photos'
import { makeReference } from '@/lib/enquiry/reference'
import { validateEnquiry, type EnquiryData } from '@/lib/enquiry/schema'
import { ipHash, sameOrigin, spamReasons, verifyTurnstile } from '@/lib/enquiry/security'
import { summaryText } from '@/lib/enquiry/summary'

const contact = { name: 'Alex Example', company: 'Example Electronics Ltd', email: 'alex@example.com', country: 'DE', consent: true }
const parse = (raw: object): EnquiryData => {
  const r = validateEnquiry({ ...contact, ...raw })
  if (!r.ok) throw new Error(JSON.stringify(r.errors))
  return r.data
}
const meta = { website: '', elapsedMs: 20_000, turnstileToken: '', page: '', referrer: '', utm: {} }

describe('reference', () => {
  it('has the agreed shape and never uses look-alike characters', () => {
    for (let i = 0; i < 200; i++) expect(makeReference(new Date('2026-11-15T10:00:00Z'))).toMatch(/^GT-261115-[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{4}$/)
  })
  it('uses the supplied clock and randomness', () => {
    expect(makeReference(new Date('2027-01-02T00:00:00Z'), () => 0)).toBe('GT-270102-AAAA')
  })
})

describe('summary', () => {
  it('lists only what the buyer answered', () => {
    const d = parse({ type: 'part', part: { items: [{ ref: 'AB-12345', qty: '2' }, { ref: '', qty: '' }], machineBrand: 'Brand A', accept: 'oem' } })
    const t = summaryText(d)
    expect(t).toContain('Spare parts')
    expect(t).toContain('Part 1: AB-12345 × 2')
    expect(t).toContain('Machine: Brand A')
    expect(t).toContain('Condition accepted: Genuine OEM only')
    expect(t).not.toContain('Part 2')
  })
  it('describes a line enquiry in words, with the budget as the buyer stated it', () => {
    const d = parse({ type: 'line', line: { volume: '500', volumeUnit: 'day', length: { min: '50', max: '300' }, assembly: 'double', features: ['bga', 'qfn'], budget: { currency: 'EUR', range: '50-150k' } } })
    const t = summaryText(d)
    expect(t).toContain('Boards: 500 per day')
    expect(t).toContain('Board length: 50 to 300 mm')
    expect(t).toContain('Assembly: Double-sided')
    expect(t).toContain('Includes: BGA, QFN')
    expect(t).toContain('Indication: EUR 50,000 to 150,000')
  })
  it('includes selected products and contact details only when asked', () => {
    const d = parse({ type: 'equipment', equipment: { what: 'A pick and place machine' }, products: [3] })
    expect(summaryText(d, { titles: ['Machine A (PN-1)'] })).toContain('- Machine A (PN-1)')
    expect(summaryText(d)).not.toContain('alex@example.com')
    expect(summaryText(d, { includeContact: true })).toContain('Email: alex@example.com')
  })
})

describe('same-origin check', () => {
  const req = (headers: Record<string, string>) => new Request('http://localhost:3000/api/enquiry', { method: 'POST', headers })
  it('accepts the site itself and refuses other origins', () => {
    expect(sameOrigin(req({ origin: 'http://localhost:3000' }))).toBe(true)
    expect(sameOrigin(req({ origin: 'https://evil.example' }))).toBe(false)
    expect(sameOrigin(req({ origin: 'http://localhost:3000.evil.example' }))).toBe(false)
  })
  it('falls back to Fetch Metadata and otherwise refuses', () => {
    expect(sameOrigin(req({ 'sec-fetch-site': 'same-origin' }))).toBe(true)
    expect(sameOrigin(req({ 'sec-fetch-site': 'cross-site' }))).toBe(false)
    expect(sameOrigin(req({}))).toBe(false)
  })
})

describe('address hash', () => {
  it('is stable, salted and does not contain the address', () => {
    const a = ipHash('203.0.113.7')
    expect(a).toBe(ipHash('203.0.113.7'))
    expect(a).not.toBe(ipHash('203.0.113.8'))
    expect(a).toMatch(/^[0-9a-f]{32}$/)
    expect(a).not.toContain('203')
  })
})

describe('spam signals', () => {
  it('flags a filled honeypot, a very fast submission and link stuffing', () => {
    const d = parse({ type: 'contact', message: 'See http://a.example http://b.example http://c.example http://d.example' })
    expect(spamReasons(d, { ...meta, website: 'x', elapsedMs: 400 }).sort()).toEqual(['honeypot-filled', 'many-links', 'submitted-too-fast'])
  })
  it('lets an ordinary enquiry through', () => {
    expect(spamReasons(parse({ type: 'contact', message: 'Please quote for two feeders, see our site www.example.com.' }), meta)).toEqual([])
  })
  it('does not treat a missing timer as too fast', () => {
    expect(spamReasons(parse({ type: 'contact', message: 'A normal question about feeders.' }), { ...meta, elapsedMs: 0 })).toEqual([])
  })
})

describe('notification email', () => {
  const hostile = '<img src=x onerror=alert(1)>'
  const data = parse({ type: 'equipment', name: hostile, company: 'A & B "Co"', equipment: { what: hostile } })
  it('escapes everything the buyer typed', () => {
    const { html } = notificationContent({ reference: 'GT-261115-AAAA', data, titles: [hostile], adminUrl: 'http://localhost:3000/admin/collections/enquiries/1' })
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).toContain('A &amp; B &quot;Co&quot;')
  })
  it('keeps the subject on one line', () => {
    const d = parse({ type: 'equipment', company: 'Evil\r\nBcc: victim@example.com', equipment: { what: 'x' } })
    const { subject } = notificationContent({ reference: 'GT-261115-AAAA', data: d, titles: [], adminUrl: 'http://x' })
    expect(subject).not.toMatch(/[\r\n]/)
  })
  it('uses the configured recipients, then the sales email, then the main email', () => {
    expect(recipientsOf({ enquiryRecipients: [{ email: 'a@x.com' }, { email: 'a@x.com' }, { email: 'b@x.com' }], salesEmail: 's@x.com' })).toEqual(['a@x.com', 'b@x.com'])
    expect(recipientsOf({ enquiryRecipients: [], salesEmail: 's@x.com', email: 'm@x.com' })).toEqual(['s@x.com', 'm@x.com'])
    expect(recipientsOf(null)).toEqual([])
  })
})

describe('sending the notification', () => {
  afterEach(() => vi.unstubAllEnvs())
  const args = { recipients: ['sales@example.com'], reference: 'GT-261115-AAAA', data: parse({ type: 'contact', message: 'A question about feeders.' }), titles: [], adminUrl: 'http://x' }
  it('reports a provider failure instead of throwing', async () => {
    const payload = { sendEmail: vi.fn().mockRejectedValue(new Error('provider down: sales@example.com')) }
    const out = await sendNotification(payload as never, args)
    expect(out.status).toBe('failed')
    expect(out.error).not.toContain('sales@example.com')
  })
  it('says so when there is nobody to send to', async () => {
    const payload = { sendEmail: vi.fn() }
    expect((await sendNotification(payload as never, { ...args, recipients: [] })).status).toBe('skipped')
    expect(payload.sendEmail).not.toHaveBeenCalled()
  })
  it('sets the buyer as reply-to and marks it sent only with a real provider', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    const payload = { sendEmail: vi.fn().mockResolvedValue(undefined) }
    expect((await sendNotification(payload as never, args)).status).toBe('sent')
    expect(payload.sendEmail.mock.calls[0][0].replyTo).toBe('alex@example.com')
  })
})

describe('photo processing', () => {
  const file = (data: Buffer | string, name: string, type: string) => new File([typeof data === 'string' ? data : new Uint8Array(data)], name, { type })
  const png = () => sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#2f5bf0' } }).png().toBuffer()

  it('re-encodes a real image as a smaller JPEG without metadata', async () => {
    const jpeg = await sharp({ create: { width: 400, height: 300, channels: 3, background: '#c85a28' } }).withMetadata({ exif: { IFD0: { Copyright: 'private-note' } } }).jpeg().toBuffer()
    const out = await processPhotos([file(await png(), 'a.png', 'image/png'), file(jpeg, 'b.jpg', 'image/jpeg')])
    expect(out.ok).toBe(true)
    if (out.ok) {
      expect(out.images).toHaveLength(2)
      const first = await sharp(out.images[0].data).metadata()
      expect(first.format).toBe('jpeg')
      expect(Math.max(first.width ?? 0, first.height ?? 0)).toBeLessThanOrEqual(2000)
      expect(out.images[1].data.includes(Buffer.from('private-note'))).toBe(false)
      expect(out.images[0].name).toMatch(/^[0-9a-f-]{36}\.jpg$/)
    }
  })
  it('rejects files that only pretend to be images', async () => {
    expect((await processPhotos([file('<?php system($_GET["c"]); ?>', 'x.jpg', 'image/jpeg')])).ok).toBe(false)
    expect((await processPhotos([file('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>', 'x.png', 'image/png')])).ok).toBe(false)
  })
  it('rejects too many photos and photos over 5 MB', async () => {
    const p = await png()
    expect((await processPhotos([1, 2, 3, 4].map((i) => file(p, `${i}.png`, 'image/png')))).ok).toBe(false)
    expect((await processPhotos([file(Buffer.alloc(5 * 1024 * 1024 + 1), 'big.jpg', 'image/jpeg')])).ok).toBe(false)
  })
})

describe('Turnstile verification', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })
  const stubFetch = (impl: () => Promise<unknown>) => {
    const f = vi.fn(impl)
    vi.stubGlobal('fetch', f)
    return f
  }
  const json = (body: unknown, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(body) })

  it('is skipped in development when no secret is set, and refuses in production', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    vi.stubEnv('NODE_ENV', 'development')
    expect(await verifyTurnstile('', '1.2.3.4')).toEqual({ ok: true, skipped: true })
    vi.stubEnv('NODE_ENV', 'production')
    expect(await verifyTurnstile('token', '1.2.3.4')).toEqual({ ok: false, reason: 'not-configured' })
  })

  it('needs a token once a secret is set', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret')
    const f = stubFetch(() => json({ success: true }))
    expect(await verifyTurnstile('', '1.2.3.4')).toEqual({ ok: false, reason: 'missing-token' })
    expect(f).not.toHaveBeenCalled()
  })

  it('sends the token and secret to Cloudflare and trusts only its answer', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret')
    const f = stubFetch(() => json({ success: true }))
    expect(await verifyTurnstile('abc', '203.0.113.9')).toEqual({ ok: true })
    const [url, init] = f.mock.calls[0] as unknown as [string, { body: URLSearchParams; method: string }]
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify')
    expect(init.method).toBe('POST')
    expect(init.body.get('secret')).toBe('secret')
    expect(init.body.get('response')).toBe('abc')
    expect(init.body.get('remoteip')).toBe('203.0.113.9')
    stubFetch(() => json({ success: false, 'error-codes': ['invalid-input-response'] }))
    expect(await verifyTurnstile('abc', '203.0.113.9')).toEqual({ ok: false, reason: 'rejected' })
  })

  it('does not turn real buyers away when Cloudflare cannot be reached', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret')
    stubFetch(() => Promise.reject(new Error('network down')))
    expect(await verifyTurnstile('abc', '1.2.3.4')).toEqual({ ok: true, unavailable: true })
    stubFetch(() => json({}, false))
    expect(await verifyTurnstile('abc', '1.2.3.4')).toEqual({ ok: true, unavailable: true })
  })
})
