import { Section } from '../Section'
import { RfqStarter } from './RfqStarter'

export function RfqSection() {
  return (
    <Section tone="dark" id="rfq" labelledBy="rfq-h">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="eyebrow">Request a quote</span>
          <h2 id="rfq-h" className="text-[clamp(1.875rem,3.6vw,2.75rem)] font-bold">Tell us what you&apos;re building.</h2>
          <p className="mb-7 mt-4 max-w-lg text-[1.0625rem] text-on-dark">Request a single part, a machine, or a full line. The form collects what we need to respond with a relevant proposal.</p>
          <div aria-hidden className="flex max-w-sm gap-2"><i className="h-1.5 flex-1 rounded-full bg-accent" /><i className="h-1.5 flex-1 rounded-full bg-dark-600" /><i className="h-1.5 flex-1 rounded-full bg-dark-600" /><i className="h-1.5 flex-1 rounded-full bg-dark-600" /></div>
          <p className="mt-3 text-sm text-on-dark-muted">Step 1 of 4. No account needed. Your details are used only to respond to your enquiry.</p>
        </div>
        <RfqStarter />
      </div>
    </Section>
  )
}
