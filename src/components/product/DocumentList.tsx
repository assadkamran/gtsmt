import { FileText, Download } from 'lucide-react'
import type { ProductDocument } from '@/payload-types'

const TYPE: Record<string, string> = { datasheet: 'Datasheet', manual: 'Manual', brochure: 'Brochure', certificate: 'Certificate' }

export const documentLabel = (d: Pick<ProductDocument, 'type'>) => TYPE[d.type] ?? 'Document'

function size(bytes?: number | null) {
  if (!bytes) return ''
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function DocumentList({ docs }: { docs: ProductDocument[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-card border border-line">
      {docs.map((d) => (
        <li key={d.id}>
          <a href={d.url ?? '#'} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface">
            <FileText aria-hidden className="size-7 shrink-0 text-accent-text" strokeWidth={1.5} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-heading font-bold text-dark-900">{d.title}</span>
              <span className="block text-sm text-muted">{documentLabel(d)} &middot; PDF{d.filesize ? ` · ${size(d.filesize)}` : ''}{d.language ? ` · ${d.language}` : ''}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-accent-text group-hover:text-dark-900"><Download aria-hidden className="size-4" />Download</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
