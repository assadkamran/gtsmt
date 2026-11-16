import Image from 'next/image'
import { mediaOf } from '@/lib/catalogue'
import { ImagePlaceholder } from './MediaSlot'

/** Image from a CMS document's own upload field, falling back to a neutral placeholder. */
export function DocImage({
  media,
  brief,
  sizes,
  tone = 'dark',
  priority,
  fit = 'cover',
  className = '',
  imgClassName = '',
}: {
  media: unknown
  brief: string
  sizes: string
  tone?: 'dark' | 'light'
  priority?: boolean
  fit?: 'cover' | 'contain'
  className?: string
  imgClassName?: string
}) {
  const m = mediaOf(media)
  if (m?.url) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={m.url} alt={m.alt ?? ''} fill sizes={sizes} priority={priority} className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${imgClassName}`} />
      </div>
    )
  }
  return <ImagePlaceholder brief={brief} tone={tone} className={className} />
}
