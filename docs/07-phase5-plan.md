# Phase 5 plan: finding the right product and sending a precise enquiry

**Status: PROPOSED, awaiting approval (2026-11-15). Nothing is built.** The visual designs were presented in the conversation (search, filters and compare, comparison page, enquiry wizard, pipelines).

## Scope
1. **Search**: header dialog with grouped suggestions, `/search` results page, part-number matching that ignores case, spaces and dashes and forgives a typo.
2. **Filters and sort** on category pages: brand, condition (origin), machine model (verified fit only), and spec attributes marked filterable. Facet counts, applied-filter chips, shareable URLs, mobile filter sheet.
3. **Compare**: checkbox on cards, tray, `/compare` page with differences highlighted. One category at a time.
4. **Enquiry system**: multi-step wizard at `/request-a-quote` (complete line, equipment, parts, peripherals), contact form, spam protection, email notification, admin inbox.
5. **CMS functionality**: structured spec attributes, real role permissions, enquiry management, search sync, database migrations.
6. **Quality tooling**: unit tests, end-to-end tests, automated accessibility checks.

## Routes and APIs
| Route | Purpose |
|---|---|
| `GET /api/search?q=` | grouped suggestions (up to 8), cached about a minute |
| `/search?q=` | results page, `noindex` |
| `GET /api/catalogue?...` | filtered results plus facet counts for a category |
| `/compare?items=1,2,3` | comparison page, `noindex` |
| `/request-a-quote` | wizard. Reads `need`, `product`, `part`, `topic` (already sent by Phase 4 buttons) |
| `/contact` | contact form |
| `POST /api/enquiry` | single submission endpoint, validated server-side |

## Data model changes
- New `spec-attributes` collection (key, label, type text/number/choice/yes-no, unit, choices, filterable, comparable, order). Categories list which attributes apply. Product spec rows pick an attribute and enter a value, validated by type. Replaces Phase 4's free-text spec rows and the unused `spec-templates` collection. Phase 4 sample data is re-seeded; no real data exists yet.
- `categories.allowCompare` (default on for equipment and peripherals).
- Internal `search-index` table with `pg_trgm` and `unaccent`, plus an anonymous `search-misses` log (query and count only).
- `enquiries`: `reference` (unique), readable summary, assignee, email status, spam reasons, attachments. New private `enquiry-files`.
- Website Settings: enquiry recipients, auto-reply (off by default), retention months, photo uploads on/off.
- Users: enforced roles. Admin everything; editor content only; sales enquiries plus read-only catalogue. First user becomes admin.

## Key decisions
| Area | Choice | Why | Trade-off |
|---|---|---|---|
| Search | Postgres full-text plus `pg_trgm` on a denormalised index kept current by hooks | No extra service. Verified locally: extensions available, role can create them | Typo tolerance is good, not instant-search perfect. Move to Meilisearch if the catalogue or latency demands it |
| Filtering | Static category pages plus a client filter panel calling `/api/catalogue` | Keeps pages static and indexable. Filtered URLs are shareable, not indexed | Facet counts computed in app code, fine to a few thousand products per category |
| Specs | First-class attributes with types | Needed for reliable filters, comparison and validation | Phase 4 spec editor changes |
| Spam | Cloudflare Turnstile (server-verified), honeypot, per-IP and per-email limits in Postgres, quarantine for suspicious content | No puzzles for buyers. Quarantine avoids losing real enquiries to false positives | Needs a Cloudflare account. Turnstile has a free plan; limits are on Cloudflare's plans page and should be confirmed |
| Email | Payload email adapter, provider chosen later (Resend or SMTP) | The enquiry is saved before any email is attempted | Needs a verified sending domain (SPF/DKIM) |
| Photos | Optional on part requests: 3 images, 5 MB, allow-listed types, re-encoded with sharp, private storage | Parts buyers often only have a photo | Adds attack surface; toggleable in Settings |
| Schema management | Switch from dev `push` to migrations | Push already logged a failing statement on this project, and cannot manage extensions or custom indexes | One extra step when changing the schema |
| Testing | Vitest, Playwright, axe | Reproducible checks for the wizard, filters, search, compare and accessibility | Dev dependencies; Playwright downloads a Chromium build |

## Security model for enquiries
Same-origin and JSON-only requests, body size cap, one Zod schema shared by browser and server (unknown keys stripped, length caps), Turnstile token verified server-side (tokens are single-use), per-IP and per-email rate limits, honeypot, IP stored only as a salted hash, emails HTML-escaped with the buyer as Reply-To, photos re-encoded and stored privately, enquiries readable only by admin and sales, no personal data in logs, consent timestamp stored.

## Order of work
5a foundation (migrations, roles, spec attributes) → 5b search → 5c filters → 5d compare → 5e enquiries (schemas, endpoint, wizard, contact form, email, admin) → 5f QA (tests, accessibility, abuse-case tests, docs).

## Acceptance checks
Searching "ab 12345" finds part "AB-12345". Filters update counts and the URL, and survive reload. Compare refuses a second category. A tampered form still fails server validation. Rapid repeat submissions hit the rate limit. A filled honeypot is flagged, not emailed. An email failure still saves the enquiry. A disguised non-image upload is rejected. The wizard is completable by keyboard alone. Automated accessibility scan shows no violations on the new pages.

## Defaults used unless you say otherwise
Auto-reply email off. Photos on for part requests. Compare on for equipment and peripherals, off for parts. Zero-result search log on. Retention: nothing auto-deleted until you set a policy (legal advice recommended). Cloudflare test keys and console-logged email in development. Budget answer uses ranges with a currency choice and "prefer to discuss".

## Not in Phase 5
Bulk product import (Phase 6), Resources articles and legal pages (Phase 6 and legal review), buyer accounts, payments, live chat, multilingual interface, Meilisearch.

## Sources
- Turnstile server-side validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ (plans: https://developers.cloudflare.com/turnstile/plans)
- pg_trgm: https://www.postgresql.org/docs/current/pgtrgm.html
- ARIA combobox pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
- Quote-form advice (vendor sources, figures conflict, treat as direction only): https://orbitforms.ai/blog/quote-request-form-best-practices
