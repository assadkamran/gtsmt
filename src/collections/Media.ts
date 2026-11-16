import path from 'path'
import { revalidateSite } from '../lib/revalidate'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'
import { isContentEditor, publicRead } from '../lib/access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  hooks: {
    afterChange: [({ doc }) => { revalidateSite(); return doc }],
    afterDelete: [({ doc }) => { revalidateSite(); return doc }],
  },
  access: { read: publicRead, create: isContentEditor, update: isContentEditor, delete: isContentEditor },
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*'],
    adminThumbnail: 'thumb',
    imageSizes: [
      { name: 'thumb', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 960 },
      { name: 'hero', width: 1920 },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Describe the image for screen readers and search engines. Only describe what is visible.' },
    },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Photographer or licence/source, e.g. "Licensed: Adobe Stock #123" or "GTSMT own photo".' },
    },
    {
      name: 'isOwnPhoto',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Tick only if this is a genuine photo of GTSMT stock, machines or premises. Stock images must never be presented as GTSMT facilities.' },
    },
  ],
}
