import type { Access, FieldAccess, PayloadRequest } from 'payload'

export type Role = 'admin' | 'editor' | 'sales'

export const roleOf = (req: Pick<PayloadRequest, 'user'>): Role | null => {
  const r = (req.user as { role?: Role } | null | undefined)?.role
  return r ?? null
}

const has = (req: Pick<PayloadRequest, 'user'>, roles: Role[]) => {
  const r = roleOf(req)
  return r !== null && roles.includes(r)
}

/** Everything. Users, settings that matter, destructive actions. */
export const isAdmin: Access = ({ req }) => has(req, ['admin'])
/** Catalogue and content: products, categories, media, articles. */
export const isContentEditor: Access = ({ req }) => has(req, ['admin', 'editor'])
/** Enquiries and sales material. */
export const isSalesOrAdmin: Access = ({ req }) => has(req, ['admin', 'sales'])
/** Any signed-in team member. */
export const isStaff: Access = ({ req }) => Boolean(req.user)

export const publicRead: Access = () => true
export const publishedOnly: Access = ({ req }) => (req.user ? true : { _status: { equals: 'published' } })

export const adminOnlyField: FieldAccess = ({ req }) => has(req, ['admin'])
export const staffOnlyField: FieldAccess = ({ req }) => Boolean(req.user)
export const nobodyField: FieldAccess = () => false
