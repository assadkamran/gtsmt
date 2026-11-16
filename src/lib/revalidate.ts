import { revalidatePath } from 'next/cache'
import { invalidateBrowseCache } from './browse/cache'

/** Refresh the public site after content changes in the CMS (no rebuild needed). */
export function revalidateSite() {
  invalidateBrowseCache()
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Outside a Next.js request (e.g. seed scripts) there is nothing to revalidate. Safe to ignore.
  }
}
