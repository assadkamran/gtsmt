'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

const stations = [
  { name: 'Loader', title: 'PCB loader', body: 'Feeds bare boards into the line from magazines or stacks, so the line stays supplied without manual handling.', cat: 'PCB Loaders', href: '/smt-equipment/pcb-loaders' },
  { name: 'Printer', title: 'Solder paste printer', body: 'Deposits solder paste onto the pads through a stencil. Print quality strongly influences downstream defect rates.', cat: 'Solder Paste Printers', href: '/smt-equipment/solder-paste-printers' },
  { name: 'SPI', title: 'Solder paste inspection', body: 'Measures the deposited paste so print defects are caught before any components are placed.', cat: 'SPI', href: '/smt-equipment/spi-solder-paste-inspection' },
  { name: 'Pick and place', title: 'Pick and place machine', body: 'Places components onto the printed board, fed from tape, tray or stick feeders.', cat: 'Pick and Place Machines', href: '/smt-equipment/pick-and-place-machines' },
  { name: 'Reflow', title: 'Reflow soldering oven', body: 'Heats the assembly through a controlled temperature profile to form the solder joints.', cat: 'Reflow Soldering Ovens', href: '/smt-equipment/reflow-soldering-ovens' },
  { name: 'AOI', title: 'Automated optical inspection', body: 'Inspects soldered boards for placement and solder defects. NG/OK buffers can sort the results.', cat: 'AOI', href: '/smt-equipment/aoi-automated-optical-inspection' },
  { name: 'Unloader', title: 'PCB unloader', body: 'Collects finished boards into magazines or onto a conveyor for the next process.', cat: 'PCB Unloaders', href: '/smt-equipment/pcb-unloaders' },
]

export function LineExplorer() {
  const [i, setI] = useState(3)
  const s = stations[i]
  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
      <div role="group" aria-label="Production line stations" className="flex flex-col gap-2.5">
        {stations.map((st, idx) => (
          <button
            key={st.name}
            type="button"
            aria-pressed={i === idx}
            onClick={() => setI(idx)}
            className={`flex items-center gap-4 rounded-lg border bg-white px-[1.125rem] py-3.5 text-left text-[1.0625rem] font-semibold transition-all duration-200 motion-reduce:transition-none ${i === idx ? 'border-accent shadow-[0_0_0_3px_rgba(47,91,240,0.2)]' : 'border-line hover:border-dark-600'}`}
          >
            <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-full text-[0.8125rem] font-bold ${i === idx ? 'bg-accent text-on-accent' : 'bg-surface text-dark-700'}`}>{idx + 1}</span>
            {st.name}
          </button>
        ))}
      </div>
      <div aria-live="polite" className="on-dark rounded-card bg-dark-900 p-8 text-white lg:sticky lg:top-28 lg:self-start lg:p-10">
        <span className="eyebrow">Station {String(i + 1).padStart(2, '0')} of {stations.length}</span>
        <h3 className="text-[1.625rem] font-bold">{s.title}</h3>
        <p className="mb-6 mt-3 text-on-dark">{s.body}</p>
        <Link href={s.href} className="inline-flex h-12 items-center gap-2 rounded-control bg-accent px-6 font-semibold text-on-accent transition-colors hover:bg-accent-hover">
          View {s.cat} <ArrowRight aria-hidden className="size-[1.125rem]" />
        </Link>
      </div>
    </div>
  )
}
