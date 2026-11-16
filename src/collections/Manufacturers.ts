import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { brandAfterChange, indexOnDelete } from '../lib/search/hooks'
import { isContentEditor, publicRead } from '../lib/access'
import { slugFromTitle } from '../lib/slug'
import { seoFields } from '../lib/seoFields'

export const Manufacturers: CollectionConfig = {
  slug: 'manufacturers',
  admin: { useAsTitle: 'name', group: 'Catalogue', defaultColumns: ['name', 'slug'] },
  hooks: {
    afterChange: [brandAfterChange, ({ doc }) => { revalidateSite(); return doc }],
    afterDelete: [indexOnDelete('brand'), ({ doc }) => { revalidateSite(); return doc }],
  },
  access: { read: publicRead, create: isContentEditor, update: isContentEditor, delete: isContentEditor },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar' }, hooks: { beforeValidate: [slugFromTitle('name')] } },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'website', type: 'text' },
    { name: 'notes', type: 'textarea', localized: true, admin: { description: 'Internal or public notes. Do not imply affiliation unless it exists.' } },
    { name: 'showAsBrandHub', type: 'checkbox', defaultValue: false, admin: { description: 'Publish a /spare-parts/brands/<slug> page for this manufacturer.' } },
    seoFields,
  ],
}
