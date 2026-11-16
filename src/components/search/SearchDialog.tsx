'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { CornerDownLeft, Factory, LayoutGrid, Package, Route, Search, Tag, X } from 'lucide-react'
import type { SearchItem, SuggestGroup } from '@/lib/search/query'
import { originOf } from '@/lib/origin'
import { rfqHref } from '@/lib/rfq'
import { Highlight } from './Highlight'

type Data = { q: string; tokens: string[]; total: number; groups: SuggestGroup[] }

const KIND_ICON = { product: Package, category: LayoutGrid, solution: Route, industry: Factory, brand: Tag } as const
const QUICK = [
  { label: 'Spare parts', href: '/spare-parts' },
  { label: 'Feeders', href: '/spare-parts/feeders' },
  { label: 'Pick and place machines', href: '/smt-equipment/pick-and-place-machines' },
  { label: 'Request a quote', href: '/request-a-quote' },
]

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)
}

export function SearchDialog() {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const uid = useId()
  const listId = `${uid}-list`
  const [q, setQ] = useState('')
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState(-1)

  const open = useCallback(() => {
    const d = dialogRef.current
    if (!d || d.open) return
    d.showModal()
    document.documentElement.style.overflow = 'hidden'
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])
  const close = useCallback(() => dialogRef.current?.close(), [])

  useEffect(() => {
    const onOpen = () => open()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(e.target)) {
        e.preventDefault()
        open()
      }
    }
    window.addEventListener('gt:open-search', onOpen)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('gt:open-search', onOpen)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Fetch suggestions as the visitor types.
  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        if (!res.ok) throw new Error(String(res.status))
        const json = (await res.json()) as Data
        if (ctrl.signal.aborted) return
        setData(json)
        setActive(-1)
        setError(null)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setError('Search is unavailable right now. Please try again.')
      } finally {
        if (!ctrl.signal.aborted) setLoading(false)
      }
    }, 160)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  const options = useMemo(() => (data?.groups ?? []).flatMap((g) => g.items.map((item) => ({ item, group: g.kind }))), [data])
  const seeAllIndex = options.length
  const optionId = (i: number) => `${uid}-opt-${i}`

  useEffect(() => {
    if (active >= 0) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const go = (href: string) => {
    close()
    router.push(href)
  }
  const seeAll = () => go(`/search?q=${encodeURIComponent(q.trim())}`)

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!data || data.total === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, seeAllIndex))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, -1))
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim().length < 2) return
    if (active >= 0 && active < options.length) go(options[active].item.url)
    else seeAll()
  }

  const hasResults = !!data && data.total > 0
  let index = -1

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search the site"
      onClose={() => {
        document.documentElement.style.overflow = ''
        setQ('')
        setData(null)
        setActive(-1)
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-dark-900/60"
    >
      <div className="mx-auto mt-[6vh] flex max-h-[84vh] w-[min(40rem,calc(100%-1.5rem))] flex-col overflow-hidden rounded-card bg-white text-ink shadow-[0_24px_60px_rgba(11,17,36,0.35)]">
        <form role="search" onSubmit={onSubmit} className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Search aria-hidden className="size-5 shrink-0 text-muted" />
          <label htmlFor={`${uid}-input`} className="sr-only">Search parts, machines and pages</label>
          <input
            id={`${uid}-input`}
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={hasResults}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? optionId(active) : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder="Part number, machine or feeder"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          <button type="button" onClick={close} aria-label="Close search" className="grid size-8 shrink-0 place-items-center rounded-md border border-line text-muted hover:border-dark-600 sm:size-auto sm:px-2 sm:py-1 sm:text-[0.6875rem] sm:font-semibold">
            <X aria-hidden className="size-4 sm:hidden" />
            <span aria-hidden className="hidden sm:inline">Esc</span>
          </button>
        </form>

        <div role="status" aria-live="polite" className="sr-only">
          {loading ? 'Searching' : data ? (data.total === 0 ? 'No results' : `${data.total} results`) : ''}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {!data && !loading && !error && (
            <div className="px-5 py-6">
              <p className="text-[0.9375rem] text-muted">Try a part number, a machine type or a feeder size. Spaces and dashes in part numbers do not matter.</p>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {QUICK.map((l) => <li key={l.href}><button type="button" onClick={() => go(l.href)} className="rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold text-dark-900 hover:border-accent hover:text-accent-text">{l.label}</button></li>)}
              </ul>
            </div>
          )}
          {error && <p role="alert" className="px-5 py-6 text-[0.9375rem] text-[#8a1c14]">{error}</p>}
          {loading && !data && <p className="px-5 py-6 text-[0.9375rem] text-muted">Searching&hellip;</p>}

          {data && data.total === 0 && !loading && (
            <div className="px-5 py-6">
              <p className="font-heading text-lg font-bold text-dark-900">No results for &ldquo;{data.q}&rdquo;</p>
              <p className="mt-1 text-[0.9375rem] text-muted">Check the spelling, or send us the part number or your machine model.</p>
              <button type="button" onClick={() => go(rfqHref({ need: 'part', topic: data.q }))} className="mt-4 inline-flex h-11 items-center rounded-control bg-accent px-5 text-[0.9375rem] font-semibold text-on-accent hover:bg-accent-hover">Request this part</button>
            </div>
          )}

          <div id={listId} role="listbox" aria-label="Search suggestions" hidden={!hasResults}>
            {data?.groups.map((g) => (
              <div key={g.kind} role="group" aria-labelledby={`${uid}-g-${g.kind}`}>
                <div id={`${uid}-g-${g.kind}`} className="px-5 pb-1 pt-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">{g.label}</div>
                {g.items.map((item) => {
                  index += 1
                  const i = index
                  return <Option key={`${item.kind}-${item.id}`} id={optionId(i)} item={item} selected={active === i} tokens={data.tokens} onGo={go} />
                })}
              </div>
            ))}
          </div>
        </div>

        {hasResults && (
          <div className="flex items-center justify-between gap-3 border-t border-line bg-surface px-5 py-3 text-[0.8125rem] text-muted">
            <span className="hidden sm:block">
              <kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-semibold">&uarr;</kbd> <kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-semibold">&darr;</kbd> to move &middot; <kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-semibold">Enter</kbd> to open
            </span>
            <button
              type="button"
              id={optionId(seeAllIndex)}
              onClick={seeAll}
              className={`ml-auto rounded-md px-2 py-1 font-semibold text-accent-text hover:text-dark-900 ${active === seeAllIndex ? 'bg-accent-tint' : ''}`}
            >
              See all results for &ldquo;{data.q}&rdquo; &rarr;
            </button>
          </div>
        )}
      </div>
    </dialog>
  )
}

function Option({ id, item, selected, tokens, onGo }: { id: string; item: SearchItem; selected: boolean; tokens: string[]; onGo: (href: string) => void }) {
  const Icon = KIND_ICON[item.kind]
  const origin = originOf(item.origin)
  return (
    <a
      id={id}
      role="option"
      aria-selected={selected}
      href={item.url}
      tabIndex={-1}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return
        e.preventDefault()
        onGo(item.url)
      }}
      className={`flex items-center gap-3.5 px-5 py-2.5 ${selected ? 'bg-accent-tint shadow-[inset_3px_0_0_var(--color-accent)]' : 'hover:bg-surface'}`}
    >
      <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-placeholder text-placeholder-text">
        {item.imageUrl && item.kind === 'product' ? <Image src={item.imageUrl} alt="" fill sizes="44px" className="object-contain p-1" /> : <Icon aria-hidden className="size-5" strokeWidth={1.6} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-[0.9375rem] font-bold text-dark-900"><Highlight text={item.title} tokens={tokens} /></span>
        <span className="block truncate text-[0.8125rem] text-muted">
          {item.partNumbers ? <>Part no. <Highlight text={item.partNumbers} tokens={tokens} />{origin ? ` · ${origin.label}` : ''}</> : item.subtitle}
        </span>
      </span>
      {selected && <CornerDownLeft aria-hidden className="size-4 shrink-0 text-accent-text" />}
    </a>
  )
}
