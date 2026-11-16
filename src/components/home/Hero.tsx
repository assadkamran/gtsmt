import { Button } from '../Button'
import { MediaSlot } from '../MediaSlot'
import { LineStrip } from './LineStrip'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <>
      <section aria-labelledby="hero-h" className="on-dark dotgrid relative overflow-hidden bg-dark-900 text-white">
        <div className="grid lg:grid-cols-[5fr_7fr]">
          <div className="relative z-10 px-6 pb-14 pt-14 sm:pt-20 lg:py-28 lg:pb-32 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] lg:pr-12">
            <span className="eyebrow">SMT equipment · Feeders · Spare parts</span>
            <h1 id="hero-h" className="text-[clamp(2.125rem,4.4vw,3.625rem)] font-extrabold">Complete SMT Solutions for Modern PCB Manufacturing.</h1>
            <p className="mt-6 max-w-[34rem] text-[1.1875rem] leading-relaxed text-on-dark">
              From complete SMT production lines to precision feeders, spare parts and manufacturing peripherals, GTSMT supports electronics manufacturers with integrated PCB assembly solutions.
            </p>
            <div className="mt-9 flex flex-wrap gap-3.5">
              <Button href="/smt-solutions" size="lg">Explore SMT Solutions <ArrowRight aria-hidden className="size-[1.125rem]" /></Button>
              <Button href="/request-a-quote" variant="outline-light" size="lg">Request a Quote</Button>
            </div>
          </div>
          <MediaSlot
            code="H1"
            brief="Hero: SMT line, shallow depth of field, cool deep-blue grade, 7:6"
            sizes="(min-width: 1024px) 58vw, 100vw"
            priority
            className="min-h-[16rem] sm:min-h-[22rem] lg:min-h-[34rem]"
          />
        </div>
      </section>
      <div className="relative z-20 mx-auto -mt-8 max-w-page px-6 lg:-mt-11 lg:px-10">
        <LineStrip />
      </div>
    </>
  )
}
