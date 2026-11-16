import { Plus, Minus } from 'lucide-react'

export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="border-t border-line">
      {items.map((f, i) => (
        <details key={`${f.question}-${i}`} className="group border-b border-line py-5" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-[1.1875rem] font-bold text-dark-900 sm:text-xl [&::-webkit-details-marker]:hidden">
            {f.question}
            <Plus aria-hidden className="size-5 shrink-0 text-accent-text group-open:hidden" />
            <Minus aria-hidden className="hidden size-5 shrink-0 text-accent-text group-open:block" />
          </summary>
          <p className="mt-3 max-w-3xl text-muted">{f.answer}</p>
        </details>
      ))}
    </div>
  )
}
