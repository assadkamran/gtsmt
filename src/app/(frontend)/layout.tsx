import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { CompareTray } from '@/components/compare/CompareTray'
import { getSettings } from '@/lib/cms'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'GTSMT | SMT Equipment, Feeders and Spare Parts', template: '%s | GTSMT' },
  description: 'Complete SMT production lines, equipment, feeders, spare parts and peripherals for PCB assembly.',
  openGraph: { type: 'website', siteName: 'GTSMT', locale: 'en' },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = { themeColor: '#0b1124', width: 'device-width', initialScale: 1 }

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const s = await getSettings()
  const org: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'Organization', name: 'GTSMT', url: siteUrl }
  if (s?.legalName) org.legalName = s.legalName
  if (s?.email || s?.phone) org.contactPoint = [{ '@type': 'ContactPoint', contactType: 'sales', ...(s?.email ? { email: s.email } : {}), ...(s?.phone ? { telephone: s.phone } : {}) }]
  const sameAs = [s?.linkedin, s?.youtube].filter(Boolean)
  if (sameAs.length) org.sameAs = sameAs
  return (
    <html lang="en">
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org).replace(/</g, '\\u003c') }} />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <CompareTray />
      </body>
    </html>
  )
}
