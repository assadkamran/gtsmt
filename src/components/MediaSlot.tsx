import Image from 'next/image'
import { getSlotMap } from '@/lib/cms'
import { ImagePlaceholder } from './ImagePlaceholder'

export { ImagePlaceholder }

type Tone = 'dark' | 'light'

type Props = {
  code: string
  /** Art-direction note shown on the placeholder (what this photo should show). */
  brief: string
  sizes: string
  tone?: Tone
  priority?: boolean
  className?: string
  imgClassName?: string
}

/** Homepage image slot: shows the photo assigned in Website Settings > Homepage images, else a placeholder. */
export async function MediaSlot({ code, brief, sizes, tone = 'dark', priority, className = '', imgClassName = '' }: Props) {
  const slots = await getSlotMap()
  const img = slots[code.toUpperCase()]
  if (img) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={img.url} alt={img.alt || ''} fill sizes={sizes} priority={priority} className={`object-cover ${imgClassName}`} />
      </div>
    )
  }
  return <ImagePlaceholder code={code} brief={brief} tone={tone} className={className} />
}
