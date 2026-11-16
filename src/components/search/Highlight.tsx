import { splitForHighlight } from '@/lib/search/normalise'

/** Wraps the words that matched the query. Works in server and client components. */
export function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  return (
    <>
      {splitForHighlight(text, tokens).map((s, i) =>
        s.hit ? (
          <mark key={i} className="rounded-[3px] bg-accent-tint px-0.5 font-semibold text-accent-text">{s.text}</mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  )
}
