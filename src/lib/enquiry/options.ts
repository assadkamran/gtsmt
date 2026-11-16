/**
 * The choices offered in the enquiry forms, in one place so the form, the validation and the summary agree.
 * Wording describes what the BUYER wants. Nothing here states anything about GTSMT's products or terms.
 */

export type Opt<V extends string = string> = { value: V; label: string; hint?: string }

export const NEED_OPTIONS: Opt<'line' | 'equipment' | 'part' | 'peripherals'>[] = [
  { value: 'line', label: 'Complete SMT line', hint: 'Plan a full production line' },
  { value: 'equipment', label: 'Equipment', hint: 'A machine or an upgrade' },
  { value: 'part', label: 'Spare parts', hint: 'Feeders, nozzles, components' },
  { value: 'peripherals', label: 'Peripherals', hint: 'Loaders, conveyors, buffers' },
]

export const NEED_LABEL: Record<string, string> = {
  line: 'Complete SMT line',
  equipment: 'Equipment',
  part: 'Spare parts',
  peripherals: 'Peripherals',
  contact: 'General enquiry',
}

export const VOLUME_UNITS: Opt[] = [
  { value: 'day', label: 'per day' },
  { value: 'week', label: 'per week' },
  { value: 'month', label: 'per month' },
  { value: 'year', label: 'per year' },
]

export const ASSEMBLY: Opt[] = [
  { value: 'single', label: 'Single-sided' },
  { value: 'double', label: 'Double-sided' },
  { value: 'both', label: 'Both' },
  { value: 'unsure', label: 'Not sure' },
]

export const SMALLEST_COMPONENT: Opt[] = [
  { value: 'tiny', label: '0201 or smaller' },
  { value: '0402', label: '0402' },
  { value: '0603', label: '0603 or larger' },
  { value: 'unsure', label: 'Not sure' },
]

export const COMPONENT_FEATURES: Opt[] = [
  { value: 'bga', label: 'BGA' },
  { value: 'qfn', label: 'QFN' },
  { value: 'fine-pitch', label: 'Fine-pitch ICs (0.5 mm pitch or finer)' },
  { value: 'connectors', label: 'Connectors and odd-form parts' },
  { value: 'through-hole', label: 'Through-hole parts' },
]

export const COMPONENTS_PER_BOARD: Opt[] = [
  { value: 'under-100', label: 'Fewer than 100' },
  { value: '100-500', label: '100 to 500' },
  { value: 'over-500', label: 'More than 500' },
  { value: 'unsure', label: 'Not sure' },
]

export const LEAD_FREE: Opt[] = [
  { value: 'yes', label: 'Lead-free' },
  { value: 'no', label: 'Leaded' },
  { value: 'unsure', label: 'Not sure' },
]

export const PROJECT: Opt[] = [
  { value: 'new', label: 'A new line' },
  { value: 'extend', label: 'Extend an existing line' },
  { value: 'replace', label: 'Replace a machine' },
  { value: 'unsure', label: 'Not sure yet' },
]

export const STATIONS: Opt[] = [
  { value: 'loader', label: 'Loader' },
  { value: 'printer', label: 'Solder paste printer' },
  { value: 'spi', label: 'Solder paste inspection (SPI)' },
  { value: 'placer', label: 'Pick and place' },
  { value: 'reflow', label: 'Reflow oven' },
  { value: 'aoi', label: 'Inspection (AOI)' },
  { value: 'unloader', label: 'Unloader' },
  { value: 'conveyors', label: 'Conveyors and buffers' },
]

export const TIMELINE: Opt[] = [
  { value: 'now', label: 'As soon as possible' },
  { value: '3m', label: 'Within 3 months' },
  { value: '6m', label: 'In 3 to 6 months' },
  { value: '12m', label: 'In 6 to 12 months' },
  { value: 'planning', label: 'Just planning' },
]

export const CURRENCIES: Opt[] = [
  { value: 'USD', label: 'US dollars (USD)' },
  { value: 'EUR', label: 'Euros (EUR)' },
  { value: 'GBP', label: 'Pounds (GBP)' },
  { value: 'CNY', label: 'Yuan (CNY)' },
  { value: 'other', label: 'Another currency' },
]

/** Ranges are the buyer's own indication. They are never shown back as a price. */
export const BUDGET_RANGES: Opt[] = [
  { value: 'under-50k', label: 'Under 50,000' },
  { value: '50-150k', label: '50,000 to 150,000' },
  { value: '150-500k', label: '150,000 to 500,000' },
  { value: 'over-500k', label: 'Over 500,000' },
  { value: 'discuss', label: 'I prefer to discuss it' },
]

export const CONDITION: Opt[] = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used or refurbished is fine' },
  { value: 'either', label: 'Either' },
]

export const ACCEPT: Opt[] = [
  { value: 'any', label: 'Any' },
  { value: 'oem', label: 'Genuine OEM only' },
  { value: 'aftermarket', label: 'Compatible aftermarket is fine' },
]

export const CONTACT_TOPICS: Opt[] = [
  { value: 'sales', label: 'Sales question' },
  { value: 'support', label: 'Technical or support question' },
  { value: 'other', label: 'Something else' },
]

export const labelOf = (opts: Opt[], v: string | undefined | null) => opts.find((o) => o.value === v)?.label ?? ''
export const MAX_PHOTOS = 3
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
export const MAX_PARTS = 10
