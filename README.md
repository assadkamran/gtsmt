# GTSMT website

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Payload CMS 3 (embedded) + PostgreSQL.
Independent project: own repo, database, CMS, env and assets.

## Run locally
```bash
npm install
npm run db:start      # project-local Postgres on port 5433 (data in .local/, git-ignored)
npm run dev           # http://localhost:3000   CMS: http://localhost:3000/admin
```
First visit to `/admin` creates the first admin user. Environment lives in `.env.local` (see `.env.example`); never commit it.

## Useful scripts
`npm run typecheck` · `npm run build` · `npm run generate:types` (after changing collections) · `npm run generate:importmap`

## Where things are
- `src/collections`, `src/globals`: CMS schema (products, categories, manufacturers, machine models, spec templates, solutions, industries, articles, documents, enquiries, site settings)
- `src/components`: header/mega-menu, footer, shared UI; `src/components/home`: homepage sections
- `src/lib/nav.ts`: single source for navigation and planned routes
- `src/app/(frontend)/globals.css`: design tokens (palette A, fonts, radii). Change colours only in the `@theme` block
- `docs/`: Phase 1 and 2 research, brand, sitemap, architecture

## Homepage photos
Upload images in the CMS (Media), then assign them in **Website Settings > Homepage images** using the slot codes
(H1, D1-D6, F1-F3, P1, I1-I8, R1). Product photos come from each product's gallery. Until a slot is filled a neutral placeholder is shown; no stock or invented images are used.

## Truthfulness rules built into the CMS
Part origin is required on every product; machine compatibility is public only when marked verified with a source; trust facts (years, certifications, locations, references) show only when entered.

## Content workflow
```bash
npm run seed:structure        # categories, solutions, industries with starter copy (idempotent, never overwrites edits)
npm run seed:samples          # DEV ONLY: labelled [SAMPLE] products so templates can be reviewed
npm run seed:samples:remove   # remove the samples again
```
Seeded pages are hidden from search engines until you tick **Reviewed** in the CMS. See `docs/06-phase4-templates.md`.

## Status
Foundation, homepage and the Phase 4 page templates are built (hubs, categories, products, brands, solutions, industries, About, Contact). Still to come: search, filters, comparison and the quote and enquiry forms (Phase 5), Resources articles and legal pages (Phase 6). Public enquiry submission is not wired yet (the Enquiries collection is locked to admins). Nothing is deployed.
