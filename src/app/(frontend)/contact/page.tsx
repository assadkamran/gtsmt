import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from 'lucide-react'
import { getSettings, isDev } from '@/lib/cms'
import { rfqHref } from '@/lib/rfq'
import { pageMeta } from '@/lib/seo'
import { countryOptions } from '@/lib/countries'
import { Button } from '@/components/Button'
import { ContactForm } from '@/components/enquiry/ContactForm'
import { PageBand } from '@/components/PageBand'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return pageMeta({
    title: 'Contact | SMT Equipment and Spare Parts',
    description: 'Contact GTSMT about SMT equipment, production lines, feeders, spare parts and peripherals, or request a quote.',
    path: '/contact',
    noindex: !(s && (s.email || s.phone || s.address)),
  })
}

export default async function Page() {
  const s = await getSettings()
  const wa = s?.whatsapp?.replace(/\D/g, '') ?? ''
  const rows: { icon: LucideIcon; label: string; value: ReactNode }[] = []
  if (s?.email) rows.push({ icon: Mail, label: 'Email', value: <a className="text-accent-text hover:text-dark-900" href={`mailto:${s.email}`}>{s.email}</a> })
  if (s?.salesEmail) rows.push({ icon: Mail, label: 'Sales', value: <a className="text-accent-text hover:text-dark-900" href={`mailto:${s.salesEmail}`}>{s.salesEmail}</a> })
  if (s?.phone) rows.push({ icon: Phone, label: 'Phone', value: <a className="text-accent-text hover:text-dark-900" href={`tel:${s.phone.replace(/\s+/g, '')}`}>{s.phone}</a> })
  if (s?.whatsapp) rows.push({ icon: MessageCircle, label: 'WhatsApp', value: wa.length >= 7 ? <a className="text-accent-text hover:text-dark-900" href={`https://wa.me/${wa}`}>{s.whatsapp}</a> : s.whatsapp })
  if (s?.address) rows.push({ icon: MapPin, label: 'Address', value: <span className="whitespace-pre-line">{s.address}</span> })
  if (s?.businessHours) rows.push({ icon: Clock, label: 'Hours', value: s.businessHours })

  return (
    <>
      <PageBand
        crumbs={[{ label: 'Contact' }]}
        eyebrow="Contact"
        title="Contact GTSMT"
        intro="Send us your enquiry, or reach us directly."
        actions={<Button href={rfqHref()} size="lg">Request a quote</Button>}
      />
      <section aria-label="Contact details" className="bg-white">
        <div className="mx-auto grid max-w-page gap-8 px-6 py-12 lg:grid-cols-[1.2fr_1fr] lg:gap-14 lg:px-10 lg:py-16">
          <div>
            {rows.length > 0 ? (
              <dl className="divide-y divide-line rounded-card border border-line">
                {rows.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4 px-6 py-5">
                    <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-accent-text" />
                    <dt className="w-24 shrink-0 text-muted">{label}</dt>
                    <dd className="min-w-0 font-semibold text-dark-900">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="rounded-card border border-dashed border-line p-6">
                <p className="font-heading text-xl font-bold text-dark-900">Contact details are being added.</p>
                <p className="mt-1 text-muted">In the meantime, request a quote and tell us what you need.</p>
              </div>
            )}
            {isDev && <p className="mt-5 rounded-lg border border-dashed border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn-text">Development preview: each detail appears only if entered in Website Settings. No map is embedded because that needs a provider decision. This note is hidden in production.</p>}
          </div>
          <div className="on-dark self-start rounded-card bg-dark-900 p-7 text-white lg:p-8">
            <span className="eyebrow">Request a quote</span>
            <h2 className="text-2xl font-bold">The quickest way to get a reply.</h2>
            <p className="mb-6 mt-3 text-on-dark">Tell us whether you need a line, a machine, a part or a peripheral, and what you are building.</p>
            <Button href={rfqHref()} size="lg">Request a quote</Button>
          </div>
        </div>
      </section>
      <section aria-labelledby="message-h" className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-page gap-8 px-6 py-12 lg:grid-cols-[1.2fr_1fr] lg:gap-14 lg:px-10 lg:py-16">
          <div>
            <h2 id="message-h" className="mb-2 text-[1.75rem] font-bold text-dark-900 lg:text-3xl">Send us a message</h2>
            <p className="mb-6 max-w-xl text-muted">For a general question. If you need a quotation for a line, a machine or parts, the quote form asks the right questions for you.</p>
            <ContactForm
              options={{
                photos: false,
                siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null,
                brands: [],
                equipmentTypes: [],
                peripheralTypes: [],
                countries: countryOptions(),
              }}
            />
          </div>
        </div>
      </section>
    </>
  )
}
