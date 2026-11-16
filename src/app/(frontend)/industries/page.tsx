import { IndustriesHub } from '@/components/solutions/IndustryViews'
import { pageMeta } from '@/lib/seo'

export const revalidate = 3600

export const metadata = pageMeta({
  title: 'Industries We Serve | SMT Equipment and Solutions',
  description: 'How SMT equipment and production lines serve automotive, consumer, LED, medical, industrial, power, telecommunications and contract electronics manufacturing.',
  path: '/industries',
})

export default function Page() {
  return <IndustriesHub />
}
