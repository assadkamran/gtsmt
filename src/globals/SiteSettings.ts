import type { GlobalConfig } from 'payload'
import { adminOnlyField, isContentEditor, publicRead, staffOnlyField } from '../lib/access'
import { revalidateSite } from '../lib/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Website Settings',
  admin: { group: 'System' },
  hooks: { afterChange: [({ doc }) => { revalidateSite(); return doc }] },
  access: { read: publicRead, update: isContentEditor },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Company',
          description: 'Only enter facts you can stand behind. Empty fields are simply not shown on the website.',
          fields: [
            { name: 'legalName', type: 'text' },
            { name: 'tagline', type: 'text', localized: true },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            { name: 'logoLight', type: 'upload', relationTo: 'media', label: 'Logo for dark backgrounds' },
            { name: 'address', type: 'textarea' },
            { name: 'email', type: 'email' },
            { name: 'salesEmail', type: 'email' },
            { name: 'phone', type: 'text' },
            { name: 'whatsapp', type: 'text' },
            { name: 'businessHours', type: 'text' },
          ],
        },
        {
          label: 'Trust (owner-supplied)',
          description: 'Optional proof points. Nothing here is shown until you add it. Do not add claims you cannot document.',
          fields: [
            { name: 'yearFounded', type: 'number' },
            { name: 'certifications', type: 'array', fields: [{ name: 'name', type: 'text', required: true }, { name: 'issuer', type: 'text' }, { name: 'evidence', type: 'upload', relationTo: 'media' }] },
            { name: 'locations', type: 'array', fields: [{ name: 'label', type: 'text', required: true }, { name: 'detail', type: 'textarea' }] },
            { name: 'references', type: 'array', fields: [{ name: 'customer', type: 'text', required: true }, { name: 'summary', type: 'textarea' }, { name: 'permissionConfirmed', type: 'checkbox', defaultValue: false, admin: { description: 'Tick only with the customer’s written permission to name them.' } }] },
            { name: 'shippingNote', type: 'textarea', localized: true, admin: { description: 'Only real, current shipping terms.' } },
          ],
        },
        {
          label: 'Homepage images',
          description: 'Upload photos for the numbered image slots on the homepage (H1, D1 to D6, E1 to E4, F1 to F3, P1, I1 to I8, R1). Until a slot has an image, a neutral placeholder is shown.',
          fields: [
            {
              name: 'imageSlots',
              type: 'array',
              fields: [
                { name: 'slot', type: 'text', required: true, admin: { description: 'Slot code, e.g. H1' } },
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
              ],
            },
          ],
        },
        {
          label: 'Enquiries',
          description: 'How enquiries from the website reach you. Only admins can change these.',
          fields: [
            {
              name: 'enquiryRecipients',
              type: 'array',
              labels: { singular: 'Recipient', plural: 'Recipients' },
              access: { read: staffOnlyField, update: adminOnlyField, create: adminOnlyField },
              admin: { description: 'Who gets a notification email for each new enquiry. If empty, the Sales email and then the main email are used. Enquiries are always saved in the admin first.' },
              fields: [{ name: 'email', type: 'email', required: true }],
            },
            { name: 'allowEnquiryPhotos', type: 'checkbox', defaultValue: true, access: { update: adminOnlyField }, admin: { description: 'Let buyers attach up to three photos to a spare-parts request.' } },
            {
              name: 'autoReply',
              type: 'group',
              access: { read: staffOnlyField, update: adminOnlyField, create: adminOnlyField },
              admin: { description: 'Optional confirmation email to the buyer. Off by default.' },
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: false },
                { name: 'subject', type: 'text' },
                { name: 'body', type: 'textarea', admin: { description: 'Plain text. Do not promise response times you cannot keep.' } },
              ],
            },
            { name: 'enquiryRetentionMonths', type: 'number', min: 1, max: 120, access: { update: adminOnlyField }, admin: { description: 'Used by the purge script. Leave empty to keep enquiries until you delete them. Ask your legal adviser what period suits you.' } },
          ],
        },
        {
          label: 'Social and analytics',
          fields: [
            { name: 'linkedin', type: 'text' },
            { name: 'youtube', type: 'text' },
            { name: 'analyticsId', type: 'text', admin: { description: 'Optional. No analytics are loaded when empty.' } },
          ],
        },
      ],
    },
  ],
}
