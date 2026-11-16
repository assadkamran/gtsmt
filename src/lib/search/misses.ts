import type { Payload } from 'payload'
import { normaliseText } from './normalise'

/** Remember a search that found nothing: query text and a counter only. No IP address, no user agent. */
export async function recordMiss(payload: Payload, q: string) {
  const query = normaliseText(q).slice(0, 80)
  if (query.length < 3) return
  try {
    const found = await payload.find({ collection: 'search-misses', where: { query: { equals: query } }, limit: 1, depth: 0 })
    const now = new Date().toISOString()
    if (found.docs[0]) await payload.update({ collection: 'search-misses', id: found.docs[0].id, data: { hits: (found.docs[0].hits ?? 1) + 1, lastSeenAt: now } })
    else await payload.create({ collection: 'search-misses', data: { query, hits: 1, lastSeenAt: now } })
  } catch {
    // A duplicate from two simultaneous searches is harmless.
  }
}
