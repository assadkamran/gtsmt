import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { isContentEditor, publishedOnly } from '../lib/access'
import { slugFromTitle } from '../lib/slug'
import { seoFields } from '../lib/seoFields'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: { useAsTitle: 'title', group: 'Content', defaultColumns: ['title', 'topic', 'publishedAt', '_status'] },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    afterChange: [({ doc }) => { revalidateSite(); return doc }],
    afterDelete: [({ doc }) => { revalidateSite(); return doc }],
  },
  access: { read: publishedOnly, create: isContentEditor, update: isContentEditor, delete: isContentEditor },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar' }, hooks: { beforeValidate: [slugFromTitle('title')] } },
    {
      name: 'topic',
      type: 'select',
      options: [
        { label: 'Production lines', value: 'production-lines' },
        { label: 'Feeders and parts', value: 'feeders-parts' },
        { label: 'Inspection', value: 'inspection' },
        { label: 'Factory planning', value: 'factory-planning' },
        { label: 'Maintenance', value: 'maintenance' },
      ],
    },
    { name: 'excerpt', type: 'textarea', localized: true, maxLength: 300 },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'author', type: 'text' },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } } },
    { name: 'body', type: 'richText', localized: true },
    { name: 'faqs', type: 'array', localized: true, fields: [{ name: 'question', type: 'text', required: true }, { name: 'answer', type: 'textarea', required: true }] },
    { name: 'relatedProducts', type: 'relationship', relationTo: 'products', hasMany: true },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    seoFields,
  ],
}
