import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '../Button'

export function Confirmation({ reference, general = false }: { reference: string; general?: boolean }) {
  return (
    <div role="status" className="rounded-xl border border-line bg-white px-6 py-9 text-center">
      <span aria-hidden className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-accent-tint text-accent-text"><Check className="size-7" strokeWidth={2.5} /></span>
      <h2 className="font-heading text-2xl font-extrabold text-dark-900">{general ? 'Message received' : 'Enquiry received'}</h2>
      <p className="mx-auto mb-4 mt-1.5 max-w-md text-[0.9375rem] text-muted">
        We have received your {general ? 'message' : 'enquiry'} and will reply by email. Keep this reference if you contact us about it.
      </p>
      <p className="inline-block rounded-lg border border-line bg-surface px-[1.125rem] py-2.5 font-heading text-[1.0625rem] font-bold tracking-wide text-dark-900">{reference}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <Button href="/" size="sm">Back to home</Button>
        <Button href="/smt-equipment" size="sm" variant="outline">Browse equipment</Button>
      </div>
      <p className="mt-5 text-[0.8125rem] text-muted">Need to add something? <Link href="/contact" className="font-semibold text-accent-text hover:underline">Contact us</Link> and quote the reference.</p>
    </div>
  )
}
