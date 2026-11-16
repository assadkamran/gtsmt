import type { Field } from 'payload'

export const seoFields: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: { description: 'Leave blank to use sensible defaults from the page content.' },
  fields: [
    { name: 'title', type: 'text', localized: true, maxLength: 70, admin: { description: 'Aim for under 60 characters.' } },
    { name: 'description', type: 'textarea', localized: true, maxLength: 200, admin: { description: 'Aim for 140 to 160 characters.' } },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Social share image' },
    { name: 'noindex', type: 'checkbox', defaultValue: false },
  ],
}
