import type { Metadata } from 'next'
import { Hero } from '@/components/home/Hero'
import { Divisions } from '@/components/home/Divisions'
import { LineSolutions } from '@/components/home/LineSolutions'
import { FeaturedEquipment } from '@/components/home/FeaturedEquipment'
import { PartsSection } from '@/components/home/PartsSection'
import { Peripherals } from '@/components/home/Peripherals'
import { Industries } from '@/components/home/Industries'
import { WhyGtsmt } from '@/components/home/WhyGtsmt'
import { Resources } from '@/components/home/Resources'
import { RfqSection } from '@/components/home/RfqSection'

// Fallback refresh; CMS edits also trigger on-demand revalidation.
export const revalidate = 3600

export const metadata: Metadata = {
  title: { absolute: 'GTSMT | Complete SMT Production Lines, Equipment, Feeders and Spare Parts' },
  description: 'Complete SMT production lines, pick and place machines, feeders, spare parts and PCB assembly peripherals for electronics manufacturers. Request a quote.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Divisions />
      <LineSolutions />
      <FeaturedEquipment />
      <PartsSection />
      <Peripherals />
      <Industries />
      <WhyGtsmt />
      <Resources />
      <RfqSection />
    </>
  )
}
