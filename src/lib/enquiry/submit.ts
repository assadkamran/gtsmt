import { NextResponse } from 'next/server'
import { getCms, getSettings } from '../cms'
import { clientIp } from '../rateLimit'
import { recipientsOf, sendAutoReply, sendNotification } from './email'
import { processPhotos } from './photos'
import { makeReference } from './reference'
import { metaSchema, validateEnquiry } from './schema'
import { LIMITS, ipHash, sameOrigin, spamReasons, verifyTurnstile } from './security'
import { summaryText } from './summary'

/**
 * POST /api/enquiry. The order matters: cheap refusals first, the database only for things that can be stored,
 * and the enquiry is saved BEFORE any email is attempted so that no outage can lose it.
 */

const MAX_JSON_BYTES = 64 * 1024
const MAX_MULTIPART_BYTES = 17 * 1024 * 1024
const SITE = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

const reply = (body: Record<string, unknown>, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

/** Read the body, giving up as soon as it exceeds the limit (the Content-Length header can be missing or wrong). */
async function readLimited(request: Request, max: number): Promise<Buffer | null> {
  const declared = Number(request.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > max) return null
  const reader = request.body?.getReader()
  if (!reader) return Buffer.alloc(0)
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > max) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  return Buffer.concat(chunks)
}

const isDuplicateReference = (e: unknown) => {
  const err = e as { message?: string; data?: { errors?: { path?: string }[] } }
  return /unique/i.test(err?.message ?? '') || Boolean(err?.data?.errors?.some((x) => x.path === 'reference'))
}

export async function handleEnquiry(request: Request): Promise<Response> {
  if (!sameOrigin(request)) return reply({ ok: false, error: 'This request was not accepted.' }, 403)

  const ct = request.headers.get('content-type') ?? ''
  const multipart = ct.toLowerCase().startsWith('multipart/form-data')
  if (!multipart && !ct.toLowerCase().startsWith('application/json')) return reply({ ok: false, error: 'Unsupported content type.' }, 415)

  const body = await readLimited(request, multipart ? MAX_MULTIPART_BYTES : MAX_JSON_BYTES)
  if (!body) return reply({ ok: false, error: 'The request is too large.' }, 413)

  let rawData: unknown
  let rawMeta: unknown = {}
  let photos: File[] = []
  try {
    if (multipart) {
      const form = await new Response(new Uint8Array(body), { headers: { 'content-type': ct } }).formData()
      const d = form.get('data')
      const m = form.get('meta')
      if (typeof d !== 'string' || d.length > MAX_JSON_BYTES) throw new Error('data')
      rawData = JSON.parse(d)
      if (typeof m === 'string') rawMeta = JSON.parse(m.slice(0, 8192))
      photos = form.getAll('photos').filter((f): f is File => typeof f !== 'string')
    } else {
      const parsed = JSON.parse(body.toString('utf8')) as { data?: unknown; meta?: unknown }
      rawData = parsed.data
      rawMeta = parsed.meta ?? {}
    }
  } catch {
    return reply({ ok: false, error: 'The request could not be read.' }, 400)
  }

  const checked = validateEnquiry(rawData)
  if (!checked.ok) return reply({ ok: false, error: 'Please check the highlighted fields.', fields: checked.errors }, 400)
  const meta = metaSchema.safeParse(rawMeta)
  if (!meta.success) return reply({ ok: false, error: 'The request could not be read.' }, 400)
  const data = checked.data

  try {
    const payload = await getCms()

    // Limits per address and per email, counted from what is already stored (quarantined spam included).
    const ip = clientIp(request)
    // Without a usable address (no proxy header) an address limit would throttle everybody together, so it is skipped.
    const hash = ip === 'unknown' ? null : ipHash(ip)
    const since = (ms: number) => new Date(Date.now() - ms).toISOString()
    const count = (where: object) => payload.count({ collection: 'enquiries', where: where as never }).then((r) => r.totalDocs)
    const [perHour, perDay, perEmail] = await Promise.all([
      hash ? count({ and: [{ 'source.ipHash': { equals: hash } }, { createdAt: { greater_than: since(3_600_000) } }] }) : 0,
      hash ? count({ and: [{ 'source.ipHash': { equals: hash } }, { createdAt: { greater_than: since(86_400_000) } }] }) : 0,
      count({ and: [{ 'contact.email': { equals: data.email } }, { createdAt: { greater_than: since(86_400_000) } }] }),
    ])
    if (perHour >= LIMITS.ipPerHour || perDay >= LIMITS.ipPerDay || perEmail >= LIMITS.emailPerDay) {
      return reply({ ok: false, error: 'We have received several enquiries from you already. Please wait a while before sending another, or contact us directly.' }, 429, { 'Retry-After': '3600' })
    }

    const verification = await verifyTurnstile(meta.data.turnstileToken, ip)
    if (!verification.ok) {
      if (verification.reason === 'not-configured') {
        console.error('[enquiry] TURNSTILE_SECRET_KEY is not set in production. Enquiries are refused until it is.')
        return reply({ ok: false, error: 'Enquiries are temporarily unavailable. Please contact us directly.' }, 503)
      }
      return reply({ ok: false, error: 'We could not verify that you are human. Please try again.', verification: true }, 400)
    }

    const reasons = spamReasons(data, meta.data)
    const spam = reasons.length > 0
    const flags = verification.unavailable ? [...reasons, 'verification-unavailable'] : reasons

    // Photos: only on a spare-parts request, only when switched on, and never for something already flagged as spam.
    const settings = await getSettings()
    let images: { name: string; data: Buffer }[] = []
    if (photos.length > 0 && !spam) {
      if (data.type !== 'part' || settings?.allowEnquiryPhotos === false) return reply({ ok: false, error: 'Photos can only be attached to a spare-parts request.' }, 400)
      const processed = await processPhotos(photos)
      if (!processed.ok) return reply({ ok: false, error: processed.error }, 400)
      images = processed.images
    }

    // Product ids come from links, so check them against the catalogue before they are stored or shown to sales.
    let productIds: number[] = []
    let titles: string[] = []
    if (data.products.length > 0) {
      const found = await payload.find({ collection: 'products', where: { and: [{ id: { in: data.products } }, { _status: { equals: 'published' } }] }, limit: 10, depth: 0, pagination: false })
      productIds = found.docs.map((p) => p.id)
      titles = found.docs.map((p) => (p.partNumber ? `${p.title} (${p.partNumber})` : p.title))
    }

    const fileIds: number[] = []
    for (const img of images) {
      const f = await payload.create({ collection: 'enquiry-files', data: {}, file: { data: img.data, mimetype: 'image/jpeg', name: img.name, size: img.data.length } })
      fileIds.push(f.id)
    }

    const base = {
      type: data.type,
      status: spam ? ('spam' as const) : ('new' as const),
      contact: { name: data.name, company: data.company, jobTitle: data.jobTitle || undefined, email: data.email, phone: data.phone || undefined, country: data.country },
      readableSummary: summaryText(data, { titles }),
      message: data.message || undefined,
      products: productIds,
      attachments: fileIds,
      payload: data as unknown as Record<string, unknown>,
      consent: { privacyAccepted: true, acceptedAt: new Date().toISOString() },
      source: { page: meta.data.page || undefined, referrer: meta.data.referrer || undefined, utm: meta.data.utm, ipHash: hash ?? undefined, elapsedMs: meta.data.elapsedMs || undefined },
      spamReasons: flags.map((reason) => ({ reason })),
      emailStatus: spam ? ('not-sent' as const) : ('skipped' as const),
    }

    // The reference is random, so a clash is possible in principle. Try again rather than fail the buyer.
    let doc: { id: number } | null = null
    let reference = ''
    for (let attempt = 0; attempt < 6 && !doc; attempt++) {
      reference = makeReference()
      try {
        doc = await payload.create({ collection: 'enquiries', data: { ...base, reference } })
      } catch (e) {
        if (!isDuplicateReference(e)) throw e
      }
    }
    if (!doc) throw new Error('could not allocate a reference')

    if (!spam) {
      const outcome = await sendNotification(payload, { recipients: recipientsOf(settings), reference, data, titles, adminUrl: `${SITE()}/admin/collections/enquiries/${doc.id}` })
      await payload.update({ collection: 'enquiries', id: doc.id, data: { emailStatus: outcome.status, emailError: outcome.error } }).catch(() => undefined)
      if (outcome.status === 'failed') console.error(`[enquiry] ${reference}: notification email failed (${outcome.error}). The enquiry is saved in the admin.`)
      await sendAutoReply(payload, { settings, reference, to: data.email })
    }

    return reply({ ok: true, reference }, 201)
  } catch (e) {
    console.error('[enquiry] failed:', e instanceof Error ? e.name : 'unknown error')
    return reply({ ok: false, error: 'We could not send your enquiry just now. Please try again in a moment, or contact us directly.' }, 500)
  }
}
