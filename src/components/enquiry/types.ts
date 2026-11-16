import type { Form } from '@/lib/enquiry/form'

export type WizardOptions = {
  /** Photos can be attached to a spare-parts request. Controlled by Website Settings. */
  photos: boolean
  /** Cloudflare Turnstile site key. Empty in local development, where the check is skipped. */
  siteKey: string | null
  brands: string[]
  equipmentTypes: string[]
  peripheralTypes: string[]
  countries: { code: string; name: string }[]
}

export type StepCtx = {
  form: Form
  set: (path: string, value: unknown) => void
  errors: Record<string, string>
  opts: WizardOptions
}
