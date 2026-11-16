import type { Category } from '../../src/payload-types'

/** Build a minimal Lexical rich-text state from plain paragraphs. */
export function lexical(paragraphs: string[]): NonNullable<Category['description']> {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
        children: [{ type: 'text', text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' }],
      })),
    },
  }
}
