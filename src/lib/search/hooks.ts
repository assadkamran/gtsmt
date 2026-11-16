import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { reindex, reindexCategoryTree, reindexProductsWhere, removeFromIndex, type SearchKind } from './indexer'

/**
 * Collection hooks that keep the search index current. They never break a save: a failure is logged and the
 * next change (or `npm run search:reindex`) repairs the index.
 */
const guard = async (label: string, fn: () => Promise<void>) => {
  try {
    await fn()
  } catch (e) {
    console.error(`[search] ${label} failed:`, e instanceof Error ? e.message : e)
  }
}

export const indexOnChange = (kind: SearchKind): CollectionAfterChangeHook =>
  async ({ doc, req }) => {
    await guard(`index ${kind} ${doc.id}`, () => reindex(req.payload, kind, doc.id, req))
    return doc
  }

export const indexOnDelete = (kind: SearchKind): CollectionAfterDeleteHook =>
  async ({ doc, req }) => {
    await guard(`remove ${kind} ${doc.id}`, () => removeFromIndex(req.payload, kind, doc.id))
    return doc
  }

/** Categories: the page itself plus every category and product beneath it. */
export const categoryAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  await guard(`category tree ${doc.id}`, () => reindexCategoryTree(req.payload, doc.id, req))
  return doc
}

/** Brands: the brand page plus the products that name the brand in their text. */
export const brandAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  await guard(`brand ${doc.id}`, async () => {
    await reindex(req.payload, 'brand', doc.id, req)
    await reindexProductsWhere(req.payload, { manufacturer: { equals: doc.id } }, req)
  })
  return doc
}

/** Machine models appear in the text of products they verifiably fit, and in their brand page. */
export const modelAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  await guard(`model ${doc.id}`, async () => {
    await reindexProductsWhere(req.payload, { 'compatibility.machineModel': { equals: doc.id } }, req)
    const brandId = typeof doc.manufacturer === 'object' ? doc.manufacturer?.id : doc.manufacturer
    if (brandId) await reindex(req.payload, 'brand', brandId, req)
  })
  return doc
}
