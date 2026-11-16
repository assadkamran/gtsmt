import type { CollectionConfig } from 'payload'
import { adminOnlyField, isAdmin, roleOf } from '../lib/access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  admin: { useAsTitle: 'email', group: 'System', defaultColumns: ['email', 'role'] },
  access: {
    admin: ({ req }) => Boolean(req.user),
    // Admins manage everyone. Everyone else can see and edit only their own account.
    read: ({ req }) => (roleOf(req) === 'admin' ? true : req.user ? { id: { equals: req.user.id } } : false),
    create: isAdmin,
    update: ({ req }) => (roleOf(req) === 'admin' ? true : req.user ? { id: { equals: req.user.id } } : false),
    delete: isAdmin,
  },
  hooks: {
    // The very first account becomes the admin, whatever the form says.
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        return totalDocs === 0 ? { ...data, role: 'admin' } : data
      },
    ],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'editor',
      required: true,
      saveToJWT: true,
      access: { update: adminOnlyField },
      admin: { description: 'Admin: everything. Editor: catalogue and content. Sales: enquiries, read-only catalogue.' },
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Sales', value: 'sales' },
      ],
    },
  ],
}
