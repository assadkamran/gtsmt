import { Check } from 'lucide-react'

/**
 * The visual checkbox. Put it directly after an `<input type="checkbox" className="peer sr-only">` so the real input
 * keeps keyboard, focus and screen-reader behaviour and this only draws the box.
 */
export function Tick({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`grid size-[1.125rem] shrink-0 place-items-center rounded-[4px] border-[1.5px] border-[#6b7794] bg-white text-transparent peer-checked:border-accent peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text peer-disabled:border-line peer-disabled:bg-surface ${className}`}
    >
      <Check className="size-3.5" strokeWidth={3} />
    </span>
  )
}
