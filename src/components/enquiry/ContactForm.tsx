'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { initialForm, setIn, toInput, type Form } from '@/lib/enquiry/form'
import { validateEnquiry } from '@/lib/enquiry/schema'
import { ErrorSummary } from '../form/controls'
import { Confirmation } from './Confirmation'
import { Consent, GeneralFields } from './steps'
import { Turnstile, type TurnstileHandle } from './Turnstile'
import type { StepCtx, WizardOptions } from './types'
import { useSubmit } from './useSubmit'

/** The general contact form: one step, same endpoint, same checks as the quote wizard. */
export function ContactForm({ options }: { options: WizardOptions }) {
  const [form, setForm] = useState<Form>(() => ({ ...initialForm(), type: 'contact' }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [token, setToken] = useState('')
  const [serverError, setServerError] = useState('')
  const [reference, setReference] = useState('')
  const summaryRef = useRef<HTMLDivElement>(null)
  const turnstile = useRef<TurnstileHandle>(null)
  const { sending, submit, honeypot } = useSubmit()

  const set = useCallback((path: string, value: unknown) => setForm((f) => setIn(f, path, value)), [])
  const ctx: StepCtx = { form, set, errors, opts: options }
  useEffect(() => {
    if (summaryOpen) summaryRef.current?.focus()
  }, [summaryOpen, errors])

  const send = async () => {
    const checked = validateEnquiry(toInput(form))
    if (!checked.ok) {
      setErrors(checked.errors)
      setSummaryOpen(true)
      return
    }
    setErrors({})
    setSummaryOpen(false)
    setServerError('')
    const out = await submit(form, [], token)
    if (out.ok) return setReference(out.reference)
    if (out.fields) {
      setErrors(out.fields)
      setSummaryOpen(true)
      return
    }
    if (out.verification) {
      setToken('')
      turnstile.current?.reset()
    }
    setServerError(out.error)
  }

  if (reference) return <Confirmation reference={reference} general />
  const waiting = Boolean(options.siteKey) && !token

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); void send() }} className="relative rounded-xl border border-line bg-white p-5 sm:p-6">
      <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label>Leave this field empty<input ref={honeypot} type="text" name="hp_field" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
      </div>
      {summaryOpen && Object.keys(errors).length > 0 && <ErrorSummary ref={summaryRef} errors={errors} />}
      {serverError && <div role="alert" className="mb-5 rounded-lg border border-error-line bg-error-bg p-4 text-[0.9375rem] text-error-ink">{serverError}</div>}
      <GeneralFields ctx={ctx} />
      <div className="mt-5"><Consent checked={form.consent === true} onChange={(v) => set('consent', v)} error={errors.consent} /></div>
      {options.siteKey && (
        <div className="mt-5">
          <Turnstile ref={turnstile} siteKey={options.siteKey} onToken={setToken} onError={() => setServerError('The verification could not load. Check your connection, then reload the page.')} />
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <span className="max-w-[17.5rem] text-[0.78rem] leading-snug text-muted">Your details are used only to reply to this message.</span>
        <button type="submit" disabled={sending || waiting} className="inline-flex h-12 items-center justify-center gap-2 rounded-control border-2 border-accent bg-accent px-6 text-base font-semibold text-on-accent transition-colors hover:border-accent-hover hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60">
          <Send aria-hidden className="size-4" />{sending ? 'Sending…' : waiting ? 'Verifying…' : 'Send message'}
        </button>
      </div>
    </form>
  )
}
