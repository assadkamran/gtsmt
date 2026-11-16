'use client'

import { useEffect, useMemo, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { MAX_PHOTO_BYTES, MAX_PHOTOS } from '@/lib/enquiry/options'

const TYPES = ['image/jpeg', 'image/png', 'image/webp']
const size = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

/** Up to three photos of the part. They are re-saved and checked on the server; this only keeps obvious mistakes out. */
export function PhotoPicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const [note, setNote] = useState('')
  const previews = useMemo(() => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })), [files])
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews])

  const add = (list: FileList | null) => {
    if (!list) return
    const next = [...files]
    const problems: string[] = []
    for (const f of Array.from(list)) {
      if (next.length >= MAX_PHOTOS) { problems.push(`Only ${MAX_PHOTOS} photos can be attached.`); break }
      if (!TYPES.includes(f.type)) { problems.push(`${f.name} is not a JPG, PNG or WebP image.`); continue }
      if (f.size > MAX_PHOTO_BYTES) { problems.push(`${f.name} is over 5 MB.`); continue }
      next.push(f)
    }
    setNote(problems.join(' '))
    onChange(next)
  }

  return (
    <div>
      <p className="mb-1.5 text-[0.9375rem] font-semibold text-ink">Photo of the part <span className="font-normal text-muted">(optional)</span></p>
      <div className="relative">
        <input
          id="f-photos"
          type="file"
          accept={TYPES.join(',')}
          multiple
          disabled={files.length >= MAX_PHOTOS}
          onChange={(e) => { add(e.target.files); e.target.value = '' }}
          className="peer sr-only"
        />
        <label
          htmlFor="f-photos"
          className="flex cursor-pointer flex-col items-center gap-1 rounded-[10px] border-[1.5px] border-dashed border-field px-4 py-5 text-center text-[0.9375rem] text-muted transition-colors hover:border-dark-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
        >
          <ImagePlus aria-hidden className="size-6 text-accent-text" />
          <span className="font-semibold text-ink">Add photos</span>
          <span>Up to {MAX_PHOTOS} images, 5 MB each</span>
          <span className="text-[0.8125rem]">Photos are checked and re-saved before we store them.</span>
        </label>
      </div>
      {note && <p role="status" className="mt-2 text-[0.8125rem] text-error">{note}</p>}
      {previews.length > 0 && (
        <ul className="mt-3 space-y-2">
          {previews.map((p, i) => (
            <li key={`${p.file.name}-${i}`} className="flex items-center gap-3 rounded-lg border border-line p-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview of a file the visitor just chose */}
              <img src={p.url} alt="" className="size-12 shrink-0 rounded object-cover" />
              <span className="min-w-0 flex-1 text-sm"><span className="block truncate font-semibold text-ink">{p.file.name}</span><span className="text-muted">{size(p.file.size)}</span></span>
              <button type="button" onClick={() => onChange(files.filter((_, n) => n !== i))} aria-label={`Remove photo ${p.file.name}`} className="grid size-10 place-items-center rounded-control text-muted hover:bg-surface hover:text-ink"><X aria-hidden className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
