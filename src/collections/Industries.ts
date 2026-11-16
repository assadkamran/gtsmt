import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { indexOnChange, indexOnDelete } from '../lib/search/hooks'
import { isContentEditor, publishedOnly } from '../lib/access'
import { slugFromTitle } from '../lib/slug'
import { seoFields } from '../lib/seoFields'

export const Industries: CollectionConfig = {
  slug: 'industries',
  admin: { useAsTitle: 'title', group: 'Content' },
  versions: { drafts: true },
  hooks: {
    afterChange: [indexOnChange('industry'), ({ doc }) => { revalidateSite(); return doc }],
    afterDelete: [indexOnDelete('industry'), ({ doc }) => { revalidateSite(); return doc }],
  },
  access: { read: publishedOnly, create: isContentEditor, update: isContentEditor, delete: isContentEditor },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar' }, hooks: { beforeValidate: [slugFromTitle('title')] } },
    { name: 'intro', type: 'textarea', localized: true },
    {
      name: 'reviewed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Tick once the copy on this page has been checked. Unreviewed pages stay hidden from search engines and the sitemap.',
      },
    },
    {
      name: 'requirements',
      type: 'array',
      localized: true,
      admin: { description: 'Typical requirements buyers in this sector specify. General statements only, not claims about GTSMT.' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText', localized: true },
    { name: 'relevantSolutions', type: 'relationship', relationTo: 'solutions', hasMany: true },
    { name: 'relevantCategories', type: 'relationship', relationTo: 'categories', hasMany: true },
    seoFields,
  ],
}
