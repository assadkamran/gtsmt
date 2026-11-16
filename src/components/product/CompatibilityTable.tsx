import { BadgeCheck } from 'lucide-react'

export type CompatRow = { manufacturer: string; model: string; source: string; note?: string | null }

export function CompatibilityTable({ rows }: { rows: CompatRow[] }) {
  return (
    <div className="overflow-x-auto rounded-card border border-line">
      <table className="w-full min-w-[32rem] text-left">
        <caption className="sr-only">Machine models this product is verified to fit</caption>
        <thead className="bg-dark-900 text-xs uppercase tracking-[0.08em] text-on-dark">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Manufacturer</th>
            <th scope="col" className="px-4 py-3 font-semibold">Machine model</th>
            <th scope="col" className="px-4 py-3 font-semibold">Verified by</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.model}-${i}`} className="align-top even:bg-surface">
              <td className="px-4 py-3.5">{r.manufacturer}</td>
              <th scope="row" className="px-4 py-3.5 font-semibold text-dark-900">{r.model}</th>
              <td className="px-4 py-3.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-tint px-2.5 py-1 text-xs font-semibold text-accent-text"><BadgeCheck aria-hidden className="size-3.5" />Verified</span>
                <span className="mt-1.5 block text-[0.9375rem] text-muted">{r.source}</span>
                {r.note && <span className="mt-0.5 block text-sm text-muted">{r.note}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
