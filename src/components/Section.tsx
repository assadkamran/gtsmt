import type { ReactNode } from 'react'

const tones = {
  white: 'bg-white text-ink',
  surface: 'bg-surface text-ink',
  dark: 'on-dark bg-dark-900 text-white',
}

export function Section({ tone = 'white', id, children, className = '', labelledBy }: { tone?: keyof typeof tones; id?: string; children: ReactNode; className?: string; labelledBy?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`${tones[tone]} py-16 md:py-24 ${className}`}>
      <div className="mx-auto max-w-page px-6 lg:px-10">{children}</div>
    </section>
  )
}

export function SectionHead({ eyebrow, title, id, intro, children }: { eyebrow: string; title: string; id: string; intro?: string; children?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
      <div className="max-w-3xl">
        <span className="eyebrow">{eyebrow}</span>
        <h2 id={id} className="text-[clamp(1.75rem,3.4vw,2.625rem)] font-bold">{title}</h2>
        {intro && <p className="mt-4 max-w-2xl text-[1.0625rem] text-muted [.on-dark_&]:text-on-dark">{intro}</p>}
      </div>
      {children}
    </div>
  )
}
