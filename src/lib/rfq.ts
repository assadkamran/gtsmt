export type Need = 'line' | 'equipment' | 'part' | 'peripherals'

type ProductRef = string | number

/**
 * Link to the enquiry form that tells it what the visitor was looking at.
 * `product` is one product id or several (a comparison). The form validates them against the catalogue, so a made-up
 * id simply shows nothing.
 */
export function rfqHref(p: { need?: Need; product?: ProductRef | ProductRef[]; part?: string; topic?: string } = {}) {
  const q = new URLSearchParams()
  if (p.need) q.set('need', p.need)
  const products = (Array.isArray(p.product) ? p.product : p.product != null ? [p.product] : []).map(String).filter(Boolean)
  if (products.length) q.set('product', products.join(','))
  if (p.part) q.set('part', p.part)
  if (p.topic) q.set('topic', p.topic)
  const s = q.toString()
  return `/request-a-quote${s ? `?${s}` : ''}`
}
