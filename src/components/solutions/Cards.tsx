import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Industry, Solution } from '@/payload-types'
import { DocImage } from '../DocImage'

export function SolutionCard({ solution }: { solution: Solution }) {
  return (
    <Link href={`/smt-solutions/${solution.slug}`} className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(11,17,36,0.12)]">
      <DocImage media={solution.heroImage} brief={solution.title} sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw" className="aspect-[16/10]" imgClassName="transition-transform duration-500 motion-safe:group-hover:scale-[1.03]" />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-dark-900 transition-colors group-hover:text-accent-text">{solution.title}</h3>
        {solution.summary && <p className="mt-2 line-clamp-3 text-[0.9375rem] text-muted">{solution.summary}</p>}
        <span className="mt-auto flex items-center gap-1.5 pt-4 text-[0.9375rem] font-semibold text-accent-text">Explore solution<ArrowRight aria-hidden className="size-4 transition-transform motion-safe:group-hover:translate-x-1" /></span>
      </div>
    </Link>
  )
}

export function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <Link href={`/industries/${industry.slug}`} className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(11,17,36,0.12)]">
      <DocImage media={industry.image} brief={industry.title} sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 100vw" className="aspect-[16/10]" imgClassName="transition-transform duration-500 motion-safe:group-hover:scale-[1.03]" />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1.1875rem] font-bold text-dark-900 transition-colors group-hover:text-accent-text">{industry.title}</h3>
        {industry.intro && <p className="mt-1.5 line-clamp-3 text-[0.9375rem] text-muted">{industry.intro}</p>}
        <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-semibold text-accent-text">Learn more<ArrowRight aria-hidden className="size-4 transition-transform motion-safe:group-hover:translate-x-1" /></span>
      </div>
    </Link>
  )
}
