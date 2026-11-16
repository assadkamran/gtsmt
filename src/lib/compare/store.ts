'use client'

import { useSyncExternalStore } from 'react'
import { MAX_COMPARE } from './store-limits'

/**
 * The compare tray's selection, kept in this browser (localStorage) so it survives page loads and is shared between
 * tabs. Nothing about it is sent anywhere. One category at a time, up to four products.
 *
 * localStorage is writable by anything running on the page, so everything read back is re-validated here before it is
 * used for a link or an image.
 */

export { MAX_COMPARE }
const KEY = 'gtsmt.compare.v1'

export type CompareItem = { id: number; title: string; image: string | null }
export type CompareCategory = { id: number; name: string; href: string }
export type CompareState = { category: CompareCategory | null; items: CompareItem[] }

const EMPTY: CompareState = { category: null, items: [] }
const safePath = (v: unknown): v is string => typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && v.length < 300
const safeImage = (v: unknown): v is string => typeof v === 'string' && v.length < 500 && (v.startsWith('/') && !v.startsWith('//') ? true : /^https:\/\//i.test(v))

function validate(input: unknown): CompareState {
  if (!input || typeof input !== 'object') return EMPTY
  const { category, items } = input as { category?: Partial<CompareCategory>; items?: unknown }
  if (!category || !Number.isInteger(category.id) || (category.id as number) < 1 || typeof category.name !== 'string' || !safePath(category.href) || !Array.isArray(items)) return EMPTY
  const clean: CompareItem[] = []
  for (const it of items) {
    const i = it as Partial<CompareItem>
    if (!Number.isInteger(i.id) || (i.id as number) < 1 || typeof i.title !== 'string' || clean.some((c) => c.id === i.id)) continue
    clean.push({ id: i.id as number, title: i.title.slice(0, 200), image: safeImage(i.image) ? i.image : null })
    if (clean.length === MAX_COMPARE) break
  }
  return clean.length ? { category: { id: category.id as number, name: category.name.slice(0, 120), href: category.href as string }, items: clean } : EMPTY
}

/* ------------------------------------------------------------------ storage-backed state */
let cached: CompareState = EMPTY
let cachedRaw: string | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

function read(): CompareState {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw === cachedRaw) return cached
    cachedRaw = raw
    cached = raw ? validate(JSON.parse(raw)) : EMPTY
    return cached
  } catch {
    return cached
  }
}

function write(next: CompareState) {
  cached = next.items.length ? next : EMPTY
  try {
    if (cached === EMPTY) window.localStorage.removeItem(KEY)
    else window.localStorage.setItem(KEY, (cachedRaw = JSON.stringify(cached)))
    if (cached === EMPTY) cachedRaw = null
  } catch {
    // Storage blocked (private mode, full): the selection still works until the page is closed.
  }
  emit()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) cb()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

export const useCompare = (): CompareState => useSyncExternalStore(subscribe, read, () => EMPTY)

/* ------------------------------------------------------------------ actions */
export type AddResult = { ok: true } | { ok: false; reason: 'full' | 'other-category' }

export function addItem(item: CompareItem, category: CompareCategory): AddResult {
  const cur = read()
  if (cur.category && cur.category.id !== category.id) {
    notify({ kind: 'other-category', current: cur.category.name, next: category.name, pending: { item, category } })
    return { ok: false, reason: 'other-category' }
  }
  if (cur.items.some((i) => i.id === item.id)) return { ok: true }
  if (cur.items.length >= MAX_COMPARE) {
    notify({ kind: 'full' })
    return { ok: false, reason: 'full' }
  }
  notify(null)
  write({ category, items: [...cur.items, item] })
  return { ok: true }
}

export function removeItem(id: number) {
  const cur = read()
  notify(null)
  write({ category: cur.category, items: cur.items.filter((i) => i.id !== id) })
}

export function clearCompare() {
  notify(null)
  write(EMPTY)
}

/** Drop the current selection and start a new one with this product. */
export function startNew(item: CompareItem, category: CompareCategory) {
  notify(null)
  write({ category, items: [item] })
}

/* ------------------------------------------------------------------ the "why not" message */
export type Notice =
  | { kind: 'full' }
  | { kind: 'other-category'; current: string; next: string; pending: { item: CompareItem; category: CompareCategory } }

let notice: Notice | null = null
const noticeListeners = new Set<() => void>()
function notify(n: Notice | null) {
  notice = n
  noticeListeners.forEach((l) => l())
}
export const dismissNotice = () => notify(null)
export const useNotice = (): Notice | null =>
  useSyncExternalStore(
    (cb) => {
      noticeListeners.add(cb)
      return () => void noticeListeners.delete(cb)
    },
    () => notice,
    () => null,
  )
