import { createHmac } from 'node:crypto'
import type { EnquiryData, EnquiryMeta } from './schema'

/** Checks that run before an enquiry is stored. None of them calls a third party except Turnstile. */

const isProd = () => process.env.NODE_ENV === 'production'

/** Browsers always send Origin on a cross-site POST, and a page on another site cannot forge it. */
export function sameOrigin(request: Request): boolean {
  const allowed = new Set<string>()
  try {
    allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').origin)
    if (!isProd()) allowed.add(new URL(request.url).origin)
  } catch {
    // An unusable site URL leaves the set empty, so everything is refused rather than everything allowed.
  }
  const origin = request.headers.get('origin')
  if (origin) return allowed.has(origin)
  return request.headers.get('sec-fetch-site') === 'same-origin'
}

/** A stable, salted fingerprint of the address. Enough to rate-limit, not enough to identify anyone. */
export function ipHash(ip: string): string {
  const key = `${process.env.PAYLOAD_SECRET ?? ''}:enquiry-ip`
  return createHmac('sha256', key).update(ip).digest('hex').slice(0, 32)
}

/* ------------------------------------------------------------------ Turnstile */
export type Verification =
  | { ok: true; skipped?: boolean; unavailable?: boolean }
  | { ok: false; reason: 'missing-token' | 'rejected' | 'not-configured' }

/**
 * Server-side check of the Cloudflare Turnstile token. The browser's answer alone proves nothing: the token must be
 * sent to Cloudflare with the secret key, and each token works once.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export async function verifyTurnstile(token: string, ip: string): Promise<Verification> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return isProd() ? { ok: false, reason: 'not-configured' } : { ok: true, skipped: true }
  if (!token) return { ok: false, reason: 'missing-token' }
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip && ip !== 'unknown') body.set('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body, signal: AbortSignal.timeout(8000) })
    if (!res.ok) return { ok: true, unavailable: true }
    const out = (await res.json()) as { success?: boolean }
    return out.success ? { ok: true } : { ok: false, reason: 'rejected' }
  } catch {
    // Cloudflare unreachable: do not turn real buyers away. The enquiry is stored with a flag and the other limits still apply.
    return { ok: true, unavailable: true }
  }
}

/* ------------------------------------------------------------------ spam signals */
const LINKS = /(https?:\/\/|www\.)\S+/gi
const HAS_LINK = /(https?:\/\/|www\.)\S+/i

/**
 * Signals that make an enquiry look automated. A match does not reject it: the enquiry is stored, marked as spam and
 * not emailed, so a false alarm costs a click in the admin instead of a lost customer.
 */
export function spamReasons(d: EnquiryData, meta: EnquiryMeta): string[] {
  const reasons: string[] = []
  if (meta.website.trim()) reasons.push('honeypot-filled')
  if (meta.elapsedMs > 0 && meta.elapsedMs < 3000) reasons.push('submitted-too-fast')
  const free = [d.message, d.topic, d.name, d.company, JSON.stringify(inner(d))].join(' ')
  if ((free.match(LINKS) ?? []).length > 3) reasons.push('many-links')
  if (HAS_LINK.test(d.name) || HAS_LINK.test(d.company)) reasons.push('link-in-name')
  return reasons
}

function inner(d: EnquiryData): unknown {
  switch (d.type) {
    case 'line': return d.line.existing
    case 'equipment': return [d.equipment.what, d.equipment.requirements]
    case 'part': return [d.part.items.map((i) => i.ref), d.part.machineBrand, d.part.machineModel]
    case 'peripherals': return [d.peripherals.what, d.peripherals.requirements, d.peripherals.existingLine]
    default: return ''
  }
}

/** Limits, per address and per email, counted from stored enquiries (spam included). */
export const LIMITS = { ipPerHour: 5, ipPerDay: 20, emailPerDay: 5 } as const
