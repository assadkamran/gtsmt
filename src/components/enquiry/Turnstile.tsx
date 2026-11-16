'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

/**
 * Cloudflare Turnstile. Loads Cloudflare's script on demand, shows the widget and hands the token to the form. The token
 * proves nothing by itself: the server verifies it with Cloudflare before accepting the enquiry.
 * https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
 */

type TurnstileApi = {
  render: (el: HTMLElement, o: Record<string, unknown>) => string
  reset: (id?: string) => void
  remove: (id?: string) => void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
    __gtTurnstileReady?: Promise<void>
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function load(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  window.__gtTurnstileReady ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('turnstile script failed'))
    document.head.appendChild(s)
  })
  return window.__gtTurnstileReady
}

export type TurnstileHandle = { reset: () => void }

export const Turnstile = forwardRef<TurnstileHandle, { siteKey: string; onToken: (token: string) => void; onError?: () => void }>(function Turnstile({ siteKey, onToken, onError }, ref) {
  const box = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const cb = useRef({ onToken, onError })
  cb.current = { onToken, onError }

  useImperativeHandle(ref, () => ({
    reset: () => {
      cb.current.onToken('')
      if (widget.current && window.turnstile) window.turnstile.reset(widget.current)
    },
  }))

  useEffect(() => {
    let cancelled = false
    load()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile || widget.current) return
        widget.current = window.turnstile.render(box.current, {
          sitekey: siteKey,
          callback: (t: string) => cb.current.onToken(t),
          'expired-callback': () => cb.current.onToken(''),
          'error-callback': () => {
            cb.current.onToken('')
            cb.current.onError?.()
          },
        })
      })
      .catch(() => cb.current.onError?.())
    return () => {
      cancelled = true
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current)
      widget.current = null
    }
  }, [siteKey])

  return <div ref={box} className="min-h-[65px]" />
})
