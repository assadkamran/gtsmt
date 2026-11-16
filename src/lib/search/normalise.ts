/** Pure text helpers shared by the indexer and the query side. No framework imports. */

export const stripAccents = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '')

/** Lower-case, accent-free, single-spaced. */
export const normaliseText = (s: string) => stripAccents(s).toLowerCase().replace(/\s+/g, ' ').trim()

/** Part numbers compare with only letters and digits, upper-case: "ab-12 345" and "AB12345" are the same part. */
export const normalisePart = (s: string) => stripAccents(s).toUpperCase().replace(/[^A-Z0-9]/g, '')

export type ParsedQuery = {
  raw: string
  /** Lower-case text used for title matching. */
  text: string
  tokens: string[]
  /** Letters and digits only, upper-case. */
  part: string
  /** True for things like "AB-12345": contains a digit and is short. */
  looksLikePart: boolean
  /** Prefix tsquery source, e.g. "tape:* & feeder:*". Empty when there is nothing usable. */
  tsquery: string
}

export function parseQuery(input: string): ParsedQuery {
  const raw = input.replace(/\s+/g, ' ').trim().slice(0, 80)
  const text = normaliseText(raw)
  const tokens = text.split(/[^a-z0-9]+/).filter(Boolean).slice(0, 8)
  const part = normalisePart(raw)
  return {
    raw,
    text,
    tokens,
    part,
    looksLikePart: part.length >= 3 && /\d/.test(part) && tokens.length <= 3,
    // Tokens contain only [a-z0-9], so this is always valid tsquery syntax.
    tsquery: tokens.map((t) => `${t}:*`).join(' & '),
  }
}

/** Split text around the query tokens so matches can be highlighted. */
export function splitForHighlight(text: string, tokens: string[]): { text: string; hit: boolean }[] {
  const useful = [...new Set(tokens.filter((t) => t.length >= 2))].sort((a, b) => b.length - a.length)
  if (useful.length === 0) return [{ text, hit: false }]
  const escaped = useful.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'gi')
  const out: { text: string; hit: boolean }[] = []
  let last = 0
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0
    if (i > last) out.push({ text: text.slice(last, i), hit: false })
    out.push({ text: m[0], hit: true })
    last = i + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last), hit: false })
  return out.length ? out : [{ text, hit: false }]
}

type LexNode = { text?: string; children?: LexNode[] }

/** Plain text from Lexical rich text, for the search body. */
export function lexicalToText(value: unknown): string {
  const root = (value as { root?: LexNode } | null | undefined)?.root
  if (!root) return ''
  const parts: string[] = []
  const walk = (n: LexNode) => {
    if (typeof n.text === 'string') parts.push(n.text)
    for (const c of n.children ?? []) walk(c)
    if (n.children && n.children.length) parts.push(' ')
  }
  walk(root)
  return parts.join('').replace(/\s+/g, ' ').trim()
}
