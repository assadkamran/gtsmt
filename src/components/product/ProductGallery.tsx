'use client'

import Image from 'next/image'
import { useState } from 'react'

export type GalleryImage = { url: string; alt: string }

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [i, setI] = useState(0)
  const cur = images[Math.min(i, images.length - 1)]
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-surface">
        <Image key={cur.url} src={cur.url} alt={cur.alt || title} fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-contain p-6" />
      </div>
      {images.length > 1 && (
        <ul aria-label="Product images" className="mt-3 grid grid-cols-5 gap-3">
          {images.map((im, idx) => (
            <li key={`${im.url}-${idx}`}>
              <button
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Show image ${idx + 1} of ${images.length}`}
                aria-current={idx === i}
                className={`relative block aspect-[4/3] w-full overflow-hidden rounded-lg border bg-surface transition-colors ${idx === i ? 'border-2 border-accent' : 'border-line hover:border-dark-600'}`}
              >
                <Image src={im.url} alt="" fill sizes="120px" className="object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
