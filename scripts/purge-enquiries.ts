/**
 * Deletes enquiries (and their photos) older than the retention period set in the admin under
 * Website Settings > Enquiries > Retention. It never runs by itself: someone has to run it, on purpose.
 *
 * - No retention period set: nothing is deleted.
 * - By default it only REPORTS what it would delete. Add --apply to delete.
 *
 * Ask your legal adviser what retention period suits you before setting one.
 *
 * Run:  npm run enquiries:purge            (report only)
 *       npm run enquiries:purge -- --apply (delete)
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const apply = process.argv.includes('--apply')
const payload = await getPayload({ config })

const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
const months = settings.enquiryRetentionMonths
if (!months || months < 1) {
  console.log('No retention period is set in Website Settings, so nothing will be deleted.')
  process.exit(0)
}

const cutoff = new Date()
cutoff.setMonth(cutoff.getMonth() - months)
const where = { createdAt: { less_than: cutoff.toISOString() } }

const old = await payload.find({ collection: 'enquiries', where, limit: 100000, depth: 0, pagination: false })
const fileIds = new Set<number>()
for (const e of old.docs) for (const f of e.attachments ?? []) fileIds.add(typeof f === 'object' ? f.id : f)

console.log(`Retention: ${months} months. Cut-off: ${cutoff.toISOString().slice(0, 10)}.`)
console.log(`${old.docs.length} enquiries and ${fileIds.size} photos are older than that.`)

if (!apply) {
  console.log('Nothing was deleted. Run again with --apply to delete them.')
  process.exit(0)
}

if (fileIds.size) await payload.delete({ collection: 'enquiry-files', where: { id: { in: [...fileIds] } } })
const removed = await payload.delete({ collection: 'enquiries', where })
console.log(`Deleted ${removed.docs.length} enquiries and ${fileIds.size} photos.`)
process.exit(0)
