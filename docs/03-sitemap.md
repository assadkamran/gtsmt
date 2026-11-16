# GTSMT — Sitemap & URL Architecture

> **Status (Phase 4):** hubs, solution, industry, category, product, brand, About and Contact pages are built and CMS-driven. Still "in preparation": `/request-a-quote`, `/compare`, all `/resources` pages, `/privacy-policy`, `/terms`. Pagination uses `/page/<n>` suffixes. See [06-phase4-templates.md](06-phase4-templates.md).

URL principles: lowercase, hyphenated, ≤3 levels, no IDs in URLs, locale-ready (`/en/...` default; `en` may be omitted until a second language ships — see architecture doc). One canonical URL per page; filters never create indexable URLs except curated brand/model hubs.

## Primary navigation (as specified)
`HOME · SMT SOLUTIONS · SMT EQUIPMENT · SPARE PARTS · SMT PERIPHERALS · INDUSTRIES · RESOURCES · ABOUT US · CONTACT / REQUEST A QUOTE`

```
/                                         Home
/smt-solutions                            Solutions hub (interactive line diagram)
  /complete-smt-production-lines
  /turnkey-pcb-assembly-lines
  /led-smt-production-lines
  /high-speed-smt-production-lines
  /flexible-smt-production-lines
  /smt-factory-setup
  /customized-smt-solutions
/smt-equipment                            Equipment hub (in process order)
  /pick-and-place-machines
  /solder-paste-printers
  /reflow-soldering-ovens
  /wave-soldering-machines
  /aoi-automated-optical-inspection
  /spi-solder-paste-inspection
  /pcb-loaders
  /pcb-unloaders
  /pcb-conveyors
  /pcb-depaneling-machines
  /pcb-cleaning-equipment
  /pcb-storage-and-buffer-systems
  /other-smt-equipment
  /{category}/{product-slug}              Product detail
/spare-parts                              Spare-parts hub + global part-number search
  /feeders/tape-feeders | electric-feeders | pneumatic-feeders | tray-feeders | stick-feeders | feeder-carts | feeder-accessories
  /nozzles  /motors  /belts  /sensors  /valves  /filters  /cameras  /electronic-boards  /cables  /other-replacement-components
  /brands/{manufacturer}                  Curated brand hub (indexable)
  /brands/{manufacturer}/{machine-model}  Curated model hub (indexable)
  /{category}/{product-slug}              Product detail
/smt-peripherals                          Peripherals hub
  /magazine-loaders | magazine-unloaders | pcb-conveyors | inspection-conveyors
  /ng-ok-buffer-systems | pcb-turn-conveyors | pcb-lift-conveyors
  /esd-equipment | production-line-accessories | other-factory-peripherals
/industries
  /automotive-electronics | consumer-electronics | led-manufacturing | medical-electronics
  /industrial-electronics | power-electronics | telecommunications | ems-and-contract-manufacturing
/resources                                Knowledge centre (articles, guides, downloads)
  /{article-slug}
  /category/{topic}
  /downloads                              Datasheets & documents (gated: none by default)
/about-us                                 Company (owner-supplied facts only)
/contact                                  Contact details + map slot
/request-a-quote                          Multi-step RFQ / SMT line enquiry wizard
/compare?items=a,b,c                      Comparison (noindex)
/search?q=                                Site search (noindex)
/privacy-policy  /terms  /cookie-policy   Legal (owner/legal review)
/sitemap.xml  /robots.txt  /llms.txt?     (llms.txt optional, decide later)
```

## Mega-menu content map
- **SMT Solutions:** 7 solutions + "Line planner" feature card (→ wizard).
- **SMT Equipment:** grouped by line stage — *Print & Inspect* (printer, SPI) · *Place* (pick & place) · *Solder* (reflow, wave) · *Inspect & Handle* (AOI, loaders, unloaders, conveyors, buffers) · *Finish* (depaneling, cleaning, other).
- **Spare Parts:** *Shop by brand* (dynamic from CMS) · *Feeders* · *Machine parts* · part-number search field inside the menu.
- **SMT Peripherals / Industries / Resources:** simple two-column lists + featured link.
- **Persistent:** utility bar (language placeholder, email/phone from CMS), search icon, "Request a Quote" accent button.

## Template inventory (reuse drives cost down)
1. Home · 2. Hub (Solutions/Equipment/Parts/Peripherals) · 3. Category listing (filters+grid) · 4. Product detail · 5. Solution landing · 6. Industry page · 7. Brand/Model hub · 8. Article · 9. Resources index · 10. About · 11. Contact · 12. RFQ wizard · 13. Comparison · 14. Search results · 15. Legal/generic · 16. 404/500.

## Internal-linking rules
Solution ⇄ equipment categories it uses · Industry → relevant solutions/equipment · Article → related products + RFQ · Product → compatible machine hub + related products + parent category · Every page ≤3 clicks from Home.

## Structured data per template
Organization (site-wide) · BreadcrumbList (all) · Product (detail; **no price/availability/review markup unless real**) · Article · FAQPage (where genuine FAQ present) · WebSite + SearchAction.
