import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Manufacturers } from './collections/Manufacturers'
import { MachineModels } from './collections/MachineModels'
import { SpecAttributes } from './collections/SpecAttributes'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { ProductDocuments } from './collections/ProductDocuments'
import { Solutions } from './collections/Solutions'
import { Industries } from './collections/Industries'
import { Articles } from './collections/Articles'
import { Enquiries } from './collections/Enquiries'
import { EnquiryFiles } from './collections/EnquiryFiles'
import { SearchMisses } from './collections/SearchMisses'
import { SiteSettings } from './globals/SiteSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/**
 * Email goes out through Resend when RESEND_API_KEY is set. Without it, Payload writes emails to the console,
 * which is what development wants. Swap the adapter here to use SMTP or another provider.
 */
const email = process.env.RESEND_API_KEY
  ? resendAdapter({
      defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'enquiries@gtsmt.com',
      defaultFromName: process.env.EMAIL_FROM_NAME || 'GTSMT',
      apiKey: process.env.RESEND_API_KEY,
    })
  : undefined

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' | GTSMT CMS' },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Users, Media, Manufacturers, MachineModels, SpecAttributes, Categories, Products, ProductDocuments, Solutions, Industries, Articles, Enquiries, EnquiryFiles, SearchMisses],
  globals: [SiteSettings],
  localization: { locales: [{ label: 'English', code: 'en' }], defaultLocale: 'en', fallback: true },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  // Cookie-authenticated admin requests are accepted only from our own origin.
  csrf: [siteUrl],
  cors: [siteUrl],
  email,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    // Schema changes go through migrations in every environment (npm run migrate:create, npm run migrate).
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
})
