import fs from 'node:fs'
import path from 'node:path'
import { expect, test as base, type APIRequestContext, type Page, type PlaywrightWorkerArgs } from '@playwright/test'

type Playwright = PlaywrightWorkerArgs['playwright']

export const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
export type Role = 'admin' | 'editor' | 'sales'

const accounts = (): Record<Role, { id: number; email: string; password: string }> => JSON.parse(fs.readFileSync(path.resolve('.local/e2e-users.json'), 'utf8'))

/** A different "visitor address" per call, so tests do not use up each other's per-address limits. */
export const freshIp = () => `198.51.100.${1 + Math.floor(Math.random() * 250)}`
export const testEmail = (tag: string) => `${tag}.${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}@example.com`

/** A stand-in for Cloudflare's script: the real server-side check still runs, against Cloudflare's test secret. */
const TURNSTILE_STUB = `window.turnstile={render:function(el,o){setTimeout(function(){o.callback('XXXX.DUMMY.TOKEN.XXXX')},30);return 'w'+Math.random()},reset:function(){},remove:function(){}}`

export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
    await page.route('https://challenges.cloudflare.com/**', (route) => route.fulfill({ contentType: 'application/javascript', body: TURNSTILE_STUB }))
    await use(page)
  },
})
export { expect }

/** An API session signed in as one of the throwaway accounts. Sends the Origin header a browser would. */
export async function apiAs(playwright: Playwright, role: Role): Promise<APIRequestContext> {
  const ctx = await playwright.request.newContext({ baseURL: BASE, extraHTTPHeaders: { Origin: BASE } })
  const { email, password } = accounts()[role]
  const res = await ctx.post('/api/users/login', { data: { email, password } })
  expect(res.ok(), `login as ${role}`).toBeTruthy()
  return ctx
}

export async function anonymous(playwright: Playwright): Promise<APIRequestContext> {
  return playwright.request.newContext({ baseURL: BASE, extraHTTPHeaders: { Origin: BASE } })
}

export const enquiryBody = (over: Record<string, unknown> = {}, meta: Record<string, unknown> = {}) => ({
  data: {
    type: 'contact',
    name: 'E2E Tester',
    company: '[TEST] E2E Co',
    email: testEmail('e2e'),
    country: 'DE',
    consent: true,
    message: 'A message sent by the automated tests.',
    ...over,
  },
  meta: { elapsedMs: 15_000, turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX', page: '/e2e', ...meta },
})

/** Post an enquiry the way the form does: same origin, from a given visitor address. */
export function postEnquiry(ctx: APIRequestContext, body: unknown, ip = freshIp(), headers: Record<string, string> = {}) {
  return ctx.post('/api/enquiry', { data: body, headers: { Origin: BASE, 'X-Forwarded-For': ip, ...headers } })
}

export async function findEnquiry(admin: APIRequestContext, reference: string) {
  const res = await admin.get(`/api/enquiries?where[reference][equals]=${encodeURIComponent(reference)}&depth=0`)
  expect(res.ok()).toBeTruthy()
  const json = await res.json()
  return json.docs[0] as Record<string, any> | undefined
}

/** The catalogue ids the tests rely on, looked up rather than hard-coded. */
export async function sampleIds(ctx: APIRequestContext) {
  const cats = await ctx.get('/api/categories?limit=200&depth=0&select[slug]=true&select[division]=true')
  const list = (await cats.json()).docs as { id: number; slug: string; division: string }[]
  const id = (slug: string, division: string) => list.find((c) => c.slug === slug && c.division === division)?.id
  return { tapeFeeders: id('tape-feeders', 'parts'), pickAndPlace: id('pick-and-place-machines', 'equipment') }
}
