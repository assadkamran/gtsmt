import type { Dataset } from './types'

/**
 * Short-lived in-memory copy of each category's listing data. Product edits clear it straight away (see revalidate.ts);
 * the time limit only bounds how stale a second server instance can be. Browsing never waits on the database twice
 * for the same category within that window.
 */
const TTL_MS = 30_000
const store = new Map<number, { at: number; data: Dataset }>()
const inflight = new Map<number, Promise<Dataset | null>>()

export function readCache(categoryId: number): Dataset | null {
  const hit = store.get(categoryId)
  return hit && Date.now() - hit.at < TTL_MS ? hit.data : null
}

export function writeCache(categoryId: number, data: Dataset) {
  if (store.size > 300) store.clear()
  store.set(categoryId, { at: Date.now(), data })
}

export function dedupe(categoryId: number, load: () => Promise<Dataset | null>): Promise<Dataset | null> {
  const running = inflight.get(categoryId)
  if (running) return running
  const p = load().finally(() => inflight.delete(categoryId))
  inflight.set(categoryId, p)
  return p
}

export function invalidateBrowseCache() {
  store.clear()
}
