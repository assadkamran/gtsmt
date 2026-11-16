'use client'

import type { ReactNode } from 'react'
import { Cpu, Package, Plus, Route, Settings, X, type LucideIcon } from 'lucide-react'
import { getIn, type Unit } from '@/lib/enquiry/form'
import {
  ACCEPT, ASSEMBLY, BUDGET_RANGES, COMPONENT_FEATURES, COMPONENTS_PER_BOARD, CONDITION, CONTACT_TOPICS, CURRENCIES, LEAD_FREE, MAX_PARTS, NEED_OPTIONS, PROJECT, SMALLEST_COMPONENT, STATIONS, TIMELINE, VOLUME_UNITS,
} from '@/lib/enquiry/options'
import { Checks, Field, FieldError, MinMax, Pills, Select, TextArea, TextInput } from '../form/controls'
import type { StepCtx } from './types'

const str = (form: unknown, path: string) => String(getIn(form, path) ?? '')
const list = (form: unknown, path: string) => (getIn(form, path) as string[] | undefined) ?? []

const Heading = ({ children, hint }: { children: ReactNode; hint?: string }) => (
  <>
    <h2 className="font-heading text-2xl font-extrabold text-dark-900">{children}</h2>
    {hint && <p className="mb-4 mt-1 text-[0.9375rem] text-muted">{hint}</p>}
  </>
)
const Stack = ({ children }: { children: ReactNode }) => <div className="mt-5 space-y-5">{children}</div>

/* ------------------------------------------------------------------ 1. what do you need */
const ICON: Record<string, LucideIcon> = { line: Route, equipment: Cpu, part: Settings, peripherals: Package }

export function NeedStep({ ctx, context, onClearContext }: { ctx: StepCtx; context: string; onClearContext: () => void }) {
  const { form, set, errors } = ctx
  const value = str(form, 'type')
  return (
    <div>
      <Heading hint="Choose the closest match. You can add detail on the next step.">What do you need?</Heading>
      {context && (
        <p className="mb-4 inline-flex max-w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[0.8125rem] text-ink">
          <span className="min-w-0 truncate">Enquiry about: <strong>{context}</strong></span>
          <button type="button" onClick={onClearContext} className="shrink-0 font-semibold text-accent-text hover:underline">Change</button>
        </p>
      )}
      <fieldset id="f-type" tabIndex={-1} aria-describedby={errors.type ? 'f-type-err' : undefined} className="min-w-0 outline-none">
        <legend className="sr-only">What do you need?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {NEED_OPTIONS.map((o) => {
            const Icon = ICON[o.value]
            return (
              <label key={o.value} className="cursor-pointer">
                <input type="radio" name="need" value={o.value} checked={value === o.value} onChange={() => set('type', o.value)} className="peer sr-only" />
                <span className="flex h-full items-start gap-3 rounded-[10px] border-2 border-line p-3.5 transition-colors hover:border-dark-600 peer-checked:border-accent peer-checked:bg-[#eef2ff] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text">
                  <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-tint text-accent-text"><Icon className="size-5" /></span>
                  <span>
                    <span className="block font-heading text-[0.9375rem] font-bold text-dark-900">{o.label}</span>
                    <span className="text-[0.8125rem] text-muted">{o.hint}</span>
                  </span>
                </span>
              </label>
            )
          })}
        </div>
        {errors.type && <FieldError id="f-type-err">{errors.type}</FieldError>}
      </fieldset>
    </div>
  )
}

/* ------------------------------------------------------------------ budget (shared) */
function BudgetFields({ ctx, base }: { ctx: StepCtx; base: string }) {
  const { form, set, errors } = ctx
  const currency = str(form, `${base}.currency`)
  return (
    <div className="space-y-5">
      <Field path={`${base}.currency`} label="Currency" optional error={errors[`${base}.currency`]}>
        {(a) => (
          <Select {...a} value={currency} onChange={(e) => set(`${base}.currency`, e.target.value)}>
            <option value="">Choose a currency</option>
            {CURRENCIES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        )}
      </Field>
      <Pills path={`${base}.range`} legend="Rough budget" options={BUDGET_RANGES} value={str(form, `${base}.range`)} onChange={(v) => set(`${base}.range`, v)} error={errors[`${base}.range`]} hint="An indication helps us suggest suitable options. Leave it blank if you are not sure." />
    </div>
  )
}

/* ------------------------------------------------------------------ complete line */
export function BoardsStep({ ctx, unit, onUnit, onDim }: { ctx: StepCtx; unit: Unit; onUnit: (u: Unit) => void; onDim: (path: string, value: string) => void }) {
  const { form, set, errors } = ctx
  const dim = (key: 'length' | 'width' | 'thickness', label: string) => (
    <MinMax key={key} path={`line.${key}`} label={label} unit={unit === 'mm' ? 'mm' : 'inches'} min={str(form, `line.${key}.min`)} max={str(form, `line.${key}.max`)} onMin={(v) => onDim(`${key}.min`, v)} onMax={(v) => onDim(`${key}.max`, v)} error={errors[`line.${key}`] ?? errors[`line.${key}.min`] ?? errors[`line.${key}.max`]} />
  )
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading>Tell us about your boards</Heading>
        <div role="group" aria-label="Units for board sizes" className="inline-flex overflow-hidden rounded-control border border-field text-[0.8125rem] font-semibold">
          {(['mm', 'in'] as const).map((u) => (
            <button key={u} type="button" aria-pressed={unit === u} onClick={() => onUnit(u)} className={`min-h-9 px-3 transition-colors ${unit === u ? 'bg-accent text-on-accent' : 'bg-white text-ink hover:bg-surface'}`}>{u === 'mm' ? 'mm' : 'inches'}</button>
          ))}
        </div>
      </div>
      <Stack>
        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr] sm:items-end">
          <Field path="line.volume" label="How many boards do you need to build?" optional error={errors['line.volume']}>
            {(a) => <TextInput {...a} inputMode="numeric" autoComplete="off" placeholder="e.g. 500" value={str(form, 'line.volume')} onChange={(e) => set('line.volume', e.target.value)} />}
          </Field>
          <Field path="line.volumeUnit" label="Per" error={errors['line.volumeUnit']}>
            {(a) => (
              <Select {...a} aria-label="Per" value={str(form, 'line.volumeUnit')} onChange={(e) => set('line.volumeUnit', e.target.value)}>
                {VOLUME_UNITS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            )}
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {dim('length', 'Length')}
          {dim('width', 'Width')}
          {dim('thickness', 'Thickness')}
        </div>
        <p className="-mt-2 text-[0.8125rem] text-muted">Not sure of a value? Leave it blank. You can add details later.</p>
        <Pills path="line.assembly" legend="Assembly" options={ASSEMBLY} value={str(form, 'line.assembly')} onChange={(v) => set('line.assembly', v)} error={errors['line.assembly']} />
      </Stack>
    </div>
  )
}

export function ComponentsStep({ ctx }: { ctx: StepCtx }) {
  const { form, set, errors } = ctx
  return (
    <div>
      <Heading hint="Everything on this step is optional. It helps us pick suitable placement equipment.">Tell us about your components</Heading>
      <Stack>
        <Pills path="line.smallestComponent" legend="Smallest component you place" options={SMALLEST_COMPONENT} value={str(form, 'line.smallestComponent')} onChange={(v) => set('line.smallestComponent', v)} error={errors['line.smallestComponent']} />
        <Checks path="line.features" legend="Do your boards include" options={COMPONENT_FEATURES} value={list(form, 'line.features')} onChange={(v) => set('line.features', v)} error={errors['line.features']} />
        <Pills path="line.componentsPerBoard" legend="Components per board" options={COMPONENTS_PER_BOARD} value={str(form, 'line.componentsPerBoard')} onChange={(v) => set('line.componentsPerBoard', v)} error={errors['line.componentsPerBoard']} />
        <Pills path="line.leadFree" legend="Solder" options={LEAD_FREE} value={str(form, 'line.leadFree')} onChange={(v) => set('line.leadFree', v)} error={errors['line.leadFree']} />
      </Stack>
    </div>
  )
}

export function SiteStep({ ctx }: { ctx: StepCtx }) {
  const { form, set, errors } = ctx
  return (
    <div>
      <Heading hint="Tell us what you already have and what you want to add.">Your project and equipment</Heading>
      <Stack>
        <Pills path="line.project" legend="Is this" options={PROJECT} value={str(form, 'line.project')} onChange={(v) => set('line.project', v)} error={errors['line.project']} />
        <Checks path="line.stations" legend="Stations you need" options={STATIONS} value={list(form, 'line.stations')} onChange={(v) => set('line.stations', v)} error={errors['line.stations']} />
        <Field path="line.existing" label="What do you already have?" optional hint="For example machine makes and models, or a layout you are working to." error={errors['line.existing']}>
          {(a) => <TextArea {...a} rows={3} value={str(form, 'line.existing')} onChange={(e) => set('line.existing', e.target.value)} />}
        </Field>
        <Pills path="line.timeline" legend="When do you want to start?" options={TIMELINE} value={str(form, 'line.timeline')} onChange={(v) => set('line.timeline', v)} error={errors['line.timeline']} />
      </Stack>
    </div>
  )
}

export function BudgetStep({ ctx }: { ctx: StepCtx }) {
  return (
    <div>
      <Heading>Do you have a budget in mind?</Heading>
      <Stack><BudgetFields ctx={ctx} base="line.budget" /></Stack>
    </div>
  )
}

/* ------------------------------------------------------------------ equipment and peripherals */
export function ProductChips({ ctx, titles }: { ctx: StepCtx; titles: Record<number, string> }) {
  const ids = (getIn(ctx.form, 'products') as number[] | undefined) ?? []
  if (!ids.length) return null
  return (
    <div className="mb-5">
      <p className="mb-1.5 text-[0.9375rem] font-semibold text-ink">Products you are asking about</p>
      <ul className="flex flex-wrap gap-2">
        {ids.map((id) => (
          <li key={id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-1 pl-3 pr-1.5 text-sm font-semibold text-dark-900">
            {titles[id] ?? `Product ${id}`}
            <button type="button" onClick={() => ctx.set('products', ids.filter((x) => x !== id))} aria-label={`Remove ${titles[id] ?? `product ${id}`} from this enquiry`} className="grid size-7 place-items-center rounded-full text-muted hover:bg-white hover:text-ink"><X aria-hidden className="size-3.5" /></button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MachineDetailsStep({ ctx, kind, titles }: { ctx: StepCtx; kind: 'equipment' | 'peripherals'; titles: Record<number, string> }) {
  const { form, set, errors, opts } = ctx
  const listId = `suggest-${kind}`
  const suggestions = kind === 'equipment' ? opts.equipmentTypes : opts.peripheralTypes
  const hasProducts = ((getIn(form, 'products') as number[] | undefined) ?? []).length > 0
  return (
    <div>
      <Heading hint="The more you tell us, the more precise our reply can be. Anything you are not sure of can stay blank.">Tell us what you need</Heading>
      <Stack>
        <ProductChips ctx={ctx} titles={titles} />
        <Field path={`${kind}.what`} label={kind === 'equipment' ? 'Which equipment are you looking for?' : 'Which peripherals are you looking for?'} required={!hasProducts} optional={hasProducts} error={errors[`${kind}.what`]}>
          {(a) => (
            <>
              <TextInput {...a} list={listId} autoComplete="off" placeholder={kind === 'equipment' ? 'e.g. a pick and place machine' : 'e.g. a magazine loader'} value={str(form, `${kind}.what`)} onChange={(e) => set(`${kind}.what`, e.target.value)} />
              <datalist id={listId}>{suggestions.map((s) => <option key={s} value={s} />)}</datalist>
            </>
          )}
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field path={`${kind}.quantity`} label="Quantity" optional error={errors[`${kind}.quantity`]}>
            {(a) => <TextInput {...a} inputMode="numeric" autoComplete="off" placeholder="e.g. 1" value={str(form, `${kind}.quantity`)} onChange={(e) => set(`${kind}.quantity`, e.target.value)} />}
          </Field>
          {kind === 'peripherals' && (
            <Field path="peripherals.existingLine" label="Is it for an existing line?" optional hint="Machine makes and models help us check fit." error={errors['peripherals.existingLine']}>
              {(a) => <TextInput {...a} autoComplete="off" value={str(form, 'peripherals.existingLine')} onChange={(e) => set('peripherals.existingLine', e.target.value)} />}
            </Field>
          )}
        </div>
        {kind === 'equipment' && <Pills path="equipment.condition" legend="Condition" options={CONDITION} value={str(form, 'equipment.condition')} onChange={(v) => set('equipment.condition', v)} error={errors['equipment.condition']} />}
        <Field path={`${kind}.requirements`} label="Requirements" optional hint="Board sizes, speeds, components, standards, anything that matters to you." error={errors[`${kind}.requirements`]}>
          {(a) => <TextArea {...a} rows={4} value={str(form, `${kind}.requirements`)} onChange={(e) => set(`${kind}.requirements`, e.target.value)} />}
        </Field>
        <Pills path={`${kind}.timeline`} legend="When do you need it?" options={TIMELINE} value={str(form, `${kind}.timeline`)} onChange={(v) => set(`${kind}.timeline`, v)} error={errors[`${kind}.timeline`]} />
        <BudgetFields ctx={ctx} base={`${kind}.budget`} />
      </Stack>
    </div>
  )
}

/* ------------------------------------------------------------------ spare parts */
export function PartsStep({ ctx, titles, photos }: { ctx: StepCtx; titles: Record<number, string>; photos: ReactNode }) {
  const { form, set, errors, opts } = ctx
  const items = (getIn(form, 'part.items') as { ref: string; qty: string }[] | undefined) ?? []
  return (
    <div>
      <Heading hint="Part numbers work best. If you do not have one, describe the part.">Which parts do you need?</Heading>
      <Stack>
        <ProductChips ctx={ctx} titles={titles} />
        <fieldset className="min-w-0">
          <legend className="mb-2 p-0 text-[0.9375rem] font-semibold text-ink">Parts</legend>
          <ul className="space-y-2.5">
            {items.map((_, i) => {
              const refPath = `part.items.${i}.ref`
              return (
                <li key={i}>
                  <div className="grid grid-cols-[1fr_5.5rem_2.75rem] items-start gap-2.5">
                    <Field path={refPath} label={`Part ${i + 1}: part number or description`} error={errors[refPath]} className="[&>label]:sr-only">
                      {(a) => <TextInput {...a} autoComplete="off" placeholder="Part number or description" value={str(form, refPath)} onChange={(e) => set(refPath, e.target.value)} />}
                    </Field>
                    <Field path={`part.items.${i}.qty`} label={`Part ${i + 1}: quantity`} error={errors[`part.items.${i}.qty`]} className="[&>label]:sr-only">
                      {(a) => <TextInput {...a} inputMode="numeric" autoComplete="off" placeholder="Qty" value={str(form, `part.items.${i}.qty`)} onChange={(e) => set(`part.items.${i}.qty`, e.target.value)} />}
                    </Field>
                    <button type="button" disabled={items.length === 1} onClick={() => set('part.items', items.filter((_, n) => n !== i))} aria-label={`Remove part ${i + 1}`} className="grid size-11 place-items-center rounded-control text-muted hover:bg-surface hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"><X aria-hidden className="size-4" /></button>
                  </div>
                </li>
              )
            })}
          </ul>
          <button type="button" disabled={items.length >= MAX_PARTS} onClick={() => set('part.items', [...items, { ref: '', qty: '' }])} className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-semibold text-accent-text hover:underline disabled:opacity-50">
            <Plus aria-hidden className="size-4" />Add another part
          </button>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field path="part.machineBrand" label="Machine brand" optional error={errors['part.machineBrand']}>
            {(a) => (
              <>
                <TextInput {...a} list="suggest-brands" autoComplete="off" value={str(form, 'part.machineBrand')} onChange={(e) => set('part.machineBrand', e.target.value)} />
                <datalist id="suggest-brands">{opts.brands.map((b) => <option key={b} value={b} />)}</datalist>
              </>
            )}
          </Field>
          <Field path="part.machineModel" label="Machine model" optional error={errors['part.machineModel']}>
            {(a) => <TextInput {...a} autoComplete="off" placeholder="e.g. model name" value={str(form, 'part.machineModel')} onChange={(e) => set('part.machineModel', e.target.value)} />}
          </Field>
        </div>
        <Pills path="part.accept" legend="Condition you will accept" options={ACCEPT} value={str(form, 'part.accept')} onChange={(v) => set('part.accept', v)} error={errors['part.accept']} />
        {photos}
        <Field path="message" label="Anything else we should know?" optional error={errors.message}>
          {(a) => <TextArea {...a} rows={3} value={str(form, 'message')} onChange={(e) => set('message', e.target.value)} />}
        </Field>
      </Stack>
    </div>
  )
}

/* ------------------------------------------------------------------ contact details */
export function ContactFields({ ctx, general = false }: { ctx: StepCtx; general?: boolean }) {
  const { form, set, errors, opts } = ctx
  const text = (path: string, label: string, o: { required?: boolean; optional?: boolean; type?: string; autoComplete?: string; placeholder?: string; hint?: string; inputMode?: 'email' | 'tel' | 'text' } = {}) => (
    <Field path={path} label={label} required={o.required} optional={o.optional} hint={o.hint} error={errors[path]}>
      {(a) => <TextInput {...a} type={o.type ?? 'text'} inputMode={o.inputMode} autoComplete={o.autoComplete} placeholder={o.placeholder} value={str(form, path)} onChange={(e) => set(path, e.target.value)} />}
    </Field>
  )
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {text('name', 'Full name', { required: true, autoComplete: 'name' })}
        {text('company', 'Company', { required: !general, optional: general, autoComplete: 'organization' })}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {text('email', 'Email', { required: true, type: 'email', inputMode: 'email', autoComplete: 'email', placeholder: 'name@company.com' })}
        {text('phone', 'Phone', { optional: true, type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: 'With country code' })}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field path="country" label="Country" required error={errors.country}>
          {(a) => (
            <Select {...a} autoComplete="country" value={str(form, 'country')} onChange={(e) => set('country', e.target.value)}>
              <option value="">Select your country</option>
              {opts.countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </Select>
          )}
        </Field>
        {text('jobTitle', 'Job title', { optional: true, autoComplete: 'organization-title', placeholder: 'e.g. Operations manager' })}
      </div>
    </div>
  )
}

export function ContactStep({ ctx }: { ctx: StepCtx }) {
  const { form, set, errors } = ctx
  return (
    <div>
      <Heading hint="So that we know who to reply to.">Your details</Heading>
      <Stack>
        <ContactFields ctx={ctx} />
        <Consent checked={getIn(form, 'consent') === true} onChange={(v) => set('consent', v)} error={errors.consent} />
      </Stack>
    </div>
  )
}

export function Consent({ checked, onChange, error }: { checked: boolean; onChange: (v: boolean) => void; error?: string }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] text-ink">
        <input id="f-consent" type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={error ? true : undefined} aria-describedby={error ? 'f-consent-err' : undefined} className="peer sr-only" />
        <span aria-hidden className="mt-0.5 grid size-[1.125rem] shrink-0 place-items-center rounded-[4px] border-[1.5px] border-[#6b7794] bg-white text-transparent peer-checked:border-accent peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text peer-aria-[invalid=true]:border-error">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <span>I agree that GTSMT may use these details to reply to my enquiry. <a href="/privacy-policy" target="_blank" rel="noopener" className="font-semibold text-accent-text underline underline-offset-2">Privacy policy</a><span aria-hidden className="text-error"> *</span></span>
      </label>
      {error && <FieldError id="f-consent-err">{error}</FieldError>}
    </div>
  )
}

/* ------------------------------------------------------------------ general contact form fields */
export function GeneralFields({ ctx }: { ctx: StepCtx }) {
  const { form, set, errors } = ctx
  return (
    <div className="space-y-5">
      <Pills path="contactTopic" legend="What is it about?" options={CONTACT_TOPICS} value={str(form, 'contactTopic')} onChange={(v) => set('contactTopic', v || 'sales')} error={errors.contactTopic} allowClear={false} optional={false} />
      <ContactFields ctx={ctx} general />
      <Field path="message" label="Your message" required error={errors.message}>
        {(a) => <TextArea {...a} rows={6} value={str(form, 'message')} onChange={(e) => set('message', e.target.value)} />}
      </Field>
    </div>
  )
}
