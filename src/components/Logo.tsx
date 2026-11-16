import Link from 'next/link'

export function Logo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="GTSMT home" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span aria-hidden className="inline-flex gap-[3px]">
        <b className="h-[22px] w-[9px] rounded-[2px] bg-accent" />
        <b className={`h-[22px] w-[9px] rounded-[2px] ${light ? 'bg-on-dark-muted' : 'bg-dark-700'}`} />
      </span>
      <span className={`font-heading text-[1.45rem] font-extrabold sm:text-[1.65rem] tracking-tight ${light ? 'text-white' : 'text-dark-900'}`}>GTSMT</span>
    </Link>
  )
}
