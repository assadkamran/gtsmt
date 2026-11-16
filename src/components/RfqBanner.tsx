import { Button } from './Button'

export function RfqBanner({ id, eyebrow = 'Request a quote', title, chips, note, href, cta = 'Request a quote' }: { id: string; eyebrow?: string; title: string; chips?: string[]; note?: string; href: string; cta?: string }) {
  return (
    <section aria-labelledby={id} className="on-dark bg-dark-900 py-14 text-white md:py-16">
      <div className="mx-auto flex max-w-page flex-col gap-8 px-6 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="max-w-2xl">
          <span className="eyebrow">{eyebrow}</span>
          <h2 id={id} className="text-[clamp(1.5rem,3vw,2.125rem)] font-bold">{title}</h2>
          {chips && chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2.5 text-sm text-on-dark">
              {chips.map((c) => <li key={c} className="rounded-full border border-dark-600 px-3.5 py-1.5">{c}</li>)}
            </ul>
          )}
          {note && <p className="mt-4 inline-flex rounded-lg border border-dark-600 bg-dark-800 px-3.5 py-2 text-sm text-on-dark">{note}</p>}
        </div>
        <Button href={href} size="lg" className="shrink-0 self-start md:self-auto">{cta}</Button>
      </div>
    </section>
  )
}
