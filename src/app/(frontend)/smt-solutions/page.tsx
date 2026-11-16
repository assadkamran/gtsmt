import { SolutionsHub } from '@/components/solutions/SolutionViews'
import { pageMeta } from '@/lib/seo'

export const revalidate = 3600

export const metadata = pageMeta({
  title: 'SMT Production-Line Solutions',
  description: 'Complete, turnkey, LED, high-speed and flexible SMT production lines, factory setup and customised solutions for PCB assembly. Plan your line.',
  path: '/smt-solutions',
})

export default function Page() {
  return <SolutionsHub />
}
