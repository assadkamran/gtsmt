import { BadgeCheck, ShieldCheck, Package, ArrowLeftRight, RefreshCw, type LucideIcon } from 'lucide-react'

export type OriginValue = 'new-machine' | 'genuine-oem' | 'oem-surplus' | 'compatible-aftermarket' | 'used-refurbished'

/** Labels buyers see. Definitions are drafts for the owner to confirm against how GTSMT actually sources parts. */
export const ORIGIN: Record<OriginValue, { label: string; definition: string; icon: LucideIcon }> = {
  'new-machine': { label: 'New machine', definition: 'A new machine.', icon: BadgeCheck },
  'genuine-oem': { label: 'Genuine OEM part', definition: 'A part made by the machine’s original manufacturer.', icon: ShieldCheck },
  'oem-surplus': { label: 'OEM surplus', definition: 'An original-manufacturer part from surplus stock, not current production.', icon: Package },
  'compatible-aftermarket': { label: 'Compatible aftermarket', definition: 'Made by a third party to fit specific machines. Not an original part.', icon: ArrowLeftRight },
  'used-refurbished': { label: 'Used or refurbished', definition: 'Previously used. The listing states its condition.', icon: RefreshCw },
}

export const PART_ORIGINS: OriginValue[] = ['genuine-oem', 'oem-surplus', 'compatible-aftermarket', 'used-refurbished']

export const originOf = (v: string | null | undefined) => (v && v in ORIGIN ? ORIGIN[v as OriginValue] : null)
