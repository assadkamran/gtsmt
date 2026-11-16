import type { CollectionConfig, PayloadRequest, TextFieldSingleValidation } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { indexOnChange, indexOnDelete } from '../lib/search/hooks'
import { isContentEditor, publishedOnly } from '../lib/access'
import { slugFromTitle } from '../lib/slug'
import { seoFields } from '../lib/seoFields'
import { normaliseSpecValue, type SpecType } from '../lib/specs'

const idOf = (v: unknown): number | null => {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v)
  if (v && typeof v === 'object' && 'id' in v) return idOf((v as { id: unknown }).id)
  return null
}

type AttrDoc = { id: number; type: SpecType; choices?: { value: string }[] | null }

async function loadAttributes(req: PayloadRequest, ids: number[]): Promise<Map<number, AttrDoc>> {
  if (ids.length === 0) return new Map()
  const res = await req.payload.find({ collection: 'spec-attributes', where: { id: { in: ids } }, limit: ids.length, depth: 0, req })
  return new Map(res.docs.map((a) => [a.id, a as unknown as AttrDoc]))
}

/** Value must suit the attribute's type (a number for a number, one of the listed choices, and so on). */
const validateSpecValue: TextFieldSingleValidation = async (value, { siblingData, req }) => {
  const attrId = idOf((siblingData as { attribute?: unknown } | undefined)?.attribute)
  if (!attrId) return true
  const attr = (await loadAttributes(req, [attrId])).get(attrId)
  if (!attr) return true
  const r = normaliseSpecValue(attr, value)
  return r.ok ? true : r.error
}

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    group: 'Catalogue',
    defaultColumns: ['title', 'partNumber', 'category', 'manufacturer', 'partOrigin', '_status'],
    listSearchableFields: ['title', 'partNumber', 'altPartNumbers.value'],
  },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    beforeChange: [
      // Canonicalise spec values ("yes" becomes "Yes", "12,5" becomes 12.5) and keep a numeric copy for filtering.
      async ({ data, req }) => {
        const rows = (data as { specs?: { attribute?: unknown; value?: string; valueNumber?: number | null }[] }).specs
        if (!Array.isArray(rows) || rows.length === 0) return data
        const ids = [...new Set(rows.map((r) => idOf(r.attribute)).filter((n): n is number => n !== null))]
        const attrs = await loadAttributes(req, ids)
        data.specs = rows.map((r) => {
          const attr = attrs.get(idOf(r.attribute) ?? -1)
          if (!attr) return r
          const n = normaliseSpecValue(attr, r.value)
          return n.ok ? { ...r, value: n.value, valueNumber: n.number } : r
        })
        return data
      },
    ],
    afterChange: [indexOnChange('product'), ({ doc }) => { revalidateSite(); return doc }],
    afterDelete: [indexOnDelete('product'), ({ doc }) => { revalidateSite(); return doc }],
  },
  access: { read: publishedOnly, create: isContentEditor, update: isContentEditor, delete: isContentEditor },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, index: true, admin: { position: 'sidebar' }, hooks: { beforeValidate: [slugFromTitle('title')] } },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Show on the homepage Featured equipment section.' } },
    { name: 'quoteOnly', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar', description: 'No public price. Visitors request a quote.' } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basics',
          fields: [
            { name: 'partNumber', type: 'text', index: true, admin: { description: 'Manufacturer or GTSMT part number, exactly as it should be searched. Spaces and dashes are ignored when buyers search.' } },
            { name: 'altPartNumbers', type: 'array', labels: { singular: 'Alternative part number', plural: 'Alternative part numbers' }, fields: [{ name: 'value', type: 'text', required: true }] },
            { name: 'category', type: 'relationship', relationTo: 'categories', required: true, index: true },
            { name: 'manufacturer', type: 'relationship', relationTo: 'manufacturers', index: true },
            {
              name: 'partOrigin',
              type: 'select',
              required: true,
              index: true,
              label: 'Origin / condition',
              admin: { description: 'Required. Buyers rely on this. Choose accurately.' },
              options: [
                { label: 'New machine', value: 'new-machine' },
                { label: 'Genuine OEM part', value: 'genuine-oem' },
                { label: 'OEM surplus', value: 'oem-surplus' },
                { label: 'Compatible aftermarket', value: 'compatible-aftermarket' },
                { label: 'Used / refurbished', value: 'used-refurbished' },
              ],
            },
            { name: 'shortIntro', type: 'textarea', localized: true, maxLength: 300 },
          ],
        },
        {
          label: 'Content',
          fields: [
            { name: 'description', type: 'richText', localized: true },
            { name: 'features', type: 'array', localized: true, fields: [{ name: 'text', type: 'text', required: true }] },
            { name: 'applications', type: 'array', localized: true, fields: [{ name: 'text', type: 'text', required: true }] },
          ],
        },
        {
          label: 'Specifications',
          fields: [
            {
              name: 'specs',
              type: 'array',
              labels: { singular: 'Specification', plural: 'Specifications' },
              admin: { description: 'Pick an attribute, then enter its value. Only enter values confirmed from the manufacturer datasheet or your own verified data. Leave a spec out rather than guess. If the list is empty, attach attributes to the category first.' },
              fields: [
                {
                  name: 'attribute',
                  type: 'relationship',
                  relationTo: 'spec-attributes',
                  required: true,
                  // Offer only the attributes attached to this product's category.
                  filterOptions: async ({ data, req }) => {
                    const categoryId = idOf((data as { category?: unknown } | undefined)?.category)
                    if (!categoryId) return true
                    try {
                      const cat = await req.payload.findByID({ collection: 'categories', id: categoryId, depth: 0, req })
                      const ids = (cat.specAttributes ?? []).map((a) => idOf(a)).filter((n): n is number => n !== null)
                      return { id: { in: ids } }
                    } catch {
                      return true
                    }
                  },
                },
                { name: 'value', type: 'text', required: true, validate: validateSpecValue },
                { name: 'valueNumber', type: 'number', admin: { hidden: true, readOnly: true } },
              ],
            },
          ],
        },
        {
          label: 'Compatibility',
          fields: [
            {
              name: 'compatibility',
              type: 'array',
              admin: { description: 'Machine models this product fits. Only entries marked Verified appear on the website.' },
              fields: [
                { name: 'machineModel', type: 'relationship', relationTo: 'machine-models', required: true },
                { name: 'verified', type: 'checkbox', defaultValue: false },
                {
                  name: 'source',
                  type: 'text',
                  admin: { description: 'Required when verified: e.g. "Manufacturer parts list p.14" or "Tested on customer machine".' },
                  validate: (value: unknown, { siblingData }: { siblingData: { verified?: boolean } }) =>
                    siblingData?.verified && !value ? 'A source is required before compatibility can be marked verified.' : true,
                },
                { name: 'note', type: 'text', localized: true },
              ],
            },
          ],
        },
        {
          label: 'Media and documents',
          fields: [
            { name: 'gallery', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }] },
            { name: 'documents', type: 'relationship', relationTo: 'product-documents', hasMany: true },
          ],
        },
        {
          label: 'Related',
          fields: [
            { name: 'accessories', type: 'relationship', relationTo: 'products', hasMany: true },
            { name: 'related', type: 'relationship', relationTo: 'products', hasMany: true },
          ],
        },
        { label: 'SEO', fields: [seoFields] },
      ],
    },
  ],
}
