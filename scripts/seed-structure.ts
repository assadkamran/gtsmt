/**
 * Seeds categories, solutions and industries with starter copy.
 * Idempotent: documents that already exist are left untouched (owner edits are never overwritten).
 * Seeded pages are marked unreviewed, so they stay hidden from search engines until reviewed.
 *
 * Run: npm run seed:structure
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { categories, solutions, industries } from './data/structure'
import { lexical } from './lib/lexical'

const payload = await getPayload({ config })
const log = (m: string) => console.log(m)
let created = 0
let skipped = 0

// ---- categories (parents first) ----
const catId = new Map<string, number>() // key: division/slug
const ordered = [...categories].sort((a, b) => Number(Boolean(a.parent)) - Number(Boolean(b.parent)))
for (const c of ordered) {
  const key = `${c.division}/${c.slug}`
  const existing = await payload.find({ collection: 'categories', where: { and: [{ slug: { equals: c.slug } }, { division: { equals: c.division } }] }, limit: 1, depth: 0 })
  if (existing.docs[0]) {
    catId.set(key, existing.docs[0].id)
    skipped++
    continue
  }
  const parentId = c.parent ? catId.get(`${c.division}/${c.parent}`) : undefined
  if (c.parent && !parentId) throw new Error(`Parent ${c.parent} not found for ${c.slug}`)
  const doc = await payload.create({
    collection: 'categories',
    data: {
      name: c.name,
      slug: c.slug,
      division: c.division,
      parent: parentId,
      sortOrder: c.sortOrder,
      allowCompare: c.division !== 'parts',
      lineStation: c.lineStation,
      summary: c.summary,
      description: c.description ? lexical(c.description) : undefined,
      reviewed: false,
    },
  })
  catId.set(key, doc.id)
  created++
}
log(`categories: ${created} created, ${skipped} already existed`)

// station -> category id (equipment division)
const equipId = (slug: string) => {
  const id = catId.get(`equipment/${slug}`)
  if (!id) throw new Error(`Equipment category not found: ${slug}`)
  return id
}

// ---- solutions ----
created = 0
skipped = 0
const solId = new Map<string, number>()
for (const s of solutions) {
  const existing = await payload.find({ collection: 'solutions', where: { slug: { equals: s.slug } }, limit: 1, depth: 0, draft: false })
  if (existing.docs[0]) {
    solId.set(s.slug, existing.docs[0].id)
    skipped++
    continue
  }
  const doc = await payload.create({
    collection: 'solutions',
    draft: false,
    data: {
      title: s.title,
      slug: s.slug,
      summary: s.summary,
      body: lexical(s.body),
      lineSequence: s.stations.map((st) => ({ station: st.station, category: equipId(st.category), optional: Boolean(st.optional), note: st.note })),
      reviewed: false,
      _status: 'published',
    },
  })
  solId.set(s.slug, doc.id)
  created++
}
log(`solutions: ${created} created, ${skipped} already existed`)

// ---- industries ----
created = 0
skipped = 0
for (const i of industries) {
  const existing = await payload.find({ collection: 'industries', where: { slug: { equals: i.slug } }, limit: 1, depth: 0, draft: false })
  if (existing.docs[0]) {
    skipped++
    continue
  }
  await payload.create({
    collection: 'industries',
    draft: false,
    data: {
      title: i.title,
      slug: i.slug,
      intro: i.intro,
      body: lexical(i.body),
      requirements: i.requirements.map((text) => ({ text })),
      relevantSolutions: i.solutions.map((s) => {
        const id = solId.get(s)
        if (!id) throw new Error(`Solution not found: ${s}`)
        return id
      }),
      relevantCategories: i.categories.map(equipId),
      reviewed: false,
      _status: 'published',
    },
  })
  created++
}
log(`industries: ${created} created, ${skipped} already existed`)

log('done')
process.exit(0)
