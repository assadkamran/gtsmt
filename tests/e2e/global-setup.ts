import { execSync } from 'node:child_process'

/** Fresh throwaway accounts for the role tests, and a clean slate of test enquiries. */
export default async function globalSetup() {
  execSync('npm run test:cleanup --silent', { stdio: 'inherit' })
  execSync('npm run test:users --silent', { stdio: 'inherit' })
}
