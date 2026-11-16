import { execSync } from 'node:child_process'

/** Leave no test accounts, enquiries or photos behind. */
export default async function globalTeardown() {
  execSync('npm run test:cleanup --silent', { stdio: 'inherit' })
  execSync('npm run test:users --silent -- --remove', { stdio: 'inherit' })
}
