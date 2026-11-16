# Phase 4: page templates (as built)

Built 2026-11-15 from the approved designs. Everything below is CMS-driven except the generic copy noted under "Starter copy".

## Template map

| Template | Routes | Source in code |
|---|---|---|
| Hubs | `/smt-solutions`, `/smt-equipment`, `/spare-parts`, `/smt-peripherals`, `/industries` | `components/solutions/*Views.tsx`, `components/catalogue/Hubs.tsx` |
| Category page | `/smt-equipment/<cat>`, `/smt-peripherals/<cat>`, `/spare-parts/<cat>` and `/spare-parts/feeders/<sub>` | `components/catalogue/CategoryView.tsx` |
| Product page | `<category url>/<product-slug>` | `components/catalogue/ProductView.tsx` |
| Pagination | `<category url>/page/<n>` (12 per page, `n` from 2) | `lib/catalogue.ts` (`parseSegments`) |
| Brand and model pages | `/spare-parts/brands`, `/brands/<brand>`, `/brands/<brand>/<model>` | `components/catalogue/BrandViews.tsx` |
| Solution page | `/smt-solutions/<slug>` | `components/solutions/SolutionViews.tsx` |
| Industry page | `/industries/<slug>` | `components/solutions/IndustryViews.tsx` |
| About, Contact | `/about-us`, `/contact` | `app/(frontend)/about-us`, `contact` |

URL resolution for the three catalogue divisions lives in one place (`components/catalogue/route.tsx`). Pages are statically generated, refresh hourly, and refresh immediately when content is published in the CMS. New products appear without a rebuild.

## Owner workflow

1. **Reviewing copy.** Seeded categories, solutions and industries have `reviewed = false`. They render but stay `noindex` and out of the sitemap. Tick **Reviewed** once the copy is checked.
2. **Thin pages.** A category with no products and no description is `noindex` even when reviewed.
3. **Adding a product.** Choose a category, set the **origin** (required), add specs, images and documents. Compatibility only appears publicly when marked **Verified** with a source.
4. **Brand pages.** Tick "Show as brand hub" on a manufacturer. Use its SEO group to set `noindex`.
5. **Featured homepage items.** Tick **Featured** on up to four products.

## Indexing rules (single source: `lib/catalogue.ts`)

- Product pages: indexable unless the product's SEO group says `noindex`. Drafts are never public.
- Categories: reviewed AND (has published products OR has a description).
- Solutions and industries: reviewed AND not `noindex`.
- Brand pages: has products AND not `noindex`. The brand index is indexable only if at least one brand is.
- About and Contact: indexable only once real company or contact details exist in Website Settings.
- Sitemap lists exactly the indexable pages. Pages still "in preparation" are `noindex` and excluded.

## Starter copy

`scripts/data/structure.ts` holds the starter descriptions. They are generic technical explanations of what each piece of equipment does. They make no claim about GTSMT's services, capacity, certifications, stock or shipping. Review before ticking **Reviewed**. The part-origin definitions on the spare-parts hub are drafts too.

## Dev-only sample data

`npm run seed:samples` adds clearly labelled `[SAMPLE]` products (placeholder values, `noindex`) so templates can be reviewed. `npm run seed:samples:remove` deletes them. Both refuse to run in production.

## Deliberately not in Phase 4

- Search, filters, sort, comparison, quote forms, the line-enquiry wizard, the contact form (Phase 5). Quote buttons already carry `need`, `product`, `part` and `topic` in the URL for the form to read.
- Resources articles, privacy and terms pages (Phase 6 and legal review). These still show "in preparation" pages.
- A map on the Contact page (needs a provider and privacy decision).

## Known limitations

- Mega-menus read `lib/nav.ts`. A category added in the CMS appears on hub pages and in the category rail immediately, but not in the mega-menu until `nav.ts` is updated.
- Product counts load up to 10,000 products in one query. Revisit if the catalogue grows beyond that.
- Dev mode syncs the database schema automatically (`push`). Create proper migrations before the first deployment.
