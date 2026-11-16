import { Button } from '../Button'
import { Section, SectionHead } from '../Section'
import { LineExplorer } from './LineExplorer'

export function LineSolutions() {
  return (
    <Section tone="surface" id="solutions" labelledBy="solutions-h">
      <SectionHead eyebrow="Complete SMT production-line solutions" id="solutions-h" title="See how a line fits together." intro="Select a station to see its role in the process and the equipment category that supplies it. Configurations vary with board, capacity and budget." />
      <div className="reveal"><LineExplorer /></div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button href="/request-a-quote?need=line">Plan my line</Button>
        <Button href="/smt-solutions" variant="outline">All production-line solutions</Button>
      </div>
    </Section>
  )
}
