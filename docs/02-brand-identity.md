# GTSMT — Phase 2: Brand Identity & Visual Direction

## 1. Positioning
**One line:** *Integrated SMT lines, feeders and spare parts for electronics manufacturers worldwide.*
**Personality:** precise, calm, technical, plain-spoken. Engineering confidence without hype. No superlatives we cannot prove.
**Voice rules:** short declarative sentences; specify rather than boast; never claim years, certifications, stock, delivery times or customers unless supplied by the owner.

## 2. Colour system: Palette A, "Ink and electric blue" (chosen 2026-11-15)

Replaces the brief's original navy and cyan scheme, which the owner disliked. Four alternatives (A to D) and four greens were previewed; the owner chose **A**. All values below are live in `src/app/(frontend)/globals.css` (`@theme` block) under palette-neutral token names, so a future recolour touches that one block.

| Token | Hex | Role | Verified contrast |
|---|---|---|---|
| `dark-900` | `#0B1124` | Primary dark: hero, dark sections, mega-menu feature cards | White on it: 18.75 |
| `dark-950` | `#070B16` | Footer | |
| `dark-800` / `dark-700` / `dark-600` | `#121B38` / `#1B2850` / `#2D3C6B` | Panels, placeholders, hairlines on dark | |
| `accent` | `#2F5BF0` | Fills: buttons, active states, rules, logo mark | **White text on it: 5.42** |
| `accent-hover` | `#2347D1` | Button hover | White on it: 7.26 |
| `accent-text` | `#2347D1` | Accent text and links on light | On white 7.26 · surface 6.71 · tint 6.21 |
| `accent-on-dark` | `#86A4FF` | Accent text on dark (eyebrows, footer links) | On dark-900 7.83 · dark-950 8.21 |
| `accent-tint` | `#E7EDFF` | Pill and selected-card backgrounds | |
| `surface` | `#F4F6FB` | Alternate section background | |
| `ink` | `#131A2C` | Body text | On white 17.33 |
| `muted` | `#566079` | Secondary text | On white 6.28 · surface 5.81 |
| `line` | `#DAE0EC` | Hairlines, borders | decorative |
| `on-dark` / `on-dark-muted` | `#C6CEE3` / `#98A3C0` | Body and secondary text on dark | 11.9 / 7.4 on dark-900 |

Why two accent text tones: a mid-tone blue cannot be both a button fill that carries legible text and legible small text on near-black, so text on dark uses the lighter `accent-on-dark`.

**Button rule:** primary = `accent` fill with **white** text. Secondary on light = dark outline; on dark = white outline.
**Usage ratio:** roughly 60% white and surface, 30% dark, under 10% accent. Accent is never used as a large flat area.
**Verification:** an automated per-element audit (text colour against real background) of the homepage, all three mega-menus, the mobile drawer and an "in preparation" page found zero AA failures (about 390 text elements). An external tool such as axe has not yet been run.

## 3. Typography
- **Manrope** for headings (geometric, distinctive, engineered feel at 600–800).
- **Inter** for body, UI, tables (superb at small sizes, tabular numerals for specs).
- Both are open-source (SIL OFL) and variable → one file each, self-hosted via `next/font` (no third-party request, good for CLS and privacy).
- Scale (desktop / mobile): H1 56/36 · H2 40/28 · H3 28/22 · H4 20/18 · body 17/16 · small 14. Line-height 1.15 headings, 1.6 body. `font-variant-numeric: tabular-nums` in spec tables.
- Measure: body ≤ 70ch.

## 4. Layout & spacing
- 12-col grid, container max 1280px, gutters 24px (16px mobile).
- 8px base unit; section padding 96px desktop / 56px mobile.
- Radius: 6px controls, 10px cards (restrained; industrial, not playful).
- Elevation: 1px hairlines first, soft shadow only on hover/raised overlays.
- Motion: 150–250ms ease-out; fade/translate-up on reveal; no parallax; everything honours `prefers-reduced-motion`.

## 5. Logo direction (wordmark only — no logo supplied)
No GTSMT logo was provided. Proposal: a **typographic wordmark** in Manrope ExtraBold, tight tracking, with a small accent-blue mark derived from a **component-pad / solder-land motif** (rounded rectangle pair) — evokes an SMT footprint without cliché gears or circuit-board clip-art. **Placeholder only** until the owner confirms or supplies a logo; the CMS exposes a `logo` field in Website Settings.

## 6. Imagery — critical, and a risk
Brief asks for real industrial photography. **I have none and will not fabricate or hot-link competitor images** (copyright + trust). Options, in order of preference:
1. **Owner-supplied** photos of actual stock/machines/warehouse (best for trust; also the only way to avoid implying capabilities).
2. **Commissioned** studio/factory photography.
3. **Licensed stock** (royalty-free licence checked; clearly generic — never captioned as GTSMT's own facility).
4. **Manufacturer press images** only with written permission.
Until then the build uses clearly marked **photo slots** with a neutral dark-blue blueprint-style placeholder, plus **custom SVG line diagrams** (original artwork I can produce now).

## 7. Iconography & graphic language
- Single icon set, 1.5px stroke, square-ish terminals (Lucide or Phosphor "regular") coloured dark; accent blue only for active state.
- Signature graphic: **the SMT line strip** — a horizontal sequence of stations (Loader → Printer → SPI → Placer → Reflow → AOI → Unloader) used as hero art, section divider and navigation aid. It is on-brand, informative and ownable.
- Subtle 8px dot-grid / fine blueprint lines on dark sections at ≤6% opacity.

## 8. Component feel
- **Product card:** white, hairline border, 4:3 image on surface bg, category tag, title, 2 key specs (from CMS), "Request quote" + "Compare" on hover/focus; whole card is one link.
- **Mega-menu:** two-level — left rail of divisions, right panel with sub-categories, a featured item and a persistent "Request a Quote" strip. Keyboard operable, closes on Esc, no hover-only access.
- **Spec table:** zebra on `surface`, label column 35%, units in muted; collapses to stacked list < 640px.
- **RFQ:** slide-over panel from any product (pre-filled), full multi-step wizard on `/request-a-quote`.

## 9. Accessibility commitments
WCAG 2.2 AA target: contrast per table above, visible focus ring (2px `accent-on-dark` on dark, 2px `accent-text` on light, 2px offset), 44px touch targets, semantic landmarks, skip link, reduced-motion support, form labels/errors programmatically associated.

## 10. Items needing the owner
Logo · legal company name & registered address · contact emails/phones/WhatsApp · real photography · the brands you actually distribute (affects what we may name) · whether parts are genuine OEM, surplus, or compatible aftermarket.
