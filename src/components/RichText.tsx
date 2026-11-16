import { RichText as PayloadRichText, LinkJSXConverter, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

type Data = Parameters<typeof PayloadRichText>[0]['data']

// Internal document links fall back to the homepage until a document-to-URL map exists.
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref: () => '/' }),
})

type Node = { type?: string; text?: string; children?: Node[] }

/** True when the rich text contains any actual text. An untouched editor saves an empty paragraph. */
export function hasRichText(data: unknown): boolean {
  const walk = (n: Node | undefined): boolean => !!n && ((typeof n.text === 'string' && n.text.trim().length > 0) || (n.children ?? []).some(walk))
  return !!data && typeof data === 'object' && walk((data as { root?: Node }).root)
}

export function RichText({ data, className = '' }: { data: unknown; className?: string }) {
  if (!hasRichText(data)) return null
  return <PayloadRichText data={data as Data} converters={converters} className={`prose-gt ${className}`} />
}
