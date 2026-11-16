import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'
import { isAdmin, isSalesOrAdmin } from '../lib/access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Photos attached to enquiries. Private: only admin and sales can read them.
 * Created only by the enquiry endpoint, which re-encodes every image first.
 */
export const EnquiryFiles: CollectionConfig = {
  slug: 'enquiry-files',
  labels: { singular: 'Enquiry photo', plural: 'Enquiry photos' },
  admin: { group: 'Sales', hidden: ({ user }) => !['admin', 'sales'].includes((user as { role?: string } | null)?.role ?? '') },
  access: { read: isSalesOrAdmin, create: () => false, update: () => false, delete: isAdmin },
  upload: {
    staticDir: path.resolve(dirname, '../../media/enquiry-files'),
    mimeTypes: ['image/jpeg'],
    imageSizes: [{ name: 'thumb', width: 300, height: 300, position: 'centre' }],
    adminThumbnail: 'thumb',
  },
  fields: [{ name: 'note', type: 'text', admin: { readOnly: true } }],
}
