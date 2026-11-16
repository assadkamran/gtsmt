/**
 * Creates (or removes) the throwaway accounts the end-to-end tests log in with: one admin, one editor and one sales
 * user, all at @e2e.example.com. example.com is reserved for examples, so no real person has such an address.
 * Passwords are random for each run and kept only in .local/e2e-users.json (not committed).
 *
 * The first account created while the users table is empty becomes the admin by design, so the admin is created first.
 * Refuses to run in production.
 *
 * Run by the test suite itself; by hand:  npm run test:users  /  npm run test:users -- --remove
 */
import fs from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config'

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to create test accounts in production.')
  process.exit(1)
}

const FILE = path.resolve('.local/e2e-users.json')
const where = { email: { like: '@e2e.example.com' } }
const payload = await getPayload({ config })

const removed = await payload.delete({ collection: 'users', where })
if (process.argv.includes('--remove')) {
  fs.rmSync(FILE, { force: true })
  console.log(`Removed ${removed.docs.length} test accounts.`)
  process.exit(0)
}

const password = `E2e-${randomBytes(12).toString('base64url')}`
const out: Record<string, { id: number; email: string; password: string }> = {}
for (const role of ['admin', 'editor', 'sales'] as const) {
  const u = await payload.create({ collection: 'users', data: { email: `e2e-${role}@e2e.example.com`, password, role } })
  out[role] = { id: u.id, email: u.email, password }
}
fs.mkdirSync(path.dirname(FILE), { recursive: true })
fs.writeFileSync(FILE, JSON.stringify(out), { mode: 0o600 })
console.log('Created test accounts: admin, editor, sales.')
process.exit(0)
