'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

export type SequenceStation = { name: string; note: string; optional: boolean; href?: string; categoryName?: string }

export function LineSequence({ stations, defaultIndex }: { stations: SequenceStation[]; defaultIndex?: number }) {
  const [i, setI] = useState(Math.min(defaultIndex ?? 3, stations.length - 1))
  const s = stations[i]
  return (
    <div>
      <div role="group" aria-label="Production line stations" className="flex flex-wrap gap-2.5">
        {stations.map((st, idx) => (
          <button
            key={`${st.name}-${idx}`}
            type="button"
            aria-pressed={i === idx}
            onClick={() => setI(idx)}
            className={`flex items-center gap-3 rounded-lg bg-white px-4 py-3 text-left text-base font-semibold transition-all duration-200 motion-reduce:transition-none ${st.optional ? 'border-dashed' : ''} ${i === idx ? 'border-2 border-accent shadow-[0_0_0_3px_rgba(47,91,240,0.2)]' : 'border border-line hover:border-dark-600'}`}
          >
            <span aria-hidden className={`grid size-[1.875rem] shrink-0 place-items-center rounded-full text-[0.8125rem] font-bold ${i === idx ? 'bg-accent text-on-accent' : 'bg-surface text-dark-700'}`}>{idx + 1}</span>
            {st.name}
            {st.optional && <span className="text-[0.6875rem] font-semibold text-muted">optional</span>}
          </button>
        ))}
      </div>
      <div aria-live="polite" className="on-dark mt-5 flex flex-col gap-5 rounded-card bg-dark-900 p-7 text-white md:flex-row md:items-center md:justify-between lg:p-8">
        <div>
          <span className="eyebrow">Station {String(i + 1).padStart(2, '0')} of {stations.length}{s.optional ? ' · optional' : ''}</span>
          <h3 className="text-2xl font-bold">{s.name}</h3>
          <p className="mt-2 max-w-2xl text-on-dark">{s.note}</p>
        </div>
        {s.href && (
          <Link href={s.href} className="inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-control bg-accent px-6 font-semibold text-on-accent transition-colors hover:bg-accent-hover md:self-auto">
            View {s.categoryName ?? 'category'} <ArrowRight aria-hidden className="size-[1.125rem]" />
          </Link>
        )}
      </div>
    </div>
  )
}
