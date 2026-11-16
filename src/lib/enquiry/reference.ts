import { randomInt } from 'node:crypto'

/** No 0, O, 1, I or L, so a reference read out over the phone cannot be misheard or mistyped. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** For example "GT-261115-K7QM": GT, the date (YYMMDD, UTC), then four characters. */
export function makeReference(now: Date = new Date(), pick: (max: number) => number = randomInt): string {
  const yy = String(now.getUTCFullYear()).slice(-2)
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(now.getUTCDate()).padStart(2, '0')
  let tail = ''
  for (let i = 0; i < 4; i++) tail += ALPHABET[pick(ALPHABET.length)]
  return `GT-${yy}${mm}${dd}-${tail}`
}
