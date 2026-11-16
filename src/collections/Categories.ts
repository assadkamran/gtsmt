import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { categoryAfterChange, indexOnDelete } from '../lib/search/hooks'
import { isContentEditor, publicRead } from '../lib/access'
import { slugFromTitle } from '../lib/slug'
import { seoFields } from '../lib/seoFields'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'name', group: 'Catalogue', defaultColumns: ['name', 'division', 'parent'] },
  hooks: {
    afterChange: [categoryAfterChange, ({ doc }) => { revalidateSite(); return doc }],
    afterDelete: [indexOnDelete('category'), ({ doc }) => { revalidateSite(); return doc }],
  },
  access: { read: publicRead, create: isContentEditor, update: isContentEditor, delete: isContentEditor },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, index: true, admin: { position: 'sidebar' }, hooks: { beforeValidate: [slugFromTitle('name')] } },
    {
      name: 'division',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'SMT equipment', value: 'equipment' },
        { label: 'Spare parts', value: 'parts' },
        { label: 'SMT peripherals', value: 'peripherals' },
      ],
    },
    { name: 'parent', type: 'relationship', relationTo: 'categories', admin: { description: 'e.g. Tape feeders sits under Feeders.' } },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'description', type: 'richText', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'specAttributes',
      type: 'relationship',
      relationTo: 'spec-attributes',
      hasMany: true,
      admin: { description: 'The specifications products in this category can carry, in the order they should appear. Products pick from this list. Define attributes under Catalogue, Spec attributes.' },
    },
    { name: 'sortOrder', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    { name: 'allowCompare', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar', description: 'Let visitors compare products in this category side by side.' } },
    {
      name: 'lineStation',
      type: 'select',
      admin: {
        position: 'sidebar',
        description: 'Where this equipment sits in a typical SMT line (equipment categories only). Highlights the station on the category page.',
      },
      options: [
        { label: 'Loader', value: 'loader' },
        { label: 'Printer', value: 'printer' },
        { label: 'SPI', value: 'spi' },
        { label: 'Pick and place', value: 'placer' },
        { label: 'Reflow', value: 'reflow' },
        { label: 'AOI', value: 'aoi' },
        { label: 'Unloader', value: 'unloader' },
      ],
    },
    {
      name: 'reviewed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Tick once the copy on this page has been checked. Unreviewed pages stay hidden from search engines and the sitemap.',
      },
    },
    seoFields,
  ],
}
