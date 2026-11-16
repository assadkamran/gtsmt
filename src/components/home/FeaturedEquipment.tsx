import Link from 'next/link'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import { getFeaturedProducts, isDev } from '@/lib/cms'
import { getTrees, productHref } from '@/lib/catalogue'
import { specRows, specText } from '@/lib/specs'
import { Section, SectionHead } from '../Section'

function Card({ title, category, specs, href, img }: { title: string; category: string; specs: string; href: string; img?: { url: string; alt: string } }) {
  return (
    <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(11,17,36,0.12)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-placeholder">
        {img ? (
          <Image src={img.url} alt={img.alt} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" className="object-contain p-4 transition-transform duration-500 motion-safe:group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-placeholder-text">
            <Camera aria-hidden className="size-5 opacity-70" strokeWidth={1.5} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em]">Product photo</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2.5 w-fit rounded-full bg-accent-tint px-2.5 py-1 text-xs font-semibold text-accent-text">{category}</span>
        <h3 className="text-[1.1875rem] font-bold text-dark-900">{title}</h3>
        {specs && <p className="mt-1 text-sm text-muted">{specs}</p>}
        <span className="mt-auto pt-4 text-sm font-semibold text-accent-text">View details and request a quote →</span>
      </div>
    </Link>
  )
}

export async function FeaturedEquipment() {
  const [products, trees] = await Promise.all([getFeaturedProducts(), getTrees()])
  if (products.length === 0 && !isDev) return null
  return (
    <Section id="equipment" labelledBy="equipment-h">
      <SectionHead eyebrow="Featured SMT equipment" id="equipment-h" title="Equipment, listed in process order." />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.length > 0
          ? products.map((p) => {
              const cat = typeof p.category === 'object' ? p.category : null
              const first = p.gallery?.[0]?.image
              const media = first && typeof first === 'object' ? first : null
              const specs = specRows(p).slice(0, 2).map((s) => `${s.label}: ${specText(s)}`).join(' · ')
              return (
                <li key={p.id} className="reveal">
                  <Card title={p.title} category={cat?.name ?? 'Equipment'} specs={specs} href={productHref(trees, p) ?? '/smt-equipment'} img={media?.url ? { url: media.url, alt: media.alt ?? p.title } : undefined} />
                </li>
              )
            })
          : ['Pick and Place', 'Reflow Oven', 'AOI', 'Solder Paste Printer'].map((c) => (
              <li key={c} className="reveal"><Card title="Featured product" category={c} specs="Key specifications appear here" href="/smt-equipment" /></li>
            ))}
      </ul>
      {products.length === 0 && isDev && (
        <p className="mt-6 rounded-lg border border-dashed border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn-text">
          Development preview: placeholder cards. In Products, tick &quot;Featured&quot; on up to four published products and they appear here with real photos and specifications. Hidden in production until then.
        </p>
      )}
    </Section>
  )
}
