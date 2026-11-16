'use client'

import { useCallback, useRef, useState } from 'react'
import type { Form } from '@/lib/enquiry/form'
import { toInput } from '@/lib/enquiry/form'

export type SubmitResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; fields?: Record<string, string>; verification?: boolean }

const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

/** Sends the enquiry to /api/enquiry. Knows nothing about steps or layout. */
export function useSubmit() {
  const [sending, setSending] = useState(false)
  const startedAt = useRef(Date.now())
  const honeypot = useRef<HTMLInputElement | null>(null)

  const submit = useCallback(async (form: Form, photos: File[], token: string): Promise<SubmitResult> => {
    setSending(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const utm: Record<string, string> = {}
      for (const k of UTM) {
        const v = params.get(k)
        if (v) utm[k] = v.slice(0, 120)
      }
      const body = new FormData()
      body.set('data', JSON.stringify(toInput(form)))
      body.set(
        'meta',
        JSON.stringify({
          website: honeypot.current?.value ?? '',
          elapsedMs: Math.max(0, Date.now() - startedAt.current),
          turnstileToken: token,
          page: (window.location.pathname + window.location.search).slice(0, 300),
          referrer: document.referrer.slice(0, 300),
          utm,
        }),
      )
      if (form.type === 'part') for (const f of photos) body.append('photos', f)
      const res = await fetch('/api/enquiry', { method: 'POST', body })
      const out = (await res.json().catch(() => ({}))) as { ok?: boolean; reference?: string; error?: string; fields?: Record<string, string>; verification?: boolean }
      if (res.ok && out.ok && out.reference) return { ok: true, reference: out.reference }
      return { ok: false, error: out.error || 'Something went wrong. Please try again.', fields: out.fields, verification: out.verification }
    } catch {
      return { ok: false, error: 'We could not reach the server. Check your connection and try again. Your answers are still here.' }
    } finally {
      setSending(false)
    }
  }, [])

  return { sending, submit, honeypot }
}
