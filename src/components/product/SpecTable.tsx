import { specText } from '@/lib/specs'

export function SpecTable({ specs, caption }: { specs: { label: string; value: string; unit?: string | null }[]; caption: string }) {
  return (
    <div className="overflow-hidden rounded-card border border-line">
      <table className="w-full text-left">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-dark-900 text-xs uppercase tracking-[0.08em] text-on-dark">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Specification</th>
            <th scope="col" className="px-4 py-3 font-semibold">Value</th>
          </tr>
        </thead>
        <tbody>
          {specs.map((s, i) => (
            <tr key={`${s.label}-${i}`} className="even:bg-surface">
              <th scope="row" className="w-[42%] px-4 py-3 text-[0.9375rem] font-normal text-muted sm:text-base">{s.label}</th>
              <td className="px-4 py-3 text-[0.9375rem] font-semibold text-dark-900 sm:text-base">{specText(s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
