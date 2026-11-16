import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { indexOnChange, indexOnDelete } from '../lib/search/hooks'
import { isContentEditor, publishedOnly } from '../lib/access'
import { slugFromTitle } from '../lib/slug'
import { seoFields } from '../lib/seoFields'

export const Solutions: CollectionConfig = {
  slug: 'solutions',
  admin: { useAsTitle: 'title', group: 'Content' },
  versions: { drafts: true },
  hooks: {
    afterChange: [indexOnChange('solution'), ({ doc }) => { revalidateSite(); return doc }],
    afterDelete: [indexOnDelete('solution'), ({ doc }) => { revalidateSite(); return doc }],
  },
  access: { read: publishedOnly, create: isContentEditor, update: isContentEditor, delete: isContentEditor },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar' }, hooks: { beforeValidate: [slugFromTitle('title')] } },
    { name: 'summary', type: 'textarea', localized: true },
    {
      name: 'reviewed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Tick once the copy on this page has been checked. Unreviewed pages stay hidden from search engines and the sitemap.',
      },
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText', localized: true },
    {
      name: 'lineSequence',
      type: 'array',
      admin: { description: 'Stations in typical order, used for the interactive line diagram.' },
      fields: [
        { name: 'station', type: 'text', required: true, localized: true },
        { name: 'category', type: 'relationship', relationTo: 'categories' },
        { name: 'optional', type: 'checkbox', defaultValue: false },
        { name: 'note', type: 'textarea', localized: true },
      ],
    },
    { name: 'faqs', type: 'array', localized: true, fields: [{ name: 'question', type: 'text', required: true }, { name: 'answer', type: 'textarea', required: true }] },
    seoFields,
  ],
}
