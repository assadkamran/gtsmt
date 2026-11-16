import type { ReactNode } from 'react'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'

/** Light header band for hubs and category pages. Visually distinct from the dark heroes. */
export function PageBand({ crumbs, eyebrow, title, intro, actions, media, children }: { crumbs: Crumb[]; eyebrow: string; title: string; intro?: string | null; actions?: ReactNode; media?: ReactNode; children?: ReactNode }) {
  return (
    <section aria-labelledby="page-title" className="border-b border-line bg-surface">
      <div className="mx-auto max-w-page px-6 pb-10 pt-6 lg:px-10 lg:pb-14">
        <Breadcrumbs items={crumbs} />
        <div className={`mt-8 grid items-center gap-8 lg:mt-10 ${media ? 'lg:grid-cols-[7fr_5fr] lg:gap-14' : ''}`}>
          <div className="max-w-3xl">
            <span className="eyebrow">{eyebrow}</span>
            <h1 id="page-title" className="text-[clamp(2rem,4.4vw,3.125rem)] font-extrabold text-dark-900">{title}</h1>
            {intro && <p className="mt-4 text-[1.1875rem] leading-relaxed text-muted">{intro}</p>}
            {actions && <div className="mt-7 flex flex-wrap gap-3.5">{actions}</div>}
          </div>
          {media}
        </div>
        {children}
      </div>
    </section>
  )
}
