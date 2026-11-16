import type { CollectionConfig } from 'payload'
import { isContentEditor, publicRead } from '../lib/access'
import { revalidateSite } from '../lib/revalidate'

const toKey = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

export const SpecAttributes: CollectionConfig = {
  slug: 'spec-attributes',
  labels: { singular: 'Spec attribute', plural: 'Spec attributes' },
  admin: {
    useAsTitle: 'label',
    group: 'Catalogue',
    defaultColumns: ['label', 'type', 'unit', 'filterable', 'comparable'],
    description: 'Define each technical specification once (for example "Tape width"), then attach it to categories. Products pick from the category’s attributes. The same definitions power filters and comparison.',
  },
  access: { read: publicRead, create: isContentEditor, update: isContentEditor, delete: isContentEditor },
  hooks: {
    afterChange: [({ doc }) => { revalidateSite(); return doc }],
    afterDelete: [({ doc }) => { revalidateSite(); return doc }],
  },
  fields: [
    { name: 'label', type: 'text', required: true, localized: true, admin: { description: 'Shown to visitors, for example "Tape width".' } },
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Machine-readable name. Filled in from the label.' },
      hooks: { beforeValidate: [({ value, data }) => (typeof value === 'string' && value ? toKey(value) : toKey(String(data?.label ?? '')))] },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'choice',
      options: [
        { label: 'Choice from a list', value: 'choice' },
        { label: 'Number', value: 'number' },
        { label: 'Yes or no', value: 'yesno' },
        { label: 'Text', value: 'text' },
      ],
    },
    { name: 'unit', type: 'text', admin: { condition: (_, sibling) => sibling?.type === 'number', description: 'For example mm, kg or CPH. Shown after every value.' } },
    {
      name: 'choices',
      type: 'array',
      admin: { condition: (_, sibling) => sibling?.type === 'choice', description: 'The values products can choose from, written exactly as visitors should see them.' },
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) => {
        const type = (siblingData as { type?: string } | undefined)?.type
        return type === 'choice' && (!Array.isArray(value) || value.length === 0) ? 'Add at least one choice.' : true
      },
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    { name: 'filterable', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Offer as a filter on category pages (works for choices, numbers and yes/no).' } },
    { name: 'comparable', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar', description: 'Include in side-by-side comparison.' } },
    { name: 'sortOrder', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
  ],
}
