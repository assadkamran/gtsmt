import { defineConfig, devices } from '@playwright/test'

try {
  process.loadEnvFile('.env.local')
} catch {
  // No .env.local: the environment may already provide everything.
}

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

/**
 * End-to-end tests. They run against a real server and database, so they:
 *  - need the sample fixtures (npm run seed:samples),
 *  - expect Cloudflare's always-pass Turnstile test keys (see .env.example) or no keys at all,
 *  - mark everything they create with "[TEST]" or an example.com address and remove it afterwards (npm run test:cleanup).
 * One worker, because the tests share a database and the enquiry rate limits.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }, testIgnore: /\.mobile\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /\.mobile\.spec\.ts/ },
  ],
  webServer: process.env.E2E_BASE_URL ? undefined : { command: 'npm run dev', url: baseURL, reuseExistingServer: true, timeout: 180_000 },
})
