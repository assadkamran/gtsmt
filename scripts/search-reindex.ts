/** Rebuild the whole search index from the CMS. Run: npm run search:reindex */
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { reindexAll } from '../src/lib/search/indexer'

const payload = await getPayload({ config })
const counts = await reindexAll(payload)
console.log('search index rebuilt:', counts.map((c) => `${c.n} ${c.kind}`).join(', ') || 'empty')
process.exit(0)
