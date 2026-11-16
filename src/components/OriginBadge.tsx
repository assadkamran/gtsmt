import { originOf } from '@/lib/origin'

export function OriginBadge({ origin, small = false }: { origin: string | null | undefined; small?: boolean }) {
  const o = originOf(origin)
  if (!o) return null
  const Icon = o.icon
  return small ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-tint px-2.5 py-1 text-xs font-semibold text-accent-text">
      <Icon aria-hidden className="size-3.5" />
      {o.label}
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-lg bg-accent-tint px-3 py-2 text-sm font-semibold text-accent-text">
      <Icon aria-hidden className="size-[1.125rem]" />
      {o.label}
    </span>
  )
}
