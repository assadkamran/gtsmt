# GTSMT — Homepage Design Proposal

Superseded early mockup (uses the retired navy and cyan colours; the live app is the source of truth): [homepage-proposal.html](homepage-proposal.html) (open in any browser; mega-menu and the production-line explorer are live). It is a **design proposal, not the build** — no framework, no CMS, placeholder content only.

## Section-by-section rationale

| # | Section | Purpose | Key decisions |
|---|---|---|---|
| — | Utility bar + sticky header | Trust + access | Contact details from CMS (placeholders now). Persistent accent-blue **Request a Quote**. Three mega-menus (Solutions / Equipment / Spare Parts); other items are plain links. |
| 1 | **Hero** | Explain the business in 5 seconds | Brief's headline and supporting text verbatim. Dark ink-blue with faint dot-grid. The **SMT line strip** (Loader→Printer→SPI→Pick&Place→Reflow→AOI→Unloader) sits at the base as the signature graphic. Primary CTA "Explore SMT Solutions", secondary "Request a Quote". Hero photo slot reserved. |
| 2 | **Six divisions** | Orient by business unit | Cards for Lines, Equipment, Feeders, Spare Parts, Peripherals, Factory Setup (the brief's six divisions). Line icons, no stock clip-art. |
| 3 | **Production-line explorer** | Differentiate; teach; convert | Select a station → role in the line + link to the category. This is the "interactive production-line diagram" in the brief. Stage descriptions are generic process facts only. |
| 4 | **Featured equipment** | Product proof | 4 CMS-driven cards. Photo + category tag + two key specs. **Placeholders only until real products exist.** |
| 5 | **Feeders & spare parts** | Capture the high-intent maintenance buyer | Brand → model → part-number search at the top; category chips; "send us the part" fallback; three trust points that are *site behaviours we can guarantee* (origin stated, compatibility verified, quote by part number). |
| 6 | **Peripherals** | Complete the offer | 4 cards. |
| 7 | **Industries** | Relevance | 8 links from the brief. |
| 8 | **Why GTSMT** | Trust | Written as **site/commercial behaviours**, not claims. A dashed owner-supplied slot shows where certifications, years, locations and references appear **only when entered**. |
| 9 | **Resources** | Authority + SEO | 4 headline articles from the brief's list. |
| 10 | **RFQ** | Convert | Start of the multi-step wizard inline (step 1 of 4: *what do you need?*), leading to the full wizard. |
| 11 | **Footer** | Transparency | Legal name/address/contact placeholders, nominative-use brand disclaimer. |

## UX principles applied
- **Two buyers, two doors:** project buyer → line explorer/wizard; maintenance buyer → parts search.
- **RFQ reachable from every screen** without scrolling (sticky header CTA; slide-over on product pages in the build).
- **Process order** as the organising idea throughout.
- **Mobile:** collapses to a single column, header becomes a menu button (the mockup's mobile menu is a stub — full drawer navigation is Phase 4), filters become a drawer, spec tables stack.
- **Motion:** only reveal-on-scroll and card lift, disabled under `prefers-reduced-motion`.

## Known limitations of the mockup (be aware)
- **No photography.** Dashed/dot-grid blocks are placeholders. Final visual quality depends heavily on real or licensed images (see brand doc §6).
- **Verified:** loads without console errors; no horizontal overflow at 1440px; mega-menu opens/closes; line explorer updates; renders in a ~270px-wide mobile view. **Not verified:** pixel-level desktop appearance (my preview was too small to judge fine detail), real-device mobile, cross-browser, keyboard walkthrough, screen reader.
- Fonts load from Google Fonts **in the mockup only**; the build self-hosts them.
- The mobile "Menu" button is non-functional in the mockup.
- Copy is draft; all `[bracketed]` values are owner-supplied placeholders.
