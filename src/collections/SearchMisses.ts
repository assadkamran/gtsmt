import type { CollectionConfig } from 'payload'
import { isContentEditor, isStaff } from '../lib/access'

/** Searches that found nothing. Query text and a count only: no IP address, no user agent. */
export const SearchMisses: CollectionConfig = {
  slug: 'search-misses',
  labels: { singular: 'Search with no results', plural: 'Searches with no results' },
  admin: {
    useAsTitle: 'query',
    group: 'Sales',
    defaultColumns: ['query', 'hits', 'lastSeenAt'],
    description: 'What buyers searched for that the site could not find. A guide to parts and products worth adding.',
  },
  defaultSort: '-hits',
  access: { read: isStaff, create: () => false, update: () => false, delete: isContentEditor },
  fields: [
    { name: 'query', type: 'text', required: true, unique: true, index: true, admin: { readOnly: true } },
    { name: 'hits', type: 'number', required: true, defaultValue: 1, admin: { readOnly: true } },
    { name: 'lastSeenAt', type: 'date', required: true, admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
  ],
}
