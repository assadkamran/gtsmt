'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Send } from 'lucide-react'
import { convertBoardUnit, initialForm, setBoardValue, setIn, stepOfPath, stepsFor, stepTitle, toInput, validateAll, validateStep, type Form, type Initial, type Need, type StepId, type Unit } from '@/lib/enquiry/form'
import { NEED_LABEL } from '@/lib/enquiry/options'
import { validateEnquiry } from '@/lib/enquiry/schema'
import { answerSections, contactRows } from '@/lib/enquiry/summary'
import { ErrorSummary } from '../form/controls'
import { Confirmation } from './Confirmation'
import { PhotoPicker } from './PhotoPicker'
import { BoardsStep, BudgetStep, ComponentsStep, ContactStep, MachineDetailsStep, NeedStep, PartsStep, SiteStep } from './steps'
import { Turnstile, type TurnstileHandle } from './Turnstile'
import type { StepCtx, WizardOptions } from './types'
import { useSubmit } from './useSubmit'

const DRAFT = 'gtsmt.enquiry.draft.v1'

const btnPrimary = 'inline-flex h-12 items-center justify-center gap-2 rounded-control border-2 border-accent bg-accent px-6 text-base font-semibold text-on-accent transition-colors hover:border-accent-hover hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60'
const btnOutline = 'inline-flex h-12 items-center justify-center gap-2 rounded-control border-2 border-dark-900 px-6 text-base font-semibold text-dark-900 transition-colors hover:bg-dark-900 hover:text-white'

/** Which step a summary heading belongs to, so the review can offer "Edit" next to it. */
const SECTION_STEP: Record<string, StepId> = { 'Production and boards': 'boards', Components: 'components', 'Equipment and site': 'site', Budget: 'budget' }

export function EnquiryWizard({ initial, productTitles, options }: { initial: Initial; productTitles: Record<number, string>; options: WizardOptions }) {
  const [form, setForm] = useState<Form>(() => initialForm(initial))
  const [step, setStep] = useState<StepId>('need')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [token, setToken] = useState('')
  const [serverError, setServerError] = useState('')
  const [reference, setReference] = useState('')
  const [editing, setEditing] = useState(false)
  const stepRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const turnstile = useRef<TurnstileHandle>(null)
  const mounted = useRef(false)
  const { sending, submit, honeypot } = useSubmit()

  const type = (form.type as Need | '') ?? ''
  const steps = stepsFor(type)
  const index = Math.max(0, steps.indexOf(step))
  const set = useCallback((path: string, value: unknown) => setForm((f) => setIn(f, path, value)), [])
  const ctx: StepCtx = { form, set, errors, opts: options }
  const hadContext = Boolean(initial.need || initial.topic || initial.part || (initial.products?.length ?? 0) > 0)

  // A visitor who arrives without a context may come back to an unfinished enquiry. Never the consent, never photos.
  useEffect(() => {
    if (hadContext) return
    try {
      const raw = window.sessionStorage.getItem(DRAFT)
      if (!raw) return
      const d = JSON.parse(raw) as { form?: Form; step?: StepId }
      if (d.form && typeof d.form === 'object' && d.step) {
        setForm({ ...initialForm(), ...d.form, consent: false })
        setStep(stepsFor(((d.form.type as Need) ?? '') || '').includes(d.step) ? d.step : 'need')
      }
    } catch {
      // Unreadable draft: start fresh.
    }
    // Runs once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (reference) return
    const t = setTimeout(() => {
      try {
        window.sessionStorage.setItem(DRAFT, JSON.stringify({ form: { ...form, consent: false }, step }))
      } catch {
        // Storage unavailable: the form still works, it just cannot be restored.
      }
    }, 400)
    return () => clearTimeout(t)
  }, [form, step, reference])

  // Move focus to the new step's heading so keyboard and screen-reader users land at the top of it.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const h = stepRef.current?.querySelector('h2')
    if (!h) return
    h.setAttribute('tabindex', '-1')
    ;(h as HTMLElement).focus({ preventScroll: true })
    stepRef.current?.scrollIntoView({ block: 'start' })
  }, [step, reference])
  useEffect(() => {
    if (summaryOpen) summaryRef.current?.focus()
  }, [summaryOpen, errors])

  const goTo = (s: StepId) => {
    setStep(s)
    setSummaryOpen(false)
    setServerError('')
  }

  const next = () => {
    const found = validateStep(type, step, form)
    if (Object.keys(found).length) {
      setErrors(found)
      setSummaryOpen(true)
      return
    }
    setErrors({})
    if (editing) {
      setEditing(false)
      goTo('review')
      return
    }
    goTo(steps[Math.min(index + 1, steps.length - 1)])
  }
  const back = () => {
    setErrors({})
    setEditing(false)
    goTo(steps[Math.max(index - 1, 0)])
  }
  const edit = (s: StepId) => {
    setErrors({})
    setEditing(true)
    goTo(s)
  }

  const onUnit = (u: Unit) => setForm((f) => convertBoardUnit(f, u))
  const onDim = (path: string, value: string) => setForm((f) => setBoardValue(f, path, value))

  const context = useMemo(() => {
    const ids = (form.products as number[]) ?? []
    const names = ids.map((id) => productTitles[id]).filter(Boolean)
    return names.length ? names.join(', ') : String(form.topic ?? '')
  }, [form.products, form.topic, productTitles])
  const clearContext = () => setForm((f) => ({ ...f, products: [], topic: '' }))

  const send = async () => {
    const all = validateAll(type, form)
    if (all.length) {
      // Something earlier in the form no longer passes: take the buyer to the first step with a problem.
      setErrors(all[0].errors)
      setSummaryOpen(true)
      setStep(all[0].step)
      return
    }
    setServerError('')
    const out = await submit(form, photos, token)
    if (out.ok) {
      try {
        window.sessionStorage.removeItem(DRAFT)
      } catch {
        // nothing to clear
      }
      setReference(out.reference)
      return
    }
    if (out.fields) {
      const first = Object.keys(out.fields)[0]
      setErrors(out.fields)
      setSummaryOpen(true)
      if (first) setStep(stepOfPath(type, first))
      return
    }
    if (out.verification) {
      setToken('')
      turnstile.current?.reset()
    }
    setServerError(out.error)
  }

  if (reference) return <Confirmation reference={reference} />

  const last = step === 'review'
  const title = stepTitle(step, type)
  const needsToken = Boolean(options.siteKey) && last && !token

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (last) void send()
        else next()
      }}
      className="relative rounded-xl border border-line bg-white p-5 sm:p-6"
    >
      {/* Spam trap: invisible to people, tempting to bots. Anything typed here marks the enquiry as spam. */}
      <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label>Leave this field empty<input ref={honeypot} type="text" name="hp_field" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
      </div>

      <ol aria-label="Progress" className="mb-2 flex gap-1.5">
        {(type ? steps : ['need', '', '', '']).map((s, i) => (
          <li key={`${s}-${i}`} aria-current={i === index ? 'step' : undefined} className={`h-[5px] flex-1 rounded-[3px] ${i <= index ? 'bg-accent' : 'bg-line'}`}>
            {s && <span className="sr-only">Step {i + 1}: {stepTitle(s as StepId, type)}{i < index ? ', done' : i === index ? ', current' : ''}</span>}
          </li>
        ))}
      </ol>
      <p aria-live="polite" className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        {type ? `Step ${index + 1} of ${steps.length}` : 'Step 1'} &middot; {title}
      </p>

      {summaryOpen && Object.keys(errors).length > 0 && <ErrorSummary ref={summaryRef} errors={errors} />}
      {serverError && (
        <div role="alert" className="mb-5 rounded-lg border border-error-line bg-error-bg p-4 text-[0.9375rem] text-error-ink">{serverError}</div>
      )}

      <div ref={stepRef} className="scroll-mt-28">
        {step === 'need' && <NeedStep ctx={ctx} context={context} onClearContext={clearContext} />}
        {step === 'boards' && <BoardsStep ctx={ctx} unit={(form.boardUnit as Unit) ?? 'mm'} onUnit={onUnit} onDim={onDim} />}
        {step === 'components' && <ComponentsStep ctx={ctx} />}
        {step === 'site' && <SiteStep ctx={ctx} />}
        {step === 'budget' && <BudgetStep ctx={ctx} />}
        {step === 'details' && (type === 'part' ? <PartsStep ctx={ctx} titles={productTitles} photos={options.photos ? <PhotoPicker files={photos} onChange={setPhotos} /> : null} /> : <MachineDetailsStep ctx={ctx} kind={type === 'peripherals' ? 'peripherals' : 'equipment'} titles={productTitles} />)}
        {step === 'contact' && <ContactStep ctx={ctx} />}
        {step === 'review' && <Review form={form} titles={productTitles} photoCount={photos.length} onEdit={edit} />}
      </div>

      {last && options.siteKey && (
        <div className="mt-5">
          <Turnstile ref={turnstile} siteKey={options.siteKey} onToken={setToken} onError={() => setServerError('The verification could not load. Check your connection, then reload the page.')} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {index > 0 ? (
          <button type="button" onClick={back} className={btnOutline}><ArrowLeft aria-hidden className="size-4" />Back</button>
        ) : (
          <span />
        )}
        {last ? (
          <div className="ml-auto flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
            <span className="max-w-[17.5rem] text-[0.78rem] leading-snug text-muted">Your details are used only to reply to this enquiry.</span>
            <button type="submit" disabled={sending || needsToken} className={btnPrimary}>
              <Send aria-hidden className="size-4" />{sending ? 'Sending…' : needsToken ? 'Verifying…' : 'Send enquiry'}
            </button>
          </div>
        ) : (
          <button type="submit" className={`${btnPrimary} ml-auto`}>
            {editing ? 'Back to review' : step === 'contact' ? 'Review enquiry' : 'Continue'}
            <ArrowRight aria-hidden className="size-4" />
          </button>
        )}
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ review */
function Review({ form, titles, photoCount, onEdit }: { form: Form; titles: Record<number, string>; photoCount: number; onEdit: (s: StepId) => void }) {
  const checked = validateEnquiry(toInput(form))
  if (!checked.ok) {
    return (
      <div>
        <h2 className="font-heading text-2xl font-extrabold text-dark-900">Check your enquiry</h2>
        <p className="mt-2 text-[0.9375rem] text-muted">A few answers need attention before this can be sent.</p>
      </div>
    )
  }
  const d = checked.data
  const ids = d.products
  const rows: { key: string; label: string; lines: string[]; step: StepId }[] = [
    { key: 'need', label: 'Need', lines: [[NEED_LABEL[d.type], ids.map((id) => titles[id]).filter(Boolean).join(', ') || d.topic].filter(Boolean).join(' · ')], step: 'need' },
    ...answerSections(d).map((s) => ({ key: s.heading, label: s.heading, lines: s.rows.map((r) => `${r.label}: ${r.value}`), step: SECTION_STEP[s.heading] ?? ('details' as StepId) })),
  ]
  if (d.message) rows.push({ key: 'message', label: 'Message', lines: [d.message], step: 'details' })
  if (photoCount > 0) rows.push({ key: 'photos', label: 'Photos', lines: [`${photoCount} ${photoCount === 1 ? 'photo' : 'photos'} attached`], step: 'details' })
  rows.push({ key: 'contact', label: 'Contact', lines: contactRows(d).map((r) => `${r.label}: ${r.value}`), step: 'contact' })
  return (
    <div>
      <h2 className="font-heading text-2xl font-extrabold text-dark-900">Check your enquiry</h2>
      <dl className="mt-3">
        {rows.map((r, i) => (
          <div key={r.key} className={`flex items-start justify-between gap-4 py-3 text-[0.9375rem] ${i < rows.length - 1 ? 'border-b border-line' : ''}`}>
            <div className="min-w-0">
              <dt className="text-[0.8125rem] font-bold uppercase tracking-[0.06em] text-muted">{r.label}</dt>
              <dd className="mt-0.5 space-y-0.5 break-words text-ink">{r.lines.map((l, n) => <p key={n} className="whitespace-pre-wrap">{l}</p>)}</dd>
            </div>
            <button type="button" onClick={() => onEdit(r.step)} className="shrink-0 py-1 text-[0.8125rem] font-semibold text-accent-text hover:underline">Edit<span className="sr-only"> {r.label}</span></button>
          </div>
        ))}
      </dl>
    </div>
  )
}
