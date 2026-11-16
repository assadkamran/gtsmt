/**
 * Removes enquiries created by tests and manual checks, and their photos.
 *
 * Only enquiries that are clearly test data are touched: a company starting with "[TEST]", or an email at example.com
 * (a domain reserved for examples, so no real buyer can have one). Refuses to run in production.
 *
 * Run: npm run test:cleanup
 */
import { getPayload, type Where } from 'payload'
import config from '../src/payload.config'

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run test cleanup in production.')
  process.exit(1)
}

const payload = await getPayload({ config })
const where: Where = { or: [{ 'contact.company': { like: '[TEST]' } }, { 'contact.email': { like: '@example.com' } }] }
const found = await payload.find({ collection: 'enquiries', where, limit: 5000, depth: 0, pagination: false })

const fileIds = new Set<number>()
for (const e of found.docs) for (const f of e.attachments ?? []) fileIds.add(typeof f === 'object' ? f.id : f)

if (fileIds.size) await payload.delete({ collection: 'enquiry-files', where: { id: { in: [...fileIds] } } })
const removed = await payload.delete({ collection: 'enquiries', where })
console.log(`Removed ${removed.docs.length} test enquiries and ${fileIds.size} photos.`)
process.exit(0)
