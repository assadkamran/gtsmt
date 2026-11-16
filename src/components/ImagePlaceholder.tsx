import { Camera } from 'lucide-react'

const isDev = process.env.NODE_ENV !== 'production'

type Tone = 'dark' | 'light'

/** Neutral, clearly-marked placeholder. Never shows a fabricated image. Hidden from assistive tech: it carries no information. */
export function ImagePlaceholder({ code, brief, tone = 'dark', className = '' }: { code?: string; brief: string; tone?: Tone; className?: string }) {
  const light = tone === 'light'
  const line = light ? 'rgba(11,17,36,.06)' : 'rgba(255,255,255,.05)'
  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center overflow-hidden ${light ? 'bg-placeholder text-placeholder-text' : 'bg-dark-700 text-on-dark-muted'} ${className}`}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`, backgroundSize: '22px 22px' }}
      />
      {isDev && code && <span className="absolute left-2.5 top-2.5 rounded bg-accent px-2 py-0.5 text-[11px] font-bold tracking-wide text-on-accent">{code}</span>}
      <div className="relative flex max-w-[16rem] flex-col items-center gap-2 px-4 text-center">
        <Camera aria-hidden className="size-5 opacity-70" strokeWidth={1.5} />
        <span className="text-[11px] font-semibold uppercase leading-snug tracking-[0.1em]">{isDev ? brief : 'Photo to be added'}</span>
      </div>
    </div>
  )
}
