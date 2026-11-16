import { Button } from '@/components/Button'
import { Section } from '@/components/Section'

export default function NotFound() {
  return (
    <Section className="min-h-[60vh]">
      <span className="eyebrow">404</span>
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-dark-900">We couldn&apos;t find that page.</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">The link may be out of date. Try the main sections, or send us what you are looking for.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Button href="/">Go to homepage</Button><Button href="/request-a-quote" variant="outline">Request a Quote</Button></div>
    </Section>
  )
}
