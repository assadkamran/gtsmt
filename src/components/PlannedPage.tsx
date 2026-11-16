import { Button } from './Button'
import { Breadcrumbs } from './Breadcrumbs'
import type { NavLink } from '@/lib/nav'
import { rfqHref } from '@/lib/rfq'

/** Honest "in preparation" page for routes that are promised but not built yet. Always noindex (set by the route). */
export function PlannedPage({ route }: { route: NavLink }) {
  const parts = route.href.split('/').filter(Boolean)
  return (
    <section className="min-h-[60vh] bg-white py-16 md:py-24">
      <div className="mx-auto max-w-page px-6 lg:px-10">
        <Breadcrumbs items={[...parts.slice(0, -1).map((p, i) => ({ label: p.replace(/-/g, ' '), href: '/' + parts.slice(0, i + 1).join('/') })), { label: route.label }]} />
        <span className="eyebrow mt-10">In preparation</span>
        <h1 className="max-w-3xl text-[clamp(2rem,4vw,3rem)] font-extrabold text-dark-900">{route.label}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">{route.description ?? 'This page is being prepared. In the meantime, tell us what you need and our team will respond with a relevant proposal.'}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={rfqHref({ topic: route.label })}>Request a Quote</Button>
          <Button href="/" variant="outline">Back to home</Button>
        </div>
      </div>
    </section>
  )
}
