import type { CollectionConfig } from 'payload'
import { isContentEditor, publicRead } from '../lib/access'
import { slugFromTitle } from '../lib/slug'
import { modelAfterChange } from '../lib/search/hooks'

export const MachineModels: CollectionConfig = {
  slug: 'machine-models',
  admin: { useAsTitle: 'name', group: 'Catalogue', defaultColumns: ['name', 'manufacturer', 'machineType'] },
  hooks: { afterChange: [modelAfterChange] },
  access: { read: publicRead, create: isContentEditor, update: isContentEditor, delete: isContentEditor },
  fields: [
    { name: 'manufacturer', type: 'relationship', relationTo: 'manufacturers', required: true, index: true },
    { name: 'name', type: 'text', required: true, admin: { description: 'Model name exactly as the manufacturer writes it.' } },
    { name: 'slug', type: 'text', required: true, index: true, admin: { position: 'sidebar' }, hooks: { beforeValidate: [slugFromTitle('name')] } },
    {
      name: 'machineType',
      type: 'select',
      options: [
        { label: 'Pick and place', value: 'pick-and-place' },
        { label: 'Solder paste printer', value: 'printer' },
        { label: 'Reflow oven', value: 'reflow' },
        { label: 'AOI / SPI', value: 'inspection' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'notes', type: 'textarea', localized: true },
  ],
}
