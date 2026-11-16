/**
 * DEV-ONLY sample fixtures so the product and catalogue templates can be reviewed.
 *
 * - Everything is prefixed "[SAMPLE]" and uses bracketed placeholder values. No real or invented specifications.
 * - Products are noindex. Refuses to run in production.
 * - Remove everything with:  npm run seed:samples:remove
 *
 * Run: npm run seed:samples
 */
import { getPayload } from 'payload'
import sharp from 'sharp'
import config from '../src/payload.config'
import { toSlug } from '../src/lib/slug'
import { lexical } from './lib/lexical'

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run sample fixtures in production.')
  process.exit(1)
}

const PREFIX = '[SAMPLE]'
const payload = await getPayload({ config })

async function removeAll() {
  const del = async (collection: 'products' | 'machine-models' | 'manufacturers' | 'spec-attributes' | 'product-documents' | 'media', field: string) => {
    const res = await payload.delete({ collection, where: { [field]: { like: PREFIX } } })
    console.log(`${collection}: removed ${res.docs?.length ?? 0}`)
  }
  await del('products', 'title')
  await del('machine-models', 'name')
  await del('manufacturers', 'name')
  await del('spec-attributes', 'label')
  await del('product-documents', 'title')
  await del('media', 'alt')
}

if (process.argv.includes('--remove')) {
  await removeAll()
  console.log('Sample fixtures removed.')
  process.exit(0)
}

const existing = await payload.find({ collection: 'products', where: { title: { like: PREFIX } }, limit: 1, depth: 0 })
if (existing.docs.length > 0) {
  console.log('Sample fixtures already present. Run "npm run seed:samples:remove" first to recreate them.')
  process.exit(0)
}

/* ---------------- media ---------------- */
const tints = ['#E2E8F4', '#D5DEEF', '#C9D5EA']
const mediaIds: number[] = []
for (let i = 0; i < tints.length; i++) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><rect width="1200" height="900" fill="${tints[i]}"/><rect x="280" y="240" width="640" height="420" rx="24" fill="#ffffff" opacity=".7"/><text x="600" y="460" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" text-anchor="middle" fill="#46547A">SAMPLE IMAGE ${i + 1}</text><text x="600" y="530" font-family="Arial, Helvetica, sans-serif" font-size="30" text-anchor="middle" fill="#46547A">Placeholder for layout review</text></svg>`
  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  const m = await payload.create({
    collection: 'media',
    data: { alt: `${PREFIX} placeholder image ${i + 1}`, credit: 'Generated locally for layout review. Not a real product photo.', isOwnPhoto: false },
    file: { data: buf, mimetype: 'image/png', name: `sample-${i + 1}.png`, size: buf.length },
  })
  mediaIds.push(m.id)
}

/* ---------------- document (tiny valid PDF) ---------------- */
function makePdf(line: string): Buffer {
  const stream = `BT /F1 16 Tf 20 70 Td (${line}) Tj ET`
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let out = '%PDF-1.4\n'
  const offs: number[] = []
  objs.forEach((o, i) => {
    offs.push(out.length)
    out += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = out.length
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(out, 'latin1')
}
const pdf = makePdf('SAMPLE datasheet - placeholder')
const doc = await payload.create({
  collection: 'product-documents',
  data: { title: `${PREFIX} Datasheet placeholder`, type: 'datasheet', language: 'English' },
  file: { data: pdf, mimetype: 'application/pdf', name: 'sample-datasheet.pdf', size: pdf.length },
})

/* ---------------- brand and model ---------------- */
const brand = await payload.create({ collection: 'manufacturers', data: { name: `${PREFIX} Brand A`, slug: toSlug(`${PREFIX} Brand A`), showAsBrandHub: true, notes: `${PREFIX} Placeholder brand for layout review.`, seo: { noindex: true } } })
const model = await payload.create({ collection: 'machine-models', data: { manufacturer: brand.id, name: `${PREFIX} Model X`, slug: toSlug(`${PREFIX} Model X`), machineType: 'pick-and-place' } })
// A second and third brand and a second model, so brand and machine-model filters have something to filter.
const brandB = await payload.create({ collection: 'manufacturers', data: { name: `${PREFIX} Brand B`, slug: toSlug(`${PREFIX} Brand B`), showAsBrandHub: true, notes: `${PREFIX} Placeholder brand for layout review.`, seo: { noindex: true } } })
const brandC = await payload.create({ collection: 'manufacturers', data: { name: `${PREFIX} Brand C`, slug: toSlug(`${PREFIX} Brand C`), showAsBrandHub: true, notes: `${PREFIX} Placeholder brand for layout review.`, seo: { noindex: true } } })
const modelY = await payload.create({ collection: 'machine-models', data: { manufacturer: brandB.id, name: `${PREFIX} Model Y`, slug: toSlug(`${PREFIX} Model Y`), machineType: 'pick-and-place' } })

/* ---------------- products ---------------- */
const catId = async (division: 'equipment' | 'parts' | 'peripherals', slug: string) => {
  const r = await payload.find({ collection: 'categories', where: { and: [{ slug: { equals: slug } }, { division: { equals: division } }] }, limit: 1, depth: 0 })
  if (!r.docs[0]) throw new Error(`Category missing: ${division}/${slug}. Run "npm run seed:structure" first.`)
  return r.docs[0].id
}

// Typed attributes (all "[SAMPLE]") so filters, comparison and validation can be reviewed.
const mk = (label: string, key: string, type: 'choice' | 'number' | 'yesno' | 'text', extra: { unit?: string; choices?: string[]; filterable?: boolean; sortOrder: number }) =>
  payload.create({
    collection: 'spec-attributes',
    data: { label: `${PREFIX} ${label}`, key, type, unit: extra.unit, choices: extra.choices?.map((value) => ({ value })), filterable: Boolean(extra.filterable), comparable: true, sortOrder: extra.sortOrder },
  })
const attrs = [
  await mk('Tape width', 'sample_tape_width', 'choice', { choices: ['Option A', 'Option B', 'Option C'], filterable: true, sortOrder: 10 }),
  await mk('Feed pitch', 'sample_feed_pitch', 'number', { unit: '[unit]', filterable: true, sortOrder: 20 }),
  await mk('Drive type', 'sample_drive_type', 'choice', { choices: ['Option A', 'Option B'], filterable: true, sortOrder: 30 }),
  await mk('Weight', 'sample_weight', 'number', { unit: '[unit]', sortOrder: 40 }),
  await mk('Notes', 'sample_notes', 'text', { sortOrder: 50 }),
  await mk('Supports double-sided', 'sample_double_sided', 'yesno', { filterable: true, sortOrder: 60 }),
]
let seedIdx = 0
const specs = (n: number) => {
  const i = seedIdx++
  const rows = [
    { attribute: attrs[0].id, value: ['Option A', 'Option B', 'Option C'][i % 3] },
    { attribute: attrs[1].id, value: String([2, 4, 8][i % 3]) },
    { attribute: attrs[2].id, value: ['Option A', 'Option B'][i % 2] },
    { attribute: attrs[3].id, value: String(10 + i) },
    { attribute: attrs[4].id, value: `${PREFIX} note ${i + 1}` },
    { attribute: attrs[5].id, value: i % 2 ? 'Yes' : 'No' },
  ]
  return rows.slice(0, n)
}
const lines = (label: string, n: number) => Array.from({ length: n }, (_, i) => ({ text: `${PREFIX} ${label} ${i + 1}` }))

type Origin = 'new-machine' | 'genuine-oem' | 'oem-surplus' | 'compatible-aftermarket' | 'used-refurbished'
type P = {
  title: string
  division: 'equipment' | 'parts' | 'peripherals'
  cat: string
  origin: Origin
  part?: string
  gallery?: number[]
  specs?: number
  rich?: boolean
  withDoc?: boolean
  brand?: boolean
  brandId?: number
  compat?: 'verified' | 'unverified'
  modelId?: number
  featured?: boolean
}

async function make(p: P) {
  return payload.create({
    collection: 'products',
    draft: false,
    data: {
      title: `${PREFIX} ${p.title}`,
      slug: toSlug(`${PREFIX} ${p.title}`),
      category: await catId(p.division, p.cat),
      partOrigin: p.origin,
      partNumber: p.part,
      manufacturer: p.brandId ?? (p.brand ? brand.id : undefined),
      shortIntro: `${PREFIX} Short introduction placeholder for layout review. Replace with real copy.`,
      description: p.rich ? lexical([`${PREFIX} Description paragraph one. Replace with real copy written in the CMS.`, `${PREFIX} Description paragraph two.`]) : undefined,
      features: p.rich ? lines('Feature', 4) : undefined,
      applications: p.rich ? lines('Application', 4) : undefined,
      specs: p.specs ? specs(p.specs) : undefined,
      gallery: (p.gallery ?? []).map((i) => ({ image: mediaIds[i] })),
      documents: p.withDoc ? [doc.id] : undefined,
      compatibility: p.compat ? [{ machineModel: p.modelId ?? model.id, verified: p.compat === 'verified', source: p.compat === 'verified' ? `${PREFIX} source reference` : undefined }] : undefined,
      featured: Boolean(p.featured),
      quoteOnly: true,
      seo: { noindex: true },
      _status: 'published',
    },
  })
}

for (const [division, slug] of [['equipment', 'pick-and-place-machines'], ['equipment', 'reflow-soldering-ovens'], ['equipment', 'aoi-automated-optical-inspection'], ['parts', 'tape-feeders'], ['parts', 'nozzles'], ['peripherals', 'magazine-loaders']] as const) {
  await payload.update({ collection: 'categories', id: await catId(division, slug), data: { specAttributes: attrs.map((a) => a.id) } })
}

const a = await make({ title: 'Pick and place machine A', division: 'equipment', cat: 'pick-and-place-machines', origin: 'new-machine', part: 'SAMPLE-PNP-A', gallery: [0, 1, 2], specs: 6, rich: true, withDoc: true, brand: true, featured: true })
const b = await make({ title: 'Pick and place machine B', division: 'equipment', cat: 'pick-and-place-machines', origin: 'new-machine', specs: 3, featured: true })
// More machines in the same category, so comparison (up to four) and the brand and condition filters can be reviewed.
for (const [i, t] of (['C', 'D', 'E'] as const).entries()) {
  await make({ title: `Pick and place machine ${t}`, division: 'equipment', cat: 'pick-and-place-machines', origin: i === 1 ? 'used-refurbished' : 'new-machine', part: `SAMPLE-PNP-${t}`, gallery: [i % 3], specs: 6, brandId: [brand.id, brandB.id, brandC.id][i] })
}
const c = await make({ title: 'Reflow oven', division: 'equipment', cat: 'reflow-soldering-ovens', origin: 'new-machine', gallery: [1], specs: 4, featured: true })
const d = await make({ title: 'AOI system', division: 'equipment', cat: 'aoi-automated-optical-inspection', origin: 'new-machine', gallery: [2], specs: 4, featured: true })
const f8 = await make({ title: 'Tape feeder 8 mm', division: 'parts', cat: 'tape-feeders', origin: 'compatible-aftermarket', part: 'SAMPLE-F-0008', gallery: [0], specs: 5, rich: true, withDoc: true, brand: true, compat: 'verified' })
const f12 = await make({ title: 'Tape feeder 12 mm', division: 'parts', cat: 'tape-feeders', origin: 'genuine-oem', part: 'SAMPLE-F-0012', gallery: [1, 2], specs: 4, brand: true, compat: 'verified' })
const nz = await make({ title: 'Nozzle type 1', division: 'parts', cat: 'nozzles', origin: 'oem-surplus', part: 'SAMPLE-N-0001', specs: 3, brand: true, compat: 'unverified' })
const ld = await make({ title: 'Magazine loader', division: 'peripherals', cat: 'magazine-loaders', origin: 'new-machine', gallery: [0], specs: 3 })
const bulkBrands = [brand.id, brandB.id, brandC.id]
for (let i = 1; i <= 12; i++) {
  await make({
    title: `Tape feeder sample ${String(i).padStart(2, '0')}`,
    division: 'parts',
    cat: 'tape-feeders',
    origin: (['oem-surplus', 'used-refurbished', 'genuine-oem', 'compatible-aftermarket'] as const)[i % 4],
    part: `SAMPLE-F-1${String(i).padStart(3, '0')}`,
    brandId: bulkBrands[i % 3],
    specs: 6,
    // Two thirds list a verified model, one third none.
    ...(i % 3 === 0 ? { compat: 'verified' as const } : i % 3 === 1 ? { compat: 'verified' as const, modelId: modelY.id } : {}),
  })
}

// relationships (second pass)
await payload.update({ collection: 'products', id: a.id, draft: false, data: { accessories: [ld.id], related: [b.id, c.id, d.id] } })
await payload.update({ collection: 'products', id: f8.id, draft: false, data: { related: [f12.id, nz.id] } })

console.log('Sample fixtures created: 3 images, 1 document, 3 brands, 2 models, 6 spec attributes, 23 products.')
console.log('Remove with: npm run seed:samples:remove')
process.exit(0)
