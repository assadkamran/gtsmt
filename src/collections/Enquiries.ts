import type { CollectionConfig } from 'payload'
import { isAdmin, isSalesOrAdmin, nobodyField } from '../lib/access'

const locked = { update: nobodyField, create: nobodyField }

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    useAsTitle: 'reference',
    group: 'Sales',
    defaultColumns: ['reference', 'type', 'status', 'contact.company', 'contact.country', 'createdAt'],
    description: 'Submitted through the website. The submitted details cannot be edited. Update the status, assign it and add notes.',
    listSearchableFields: ['reference', 'contact.name', 'contact.company', 'contact.email'],
  },
  defaultSort: '-createdAt',
  // Public submissions go through the validated /api/enquiry route, which uses the Local API.
  access: { read: isSalesOrAdmin, create: () => false, update: isSalesOrAdmin, delete: isAdmin },
  timestamps: true,
  fields: [
    { name: 'reference', type: 'text', required: true, unique: true, index: true, access: locked, admin: { readOnly: true, description: 'Shown to the buyer on the confirmation screen.' } },
    {
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      access: locked,
      admin: { readOnly: true },
      options: [
        { label: 'Complete SMT line', value: 'line' },
        { label: 'Equipment', value: 'equipment' },
        { label: 'Spare parts', value: 'part' },
        { label: 'Peripherals', value: 'peripherals' },
        { label: 'Contact', value: 'contact' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Closed', value: 'closed' },
        { label: 'Spam', value: 'spam' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    {
      name: 'contact',
      type: 'group',
      access: locked,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'company', type: 'text' },
        { name: 'jobTitle', type: 'text' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
        { name: 'country', type: 'text', admin: { description: 'ISO 3166-1 alpha-2 code.' } },
      ],
    },
    { name: 'readableSummary', type: 'textarea', access: locked, admin: { readOnly: true, rows: 14, description: 'Everything the buyer told us, in plain text.' } },
    { name: 'message', type: 'textarea', access: locked, admin: { readOnly: true } },
    { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true, access: locked, admin: { readOnly: true } },
    { name: 'attachments', type: 'relationship', relationTo: 'enquiry-files', hasMany: true, access: locked, admin: { readOnly: true } },
    { name: 'payload', type: 'json', access: locked, admin: { readOnly: true, description: 'Structured answers from the form.' } },
    {
      name: 'consent',
      type: 'group',
      access: locked,
      fields: [
        { name: 'privacyAccepted', type: 'checkbox' },
        { name: 'acceptedAt', type: 'date' },
      ],
    },
    {
      name: 'source',
      type: 'group',
      access: locked,
      admin: { description: 'Where the enquiry came from. No raw IP address is stored.' },
      fields: [
        { name: 'page', type: 'text' },
        { name: 'referrer', type: 'text' },
        { name: 'utm', type: 'json' },
        { name: 'ipHash', type: 'text', index: true, admin: { description: 'Salted hash, used only for rate limiting.' } },
        { name: 'elapsedMs', type: 'number' },
      ],
    },
    { name: 'spamReasons', type: 'array', access: locked, admin: { readOnly: true }, fields: [{ name: 'reason', type: 'text' }] },
    {
      name: 'emailStatus',
      type: 'select',
      access: locked,
      admin: { position: 'sidebar', readOnly: true, description: 'Whether the notification email was sent.' },
      options: [
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
        { label: 'No recipient set', value: 'skipped' },
        { label: 'Not sent (flagged as spam)', value: 'not-sent' },
      ],
    },
    { name: 'emailError', type: 'text', access: locked, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'internalNotes', type: 'textarea', admin: { position: 'sidebar' } },
  ],
}
