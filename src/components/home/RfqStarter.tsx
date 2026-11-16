'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, type FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'

const needs = [
  { v: 'line', l: 'Complete SMT line', d: 'Plan a full production line' },
  { v: 'equipment', l: 'Equipment', d: 'A machine or upgrade' },
  { v: 'part', l: 'Spare parts', d: 'Feeders, nozzles, components' },
  { v: 'peripherals', l: 'Peripherals', d: 'Loaders, conveyors, buffers' },
]

export function RfqStarter() {
  const router = useRouter()
  const name = useId()
  const [need, setNeed] = useState('line')
  function onSubmit(e: FormEvent) { e.preventDefault(); router.push(`/request-a-quote?need=${need}`) }
  return (
    <form onSubmit={onSubmit} className="rounded-card bg-white p-6 text-ink sm:p-8">
      <fieldset>
        <legend className="mb-4 font-heading text-[1.4375rem] font-bold text-dark-900">What do you need?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {needs.map((n) => (
            <label key={n.v} className={`block cursor-pointer rounded-lg border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-text ${need === n.v ? 'border-2 border-accent bg-accent-tint p-[0.9375rem]' : 'border-line hover:border-dark-600'}`}>
              <input type="radio" name={name} value={n.v} checked={need === n.v} onChange={() => setNeed(n.v)} className="sr-only" />
              <span className="block font-semibold text-dark-900">{n.l}</span>
              <span className="block text-sm text-muted">{n.d}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="mt-6 inline-flex h-[3.25rem] items-center gap-2 rounded-control bg-accent px-7 font-semibold text-on-accent transition-colors hover:bg-accent-hover">
        Continue <ArrowRight aria-hidden className="size-[1.125rem]" />
      </button>
    </form>
  )
}
