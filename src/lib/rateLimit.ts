/**
 * Small in-memory limiter for cheap, public GET endpoints. Per server instance, so it is a courtesy brake, not a
 * security boundary. Anything that stores data uses the database-backed limits in the enquiry route instead.
 */
const buckets = new Map<string, { count: number; reset: number }>()

export function hit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k)
  const b = buckets.get(key)
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }
  b.count += 1
  return b.count <= limit ? { ok: true, retryAfter: 0 } : { ok: false, retryAfter: Math.ceil((b.reset - now) / 1000) }
}

/** Best-effort client address from the proxy headers. Used only to key limits and to make a salted hash. */
export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim().slice(0, 64)
  return (request.headers.get('x-real-ip') || 'unknown').slice(0, 64)
}
