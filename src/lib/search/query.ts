import type { Payload } from 'payload'
import { sql } from '@payloadcms/db-postgres'
import { drizzleOf, type SearchKind } from './indexer'
import { parseQuery } from './normalise'

export type SearchItem = {
  id: number
  kind: SearchKind
  title: string
  subtitle: string | null
  excerpt: string | null
  url: string
  imageUrl: string | null
  partNumbers: string | null
  origin: string | null
  exact: boolean
  score: number
}

export type SearchResult = {
  q: string
  tokens: string[]
  total: number
  counts: Record<SearchKind, number>
  items: SearchItem[]
}

const KINDS: SearchKind[] = ['product', 'category', 'solution', 'industry', 'brand']
const empty = (q: string, tokens: string[] = []): SearchResult => ({ q, tokens, total: 0, counts: { product: 0, category: 0, solution: 0, industry: 0, brand: 0 }, items: [] })

/**
 * Ranking, in order of weight: an exact part number, a part-number prefix, a title that starts with or equals the query,
 * stemmed full-text relevance, then typo-tolerant title and part-number similarity. Every value is a bound parameter.
 */
export async function searchSite(payload: Payload, o: { q: string; kind?: SearchKind | 'all'; limit?: number; offset?: number; brandId?: number | null }): Promise<SearchResult> {
  const p = parseQuery(o.q)
  if (p.text.length < 2) return empty(p.raw, p.tokens)

  const part = p.part
  const raw = p.text
  const hasTs = p.tsquery !== ''
  const brand = o.brandId ? sql`s.brand_id = ${o.brandId}::int` : sql`true`
  const fts = hasTs ? sql`(s.tsv @@ to_tsquery('english', ${p.tsquery}::text))` : sql`false`
  const ftsRank = hasTs ? sql`ts_rank_cd(s.tsv, to_tsquery('english', ${p.tsquery}::text), 32)` : sql`0`

  const matched = sql`
    SELECT s.*,
      (${part}::text <> '' AND s.part_norm IS NOT NULL AND (' ' || s.part_norm || ' ') LIKE ('% ' || ${part}::text || ' %')) AS part_exact,
      (length(${part}::text) >= 3 AND s.part_norm IS NOT NULL AND (' ' || s.part_norm) LIKE ('% ' || ${part}::text || '%')) AS part_prefix,
      (length(${part}::text) >= 5 AND s.part_norm IS NOT NULL AND word_similarity(${part}::text, s.part_norm) >= 0.6) AS part_fuzzy,
      ${fts} AS fts,
      (length(${raw}::text) >= 3 AND s.title_norm LIKE (${raw}::text || '%')) AS title_prefix,
      (length(${raw}::text) >= 4 AND word_similarity(${raw}::text, s.title_norm) >= 0.55) AS title_fuzzy,
      ${ftsRank} AS fts_rank,
      word_similarity(${raw}::text, s.title_norm) AS title_sim
    FROM search_index s
    WHERE ${brand}
  `

  const scored = sql`
    SELECT m.*,
      (CASE WHEN part_exact THEN 100 WHEN part_prefix THEN 60 WHEN part_fuzzy THEN 35 ELSE 0 END)
      + (CASE WHEN m.title_norm = ${raw}::text THEN 50 WHEN title_prefix THEN 25 ELSE 0 END)
      + (CASE WHEN fts THEN fts_rank * 20 ELSE 0 END)
      + (CASE WHEN title_fuzzy THEN title_sim * 10 ELSE 0 END)
      + (CASE m.kind WHEN 'product' THEN 3 WHEN 'category' THEN 2 WHEN 'brand' THEN 2 WHEN 'solution' THEN 1 ELSE 0.5 END) AS score
    FROM (${matched}) m
    WHERE part_exact OR part_prefix OR part_fuzzy OR fts OR title_prefix OR title_fuzzy
  `

  const kindFilter = o.kind && o.kind !== 'all' ? sql`kind = ${o.kind}::text` : sql`true`
  const limit = Math.min(Math.max(o.limit ?? 20, 1), 60)
  const offset = Math.max(o.offset ?? 0, 0)
  const db = drizzleOf(payload)

  const [countRows, itemRows] = await Promise.all([
    db.execute(sql`SELECT kind, count(*)::int AS n FROM (${scored}) r GROUP BY kind`),
    db.execute(sql`
      SELECT id, kind, url, title, subtitle, excerpt, image_url, part_numbers, meta, part_exact, score
      FROM (${scored}) r WHERE ${kindFilter}
      ORDER BY score DESC, title ASC
      LIMIT ${limit}::int OFFSET ${offset}::int
    `),
  ])

  const counts = empty(p.raw).counts
  for (const r of countRows.rows) counts[r.kind as SearchKind] = Number(r.n)
  const total = KINDS.reduce((a, k) => a + counts[k], 0)

  const items: SearchItem[] = itemRows.rows.map((r) => ({
    id: Number(r.id),
    kind: r.kind as SearchKind,
    title: String(r.title),
    subtitle: (r.subtitle as string | null) ?? null,
    excerpt: (r.excerpt as string | null) ?? null,
    url: String(r.url),
    imageUrl: (r.image_url as string | null) ?? null,
    partNumbers: (r.part_numbers as string | null) ?? null,
    origin: ((r.meta as { origin?: string } | null)?.origin as string | undefined) ?? null,
    exact: Boolean(r.part_exact),
    score: Number(r.score),
  }))
  return { q: p.raw, tokens: p.tokens, total, counts, items }
}

/** Quotas for the header dialog: a few of each kind, exact part-number matches first. */
const QUOTA: Record<SearchKind, number> = { product: 4, category: 3, solution: 2, industry: 2, brand: 2 }
const LABEL: Record<SearchKind, string> = { product: 'Products', category: 'Categories', solution: 'Solutions', industry: 'Industries', brand: 'Brands' }

export type SuggestGroup = { kind: SearchKind | 'exact'; label: string; items: SearchItem[] }

export async function suggest(payload: Payload, q: string): Promise<{ q: string; tokens: string[]; total: number; groups: SuggestGroup[] }> {
  const r = await searchSite(payload, { q, limit: 40 })
  const groups: SuggestGroup[] = []
  const exact = r.items.filter((i) => i.exact).slice(0, 3)
  if (exact.length) groups.push({ kind: 'exact', label: 'Exact part number match', items: exact })
  const taken = new Set(exact.map((i) => `${i.kind}:${i.id}`))
  for (const kind of KINDS) {
    const items = r.items.filter((i) => i.kind === kind && !taken.has(`${kind}:${i.id}`)).slice(0, QUOTA[kind])
    if (items.length) groups.push({ kind, label: LABEL[kind], items })
  }
  return { q: r.q, tokens: r.tokens, total: r.total, groups }
}
