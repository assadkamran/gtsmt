import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { AlertCircle } from 'lucide-react'
import { fieldId } from '@/lib/enquiry/form'
import type { Opt } from '@/lib/enquiry/options'
import { Tick } from '../ui/Tick'

/** Small form kit used by the enquiry wizard and the contact form. Every control is labelled, and errors are tied to their field. */

export type A11y = { id: string; 'aria-describedby'?: string; 'aria-invalid'?: true; 'aria-required'?: true }

const base =
  'w-full rounded-control border border-field bg-white px-3 text-base text-ink placeholder:text-muted hover:border-dark-600 aria-[invalid=true]:border-error aria-[invalid=true]:shadow-[0_0_0_1px_var(--color-error)] disabled:bg-surface disabled:text-muted'
export const inputClass = `h-11 ${base}`
export const textareaClass = `min-h-28 py-2.5 ${base}`

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[0.8125rem] leading-snug text-error">
      <AlertCircle aria-hidden className="mt-px size-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

/** A label, the control, a hint and an error. The control comes from a render prop so it gets the right ids. */
export function Field({ path, label, hint, error, required, optional, children, className = '' }: { path: string; label: string; hint?: string; error?: string; required?: boolean; optional?: boolean; children: (a: A11y) => ReactNode; className?: string }) {
  const id = fieldId(path)
  const described = [hint ? `${id}-hint` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[0.9375rem] font-semibold text-ink">
        {label}
        {required && <span aria-hidden className="text-error"> *</span>}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children({ id, 'aria-describedby': described, 'aria-invalid': error ? true : undefined, 'aria-required': required ? true : undefined })}
      {hint && <p id={`${id}-hint`} className="mt-1 text-[0.8125rem] leading-snug text-muted">{hint}</p>}
      {error && <FieldError id={`${id}-err`}>{error}</FieldError>}
    </div>
  )
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput({ className = '', ...p }, ref) {
  return <input ref={ref} {...p} className={`${inputClass} ${className}`} />
})

export function TextArea({ className = '', ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={`${textareaClass} ${className}`} />
}

export function Select({ className = '', children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...p} className={`${inputClass} appearance-none pr-9 ${className}`}>{children}</select>
      <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
    </div>
  )
}

/* ------------------------------------------------------------------ groups */
function GroupShell({ path, legend, hint, error, required, optional, children }: { path: string; legend: string; hint?: string; error?: string; required?: boolean; optional?: boolean; children: ReactNode }) {
  const id = fieldId(path)
  return (
    <fieldset id={id} tabIndex={-1} aria-describedby={[hint ? `${id}-hint` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined} className="min-w-0 outline-none">
      <legend className="mb-2 p-0 text-[0.9375rem] font-semibold text-ink">
        {legend}
        {required && <span aria-hidden className="text-error"> *</span>}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </legend>
      {children}
      {hint && <p id={`${id}-hint`} className="mt-1 text-[0.8125rem] leading-snug text-muted">{hint}</p>}
      {error && <FieldError id={`${id}-err`}>{error}</FieldError>}
    </fieldset>
  )
}

/** One choice from a short list, shown as pills. Choosing the selected pill again clears it, since most answers are optional. */
export function Pills({ path, legend, options, value, onChange, hint, error, required, optional = true, allowClear = true }: { path: string; legend: string; options: Opt[]; value: string; onChange: (v: string) => void; hint?: string; error?: string; required?: boolean; optional?: boolean; allowClear?: boolean }) {
  return (
    <GroupShell path={path} legend={legend} hint={hint} error={error} required={required} optional={optional && !required}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className="cursor-pointer">
            <input
              type="radio"
              name={path}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              onClick={() => { if (allowClear && value === o.value) onChange('') }}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-11 items-center rounded-full border-2 border-field bg-white px-4 text-[0.9375rem] text-ink transition-colors hover:border-dark-600 peer-checked:border-accent peer-checked:bg-[#eef2ff] peer-checked:font-semibold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </GroupShell>
  )
}

/** Several choices from a list, as checkboxes. */
export function Checks({ path, legend, options, value, onChange, hint, error, optional = true }: { path: string; legend: string; options: Opt[]; value: string[]; onChange: (v: string[]) => void; hint?: string; error?: string; optional?: boolean }) {
  return (
    <GroupShell path={path} legend={legend} hint={hint} error={error} optional={optional}>
      <div className="grid gap-x-6 sm:grid-cols-2">
        {options.map((o) => {
          const on = value.includes(o.value)
          return (
            <label key={o.value} className="flex cursor-pointer items-center gap-3 py-2 text-[0.9375rem] leading-6 text-ink">
              <input type="checkbox" checked={on} onChange={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])} className="peer sr-only" />
              <Tick />
              <span>{o.label}</span>
            </label>
          )
        })}
      </div>
    </GroupShell>
  )
}

/** A minimum and a maximum, side by side. */
export function MinMax({ path, label, unit, min, max, onMin, onMax, error }: { path: string; label: string; unit: string; min: string; max: string; onMin: (v: string) => void; onMax: (v: string) => void; error?: string }) {
  const id = fieldId(path)
  return (
    <fieldset id={id} tabIndex={-1} aria-describedby={error ? `${id}-err` : undefined} className="min-w-0 outline-none">
      <legend className="mb-1.5 p-0 text-[0.9375rem] font-semibold text-ink">{label} <span className="font-normal text-muted">({unit})</span></legend>
      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <label htmlFor={`${id}-min`} className="sr-only">Minimum {label.toLowerCase()}</label>
          <TextInput id={`${id}-min`} inputMode="decimal" autoComplete="off" placeholder="Min" value={min} onChange={(e) => onMin(e.target.value)} aria-invalid={error ? true : undefined} />
        </div>
        <div>
          <label htmlFor={`${id}-max`} className="sr-only">Maximum {label.toLowerCase()}</label>
          <TextInput id={`${id}-max`} inputMode="decimal" autoComplete="off" placeholder="Max" value={max} onChange={(e) => onMax(e.target.value)} aria-invalid={error ? true : undefined} />
        </div>
      </div>
      {error && <FieldError id={`${id}-err`}>{error}</FieldError>}
    </fieldset>
  )
}

/* ------------------------------------------------------------------ error summary */
export const ErrorSummary = forwardRef<HTMLDivElement, { errors: Record<string, string>; title?: string }>(function ErrorSummary({ errors, title }, ref) {
  const entries = Object.entries(errors)
  if (!entries.length) return null
  const jump = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById(fieldId(path))
    if (!el) return
    el.scrollIntoView({ block: 'center' })
    el.focus({ preventScroll: true })
  }
  return (
    <div ref={ref} role="alert" tabIndex={-1} className="mb-5 flex gap-3 rounded-lg border border-error-line bg-error-bg p-4 text-error-ink outline-none">
      <AlertCircle aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        <p className="font-bold">{title ?? `Please fix ${entries.length} ${entries.length === 1 ? 'problem' : 'problems'}`}</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[0.9375rem]">
          {entries.map(([path, message]) => (
            <li key={path}><a href={`#${fieldId(path)}`} onClick={jump(path)} className="underline underline-offset-2">{message}</a></li>
          ))}
        </ul>
      </div>
    </div>
  )
})
