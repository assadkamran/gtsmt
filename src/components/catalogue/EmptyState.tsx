import { Button } from '../Button'

export function EmptyState({ title, text, href, cta = 'Request a quote' }: { title: string; text: string; href: string; cta?: string }) {
  return (
    <div className="flex flex-col items-start justify-between gap-5 rounded-card border-2 border-dashed border-line p-6 sm:flex-row sm:items-center sm:p-8">
      <div>
        <p className="font-heading text-xl font-bold text-dark-900">{title}</p>
        <p className="mt-1 max-w-xl text-muted">{text}</p>
      </div>
      <Button href={href} size="sm" className="shrink-0">{cta}</Button>
    </div>
  )
}
