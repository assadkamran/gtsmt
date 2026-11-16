# GTSMT — Technical Architecture Recommendation

*Decision requested before Phase 3. Nothing is installed or deployed yet.*

## 1. What the architecture must actually do
1. **Large, structured catalogue** — potentially thousands of spare parts; typed specifications; brand × machine-model compatibility with verification status.
2. **Owner-editable** — non-developer adds products, specs, images, PDFs, articles, and reads enquiries.
3. **Fast, SEO-clean public pages** — server-rendered/static, great Core Web Vitals.
4. **Secure RFQ intake** — validated, spam-protected, stored, emailed.
5. **Independent** — own repo, DB, CMS, env, hosting.
6. **Language-ready** later.

## 2. Recommendation

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Server components ship little JS; ISR/static for catalogue pages; native metadata, sitemap, image APIs. |
| Styling | **Tailwind CSS** with design tokens from the brand doc | Fast to build a consistent system; tokens enforce palette. |
| CMS | **Payload CMS 3 (embedded in the same Next.js app)** | Code-defined collections give us the exact typed schema (specs, compatibility); admin UI for the owner; same repo/deploy; open-source, no per-seat fees; supports localization, drafts/versions, access control, and uploads. |
| Database | **PostgreSQL** | Relational integrity for product ↔ category ↔ manufacturer ↔ machine-model; native full-text search and `pg_trgm` for part-number fuzzy match; Payload supports it first-class. |
| Search | **Postgres FTS + trigram** at launch; **Meilisearch** later if the catalogue/latency demands | Avoids a second service on day one; clear upgrade path. |
| Media | **S3-compatible object storage (e.g. Cloudflare R2 or S3)**, served via CDN; Next image optimisation → AVIF/WebP | Keeps large files off the app server; cheap egress options. |
| Email | Transactional provider (e.g. Resend/Postmark) | Reliable RFQ notifications; SPF/DKIM/DMARC on gtsmt.com. |
| Spam | **Cloudflare Turnstile** + honeypot + server-side rate limiting | Privacy-friendlier than reCAPTCHA; no CAPTCHA puzzles for buyers. |
| Validation | **Zod** shared client/server | One schema, no drift. |
| Hosting | See §4 — decision for you | |
| Tests/QA | Playwright (e2e + a11y via axe), Lighthouse CI, tsc/eslint in CI | Maps to Phase 7 gates. |

## 3. Why not the alternatives (honest trade-offs)

| Option | Strength | Why not first choice here |
|---|---|---|
| **Sanity / Contentful (SaaS headless)** | Excellent editor UX, no CMS hosting | Per-seat/usage pricing grows with traffic and content; content lives with a vendor; querying relational compatibility is awkward; weakest "own database" fit for the independence requirement. |
| **Strapi** | Mature, plugin ecosystem | Separate service to deploy/secure; TypeScript-first modelling and draft/preview are less smooth; two apps instead of one. |
| **Directus** | Wraps any SQL DB, great for data-heavy catalogues | Strong contender for a *pure* catalogue; weaker as a page/article/layout CMS and less natural inside Next.js. |
| **WordPress + WooCommerce** | Cheap, familiar | Plugin sprawl, security upkeep, difficult to deliver the typed-spec/compatibility model and the Core Web Vitals bar without heavy custom work. |
| **Shopify** | Great commerce | This is **RFQ, not checkout**; Shopify's model adds cost and fights the spec/compatibility structure. |
| **Medusa / Saleor** | Real commerce | Out of scope — no cart/payments are requested. Reconsider only if online ordering is ever added. |

**Real risks of my pick (so you can decide with eyes open):**
- Payload 3 is newer than WordPress/Strapi; fewer off-the-shelf plugins, smaller talent pool. Mitigation: it is plain TypeScript + Postgres, so there is no proprietary lock-in; data is SQL you own.
- The CMS and site scale together (one Node app). For a B2B catalogue that is normal; if the admin ever needs isolating, it can be split.
- Self-managed DB means backups/upgrades are our responsibility (use a managed Postgres to offload this).

## 4. Hosting — two viable paths (owner's call)

| | **A. Managed PaaS** (e.g. Vercel + managed Postgres + R2) | **B. Single VPS / container host** (e.g. Hetzner, DigitalOcean, Fly.io, Railway + Postgres) |
|---|---|---|
| Ops effort | Low — git push deploys, previews | Medium — you/we manage OS, Docker, TLS, backups |
| Cost shape | Usage-based; can rise with traffic/bandwidth and function time | Fixed monthly; predictable |
| Global speed | Edge CDN built in | Add Cloudflare in front |
| Lock-in | Moderate (platform features) | Low |
| Fit | Best for fastest, safest launch | Best for cost control / data location |

I have **not** quoted prices: current pricing changes and I haven't checked it. **My recommendation: Path A for launch** (lowest operational risk for a non-technical owner), with Cloudflare DNS/CDN and a daily DB backup. Everything is containerisable, so moving to Path B later is routine.

*Independence guarantee:* new GitHub repo, new managed Postgres project, new storage bucket, new domain DNS entries, new secrets — nothing shared with any other project. Deploy only on your explicit approval.

## 5. Data model (CMS collections)

```
Manufacturers      name, slug, logo, website, notes, isOEM(bool)
MachineModels      manufacturer→, name, machineType, slug, notes
Categories         name, slug, division(equipment|parts|peripherals), parent→, description,
                   seo, specTemplate→, image
SpecTemplates      name, attributes[ {key,label,type(number|text|enum|bool|range),unit,enumValues,filterable} ]
Products           title, slug, sku/partNumber, altPartNumbers[], category→, manufacturer→,
                   partOrigin(enum: genuine-oem | oem-surplus | compatible-aftermarket | new-machine | used-refurbished),
                   condition, shortIntro, richDescription, features[], applications[],
                   specs[ {attributeKey, value, unit} ]   // validated against category SpecTemplate
                   compatibility[ {machineModel→, verified(bool), source(text), note} ]  // public only if verified
                   gallery[media], documents[→ProductDocuments], accessories[→Products], related[→Products],
                   quoteOnly(bool, default true), status(draft|published), seo, _versions
ProductDocuments   title, file(pdf), type(datasheet|manual|brochure|cert), language, product→
Solutions          title, slug, summary, lineSequence[ {station, categoryRef, optional, note} ], configurations[], faqs[], seo
Industries         title, slug, intro, relevantSolutions[], relevantCategories[], seo
Articles           title, slug, author, topic, body(rich), faqs[], related[], publishedAt, seo
Enquiries          type(rfq|line-wizard|contact|part-request), status(new|in-progress|quoted|closed|spam),
                   contact{name,company,email,phone,country}, payload(json, validated),
                   productRefs[], consent{privacy,ts}, source{page,utm,referrer}, ipHash, notes
SiteSettings       (global) company legal name, address, emails, phones, logo, socials, certifications[],
                   aboutFacts[], trust blocks (all optional & hidden when empty), nav config, analytics ids
```
Key design decisions:
- **Specs are data, not blobs.** Because attributes come from the category's SpecTemplate, they render as tables, drive filters, power comparison, and emit Product schema — with zero hard-coded fields.
- **Truthfulness enforced in the schema:** `compatibility[].verified` + `source` are required to show; `partOrigin` is required to publish; empty owner-supplied trust fields render nothing.
- **Enquiries are not public**, are access-controlled to admins, and store only what's needed (data-minimisation; retention period to be set by the owner/legal).

## 6. Rendering & performance strategy
- Static/ISR for hubs, categories, products, articles (revalidate on publish via CMS hook); dynamic only for search, compare, forms.
- Client JS islands only for: mega-menu, filters, gallery, compare tray, wizard. Everything else is server components.
- Images: AVIF/WebP, explicit dimensions, `priority` only for hero; LCP target ≤ 2.5s p75, CLS < 0.1, INP < 200ms.
- Fonts self-hosted, `display: swap`, subset.
- No third-party tag manager at launch; privacy-light analytics (e.g. Plausible/GA4 — owner's choice).

## 7. Security
- Forms: Zod validation, Turnstile, honeypot, per-IP rate limit, body size cap, output-escaped emails, CSRF-safe POST handlers.
- Secrets only in env vars (`.env.local` git-ignored; `.env.example` committed); separate dev/staging/prod.
- Security headers: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- Admin: strong auth, role separation (Admin / Editor / Sales), optional 2FA, admin path not indexed.
- Uploads: type/size allow-list; PDFs only for documents.
- Backups: daily DB + weekly restore test (process, not just config).
- GDPR/consent: cookie banner only if non-essential cookies are used; privacy policy needs owner/legal text.

## 8. i18n readiness
Locale-prefixed routing (`/en/...`) via `next-intl`; Payload field-level localization enabled on content fields from day one (cheap now, painful later); `hreflang` generation built into the metadata helper; UI strings in message files. English-only at launch.

## 9. Delivery phases (revised from brief)
3 Foundation → 4 Design/templates → 5 Interactivity (search/filter/compare/RFQ/wizard) → 6 Content & SEO → 7 QA. **Content volume (real products/photos) is the critical-path risk**, not code.

## 10. Decisions I need from you
1. Approve **Next.js + Payload + Postgres**? (or prefer another)
2. Hosting **Path A or B**?
3. Do you have a **logo, photography, company facts, and brand list**? If not, the build uses clearly-marked placeholders and seed data labelled *SAMPLE — NOT REAL*.
4. Are parts **genuine OEM, surplus, or compatible aftermarket**? (changes copy and legal wording)
5. Quote-only catalogue (my assumption) or any public pricing?
