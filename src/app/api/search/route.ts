import { NextResponse } from 'next/server'
import { getCms } from '@/lib/cms'
import { clientIp, hit } from '@/lib/rateLimit'
import { suggest } from '@/lib/search/query'

/** Grouped suggestions for the header search dialog. Cached briefly at the edge. */
export async function GET(request: Request) {
  const limited = hit(`search:${clientIp(request)}`, 90, 60_000)
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many searches. Please wait a moment.' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
  }
  const q = (new URL(request.url).searchParams.get('q') ?? '').slice(0, 80)
  if (q.trim().length < 2) return NextResponse.json({ q, tokens: [], total: 0, groups: [] })
  try {
    const result = await suggest(await getCms(), q)
    return NextResponse.json(result, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
  } catch (e) {
    console.error('[search] suggest failed:', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Search is unavailable right now.' }, { status: 500 })
  }
}
