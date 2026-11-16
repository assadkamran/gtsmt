import Link from 'next/link'
import type { ComponentProps } from 'react'

type Variant = 'primary' | 'outline' | 'outline-light' | 'ghost'
type Size = 'md' | 'lg' | 'sm'

const base =
  'inline-flex items-center justify-center gap-2 rounded-control border-2 font-semibold transition-colors duration-200 motion-reduce:transition-none whitespace-nowrap'
const variants: Record<Variant, string> = {
  primary: 'bg-accent border-accent text-on-accent hover:bg-accent-hover hover:border-accent-hover',
  outline: 'border-dark-900 text-dark-900 hover:bg-dark-900 hover:text-white',
  'outline-light': 'border-white text-white hover:bg-white/10',
  ghost: 'border-transparent text-accent-text hover:text-dark-900 px-0',
}
const sizes: Record<Size, string> = {
  sm: 'h-11 px-5 text-sm',
  md: 'h-12 px-6 text-base',
  lg: 'h-[3.25rem] px-7 text-base',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link {...props} className={`${base} ${variants[variant]} ${variant === 'ghost' ? '' : sizes[size]} ${className}`} />
}
