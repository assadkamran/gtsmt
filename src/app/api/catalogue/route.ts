import { NextResponse } from 'next/server'
import { loadDataset } from '@/lib/browse/data'
import { runBrowse } from '@/lib/browse/engine'
import { parseState } from '@/lib/browse/params'
import { MAX_PAGE_SIZE, PAGE_SIZE } from '@/lib/browse/types'
import { clientIp, hit } from '@/lib/rateLimit'

/**
 * Filtered, sorted, paginated products for one category, plus how many results each filter option would give.
 * Public read-only data. Unknown or malformed filters are ignored (see parseState), so the URL is the whole input.
 */
export async function GET(request: Request) {
  const limited = hit(`catalogue:${clientIp(request)}`, 240, 60_000)
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
  }
  const sp = new URL(request.url).searchParams
  const raw = sp.get('category') ?? ''
  const categoryId = /^\d{1,9}$/.test(raw) ? Number(raw) : NaN
  if (!Number.isInteger(categoryId) || categoryId < 1) return NextResponse.json({ error: 'A valid category is required.' }, { status: 400 })
  const requested = Number(sp.get('pageSize'))
  const pageSize = Number.isInteger(requested) && requested >= 1 ? Math.min(requested, MAX_PAGE_SIZE) : PAGE_SIZE

  try {
    const ds = await loadDataset(categoryId)
    if (!ds) return NextResponse.json({ error: 'Category not found.' }, { status: 404 })
    const result = runBrowse(ds, parseState(sp, ds.defs), pageSize)
    return NextResponse.json(result, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
  } catch (e) {
    console.error('[catalogue] failed:', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Products are unavailable right now.' }, { status: 500 })
  }
}
