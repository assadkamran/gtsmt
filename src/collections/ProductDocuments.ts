import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'
import { isContentEditor, publicRead } from '../lib/access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const ProductDocuments: CollectionConfig = {
  slug: 'product-documents',
  admin: { useAsTitle: 'title', group: 'Catalogue' },
  access: { read: publicRead, create: isContentEditor, update: isContentEditor, delete: isContentEditor },
  upload: {
    staticDir: path.resolve(dirname, '../../media/documents'),
    mimeTypes: ['application/pdf'],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'datasheet',
      options: [
        { label: 'Datasheet', value: 'datasheet' },
        { label: 'Manual', value: 'manual' },
        { label: 'Brochure', value: 'brochure' },
        { label: 'Certificate', value: 'certificate' },
      ],
    },
    { name: 'language', type: 'text', defaultValue: 'English' },
  ],
}
