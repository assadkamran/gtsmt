import type { ReactNode } from 'react'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'

/** Dark split hero for solution and industry pages. */
export function DarkHero({ crumbs, eyebrow, title, summary, actions, media }: { crumbs: Crumb[]; eyebrow: string; title: string; summary?: string | null; actions?: ReactNode; media?: ReactNode }) {
  return (
    <section aria-labelledby="page-title" className="on-dark dotgrid relative overflow-hidden bg-dark-900 text-white">
      <div className="grid lg:grid-cols-[5fr_7fr]">
        <div className="relative z-10 px-6 pb-12 pt-6 sm:pb-14 lg:pb-20 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] lg:pr-12">
          <Breadcrumbs items={crumbs} tone="dark" />
          <div className="mt-10 lg:mt-14">
            <span className="eyebrow">{eyebrow}</span>
            <h1 id="page-title" className="text-[clamp(2.125rem,4.4vw,3.375rem)] font-extrabold">{title}</h1>
            {summary && <p className="mt-5 max-w-[34rem] text-[1.125rem] leading-relaxed text-on-dark">{summary}</p>}
            {actions && <div className="mt-8 flex flex-wrap gap-3.5">{actions}</div>}
          </div>
        </div>
        {media}
      </div>
    </section>
  )
}
