import { getSettings, isDev } from '@/lib/cms'
import { Section, SectionHead } from '../Section'

const points = [
  ['Complete scope', 'Lines, machines, feeders, parts and peripherals through one supplier relationship.'],
  ['Technical clarity', 'Structured specifications and datasheets on every product page.'],
  ['Transparent sourcing', 'Part origin and verified compatibility are stated up front.'],
  ['Simple enquiry', 'Request a quote from any product, or plan a whole line in minutes.'],
]

export async function WhyGtsmt() {
  const s = await getSettings()
  const certs = s?.certifications ?? []
  const locs = s?.locations ?? []
  const refs = (s?.references ?? []).filter((r) => r.permissionConfirmed)
  const facts: { k: string; v: string }[] = []
  if (s?.yearFounded) facts.push({ k: 'Founded', v: String(s.yearFounded) })
  if (certs.length) facts.push({ k: 'Certifications', v: certs.map((c) => c.name).join(', ') })
  if (locs.length) facts.push({ k: 'Locations', v: locs.map((l) => l.label).join(', ') })
  if (refs.length) facts.push({ k: 'Customer references', v: refs.map((r) => r.customer).join(', ') })
  return (
    <Section id="why" labelledBy="why-h">
      <SectionHead eyebrow="Why GTSMT" id="why-h" title="Clear information. Honest sourcing. One enquiry." />
      <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {points.map(([t, d]) => (
          <li key={t} className="reveal border-t-[3px] border-accent pt-5">
            <h3 className="mb-2 text-xl font-bold text-dark-900">{t}</h3>
            <p className="text-[0.9375rem] text-muted">{d}</p>
          </li>
        ))}
      </ul>
      {facts.length > 0 && (
        <dl className="mt-12 grid gap-6 rounded-card bg-surface p-6 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f) => <div key={f.k}><dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{f.k}</dt><dd className="mt-1 font-heading text-lg font-bold text-dark-900">{f.v}</dd></div>)}
        </dl>
      )}
      {facts.length === 0 && isDev && (
        <p className="mt-10 rounded-lg border border-dashed border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn-text">
          Development preview: years in business, certifications, locations and customer references appear here only when entered in Website Settings, Trust tab. Nothing is invented. Hidden in production until then.
        </p>
      )}
    </Section>
  )
}
