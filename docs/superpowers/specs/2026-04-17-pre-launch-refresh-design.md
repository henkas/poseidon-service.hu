# Pre-launch refresh — design spec

Date: 2026-04-17
Branch: `pre-launch-copy-refresh`
Locale scope: English version is the structural source of truth. Hungarian copy is adapted in a later pass once the English structure is approved. Data-shape changes land in both locale blocks now; new English strings without a Hungarian counterpart get a clearly-marked TODO placeholder in the `hu` block.

## Goals

Ship a homepage that the business owner signs off on, with the structural, content, performance, and SEO foundations in place for a production launch. Keyword-targeted copy and deeper SEO work is deliberately punted to a later session.

## Out of scope (next session)

- Keyword-targeted title/description rewrites in both locales
- Long-form content expansion / per-service landing pages
- Link building / off-page SEO
- Full Hungarian copy adaptation (only data-shape and placeholder TODOs in this round)

## Section-level changes

Homepage goes from 8 sections to 7. The Pricing section is absorbed into Contact. The keyword-based Trust Strip is replaced by a curated logo strip.

### New section order

1. Hero
2. **Logo Strip** (new — replaces Trust Strip)
3. Services
4. About
5. References (restructured)
6. Partner (TOP-CLEAN 87' Kft.)
7. Contact (absorbs pricing reassurance)

Partner and Contact are unchanged structurally; Contact picks up one new line.

### 1. Hero

Copy unchanged. Only change: side image `image05.jpg` → `image07.jpg` in `heroImages.side` for both locales. `image07.jpg` is 1140×1139 — a near-identical drop-in replacement for the existing 1140×1140 slot, so `object-fit: cover` behavior is preserved.

Additional perf work on this section:

- Main hero image (`image11.jpg`) becomes LCP candidate. Preload it: `<link rel="preload" as="image" href="/images/image11.jpg">` in `<head>` (conditionally on the home route, not on other pages if any are added later).
- All three hero images migrate from raw `<img>` to Astro's `<Image>` component, producing WebP sources and responsive `srcset`. Width/height attributes are emitted automatically.

### 2. Logo Strip (new)

Replaces the current `TrustStrip.astro` keyword-word strip. The section becomes a curated wall of 8 client logos.

- Component file: rename `TrustStrip.astro` → `LogoStrip.astro`. Update the import in `HomePage.astro`.
- Data file: new `src/data/logos.ts` modeled on `3p-kemeny.hu/src/data/logos.ts`. Uses the Brandfetch CDN (`https://cdn.brandfetch.io/domain/<domain>?c=<CLIENT_ID>`) for brands that have logos in the catalog; falls back to local PNGs in `/public/images/logos/` for brands that don't. Client ID is stored in the file.
- Included brands (in this order): Medicover, Strabag, DHL, McDonald's, Thyssenkrupp, Axiál, Eurings, Novochem.
- Styling: grayscale default (`filter: grayscale(1); opacity: 0.7`) → color on hover/focus (`filter: none; opacity: 1`). Transition ~200 ms.
- `content.trustStrip` block is removed from `site.ts` for both locales. The logo strip has no translatable text — the kicker (e.g., "Trusted by" / "Megbízóink köre") is hard-coded or moved to a new `content.logoStrip.kicker` string if we want to keep a label. Decision: keep a short kicker, field name `logoStrip.kicker` (HU: "Megbízóink köre", EN: "Trusted by"). No other copy.

### 3. Services

Unchanged. Data, component, and styling preserved.

### 4. About

Unchanged.

### 5. References

Structural changes:

1. **Two groups merged into one.** Today's `references.groups` has two cards (recurring/periodic + machine floor scrubbing). These merge into a single list.
2. **Client swaps:** remove `Skála ruházati áruház` and `Loxon Solutions Zrt.`; add `Thyssenkrupp Zrt.` and `Plan-Épszer Kft.` Flooring-group clients (`Diósgyőri kórház`, `Egyházi rendezvénycsarnok`, `Eurings Zrt. Szerszámregeneráló üzem`) are folded into the merged list.
3. **Per-locale strings.** Current `sharedReferences` constant pushes Hungarian words (`klinika`, `kórház`, `éttermek`, `Fürdőszoba Szalon`, `Szerszámregeneráló üzem`) into the English page. The data structure changes so references are declared per-locale:

   ```ts
   references: {
     kicker: string;
     title: string;
     intro: string;
     clients: string[];  // single flat list, was `groups: ReferenceGroup[]`
   }
   ```

   Hungarian list keeps original wording. English list translates the non-company-name suffixes:

   | Hungarian | English |
   |---|---|
   | Medicover klinika | Medicover clinic |
   | DHL Express Logisztikai Központ | DHL Express logistics hub |
   | Laguna Lux Fürdőszoba Szalon | Laguna Lux bathroom showroom |
   | McDonald's éttermek | McDonald's restaurants |
   | Diósgyőri kórház | Diósgyőri hospital |
   | Egyházi rendezvénycsarnok | Ecclesiastical event hall |
   | Eurings Zrt. Szerszámregeneráló üzem | Eurings Zrt. tool regeneration plant |

   Company legal suffixes (`Zrt.`, `Kft.`) stay as-is in both locales — they are part of the registered company name.

4. **Component:** `ReferencesSection.astro` simplifies from two-card layout to a single list/grid. Either a clean two-column name list or a wrapped tag-cloud style — implementation detail left to plan stage, but the visual must not rely on a per-group card grouping.

Final English list (15 entries — Eurings appears twice because the two engagements are distinct; plan stage decides whether to deduplicate):

Axiál Kft. · Diósgyőri hospital · DHL Express logistics hub · Ecclesiastical event hall · Eurings Zrt. · Eurings Zrt. tool regeneration plant · Laguna Lux bathroom showroom · McDonald's restaurants · Medicover clinic · Mitor Kft. · Novochem Kft. · Plan-Épszer Kft. · Strabag Zrt. · Techszerviz Kft. · Thyssenkrupp Zrt.

Display order (alphabetical vs. original) is a plan-stage decision.

### 6. Partner

Unchanged.

### 7. Contact (absorbs pricing reassurance)

The Pricing section is removed entirely. Its promise ("transparent pricing, contact us for a quote") moves into the Contact section as an additional intro line.

- `PricingSection.astro` is deleted.
- `pricing` block in `site.ts` is removed from both locales (both `hu` and `en`).
- Navigation: the `#arak` / `#pricing` nav item is removed from both `content.nav` arrays.
- Contact gets one new field: `contact.pricingNote` (a short sentence). Example EN: *"Transparent pricing based on a free on-site survey — reach out by phone or email and we typically reply within 24 hours on weekdays."* Hungarian value gets a TODO placeholder. Rendered inside `ContactSection.astro` below `contact.intro`.

## Performance foundations

### Self-host fonts

- Add `@fontsource/manrope` and `@fontsource/fraunces` to `dependencies` in `package.json`.
- Import the specific weights used (Manrope 400/500/600/700/800; Fraunces 600/700 with `opsz` — `@fontsource-variable/fraunces` is the variable-font package and is preferred over the static one because of the optical-size axis).
- Remove the `@import url("https://fonts.googleapis.com/…")` line from `BaseLayout.astro`'s `<style is:global>` block.
- Imports go inside the `<style is:global>` so Astro bundles them into the CSS output (or in a shared CSS entry file — plan-stage decision).

### Eliminate image blur

The `backdrop-filter: blur(16px)` rule at `global.css:116-127` applies to `.hero-main-image`, `.hero-side-grid img`, and every card surface. Remove from this selector list; keep the rule only if there's a surface where blur is genuinely the design intent (likely none — verify in plan stage). Rationale: backdrop-filter on scrolling image surfaces is the primary compositor cost on this page.

### Optimize images

- Migrate `<img>` usages in `HeroSection.astro`, `LogoStrip.astro` (new), and `ReferencesSection.astro` (if it ever gains images) to Astro's `<Image>` component from `astro:assets`.
- Source images move from `/public/images/` to `/src/assets/images/` so they participate in the asset pipeline. Original filenames preserved.
- Output format: WebP with JPEG fallback (Astro default behavior). Set explicit `width` + `height` per usage to avoid CLS.
- Brandfetch-sourced logos stay as remote URLs — they're already CDN-optimized. Add the Brandfetch domain to Astro's `image.domains` config so `<Image>` can proxy if needed; otherwise use plain `<img>` with `loading="lazy"` and explicit dimensions for those.

### Preload hero LCP image

In `BaseLayout.astro` (or a route-scoped head block), add `<link rel="preload" as="image" href={heroImageUrl} fetchpriority="high">`. The URL is the processed output from `astro:assets`, so this preload tag needs access to the image metadata — easiest is to compute it inside `HomePage.astro` and pass up via a slot or to inline it in the layout using the imported asset URL.

## SEO foundations

### Sitemap

- Install `@astrojs/sitemap`.
- Add the integration to `astro.config.mjs` with `site: "https://poseidon-service.hu"` and an `i18n` config declaring `hu` (default) and `en` locales so the generated sitemap includes hreflang alternates.
- Verify `dist/` build produces `sitemap-index.xml` and `sitemap-0.xml`.

### JSON-LD structured data

Add a `LocalBusiness` (subtype `CleaningService` if the schema vocabulary supports it cleanly; otherwise plain `LocalBusiness`) JSON-LD block in `<head>`, per locale.

Fields (values cross-checked against `site.ts`):

- `@context`: `"https://schema.org"`
- `@type`: `"CleaningService"` (with fallback to `LocalBusiness` if validators complain)
- `name`: "Poseidon Service Kft."
- `url`: per-locale canonical URL
- `address`: PostalAddress with `streetAddress: "Berettyó utca 10/1"`, `postalCode: "4034"`, `addressLocality: "Debrecen"`, `addressCountry: "HU"`
- `telephone`: both managing directors' numbers (array)
- `areaServed`: `{ "@type": "Country", "name": "Hungary" }`
- `sameAs`: Facebook URL (needs to be looked up — plan-stage TODO)
- `inLanguage`: `"hu"` or `"en"` per locale

Rendered as a `<script type="application/ld+json">` tag. Implement as a helper in `src/lib/` that takes locale + content and returns the JSON object, inlined in `BaseLayout.astro`.

### Social meta

Add to `<head>`:

- `<meta name="twitter:card" content="summary_large_image">`
- `<meta name="twitter:title" content={title}>`
- `<meta name="twitter:description" content={description}>`
- `<meta name="twitter:image" content={new URL('/og-image.jpg', siteOrigin)}>`
- `<meta property="og:image" content={new URL('/og-image.jpg', siteOrigin)}>`
- `<meta property="og:image:width" content="1200">`
- `<meta property="og:image:height" content="630">`

Asset: `/public/og-image.jpg` needs to exist at 1200×630. Flag as TODO in the implementation plan — a placeholder built from an existing photo + logo overlay is fine for launch; proper brand artwork can replace it later.

### Preconnect hints (only if we keep remote resources)

With self-hosted fonts, no preconnect to `fonts.googleapis.com` or `fonts.gstatic.com` is needed. Brandfetch CDN gets a preconnect hint:

```html
<link rel="preconnect" href="https://cdn.brandfetch.io" crossorigin>
```

## Files touched

**New:**
- `src/data/logos.ts` — curated logo list with Brandfetch URLs + local fallbacks
- `src/lib/structured-data.ts` — JSON-LD builder helper
- `src/components/home/LogoStrip.astro` — renamed from `TrustStrip.astro`, rewritten for logos
- `src/assets/images/` (directory) — migration target for homepage images
- `public/images/logos/` (directory) — local fallback logos (may stay empty if all 8 brands resolve via Brandfetch)
- `public/og-image.jpg` — 1200×630 placeholder (TODO: replace with branded artwork)

**Modified:**
- `package.json` — add `@fontsource/manrope`, `@fontsource-variable/fraunces`, `@astrojs/sitemap`
- `astro.config.mjs` — register sitemap integration with i18n config
- `src/data/site.ts` — remove `trustStrip` + `pricing` blocks, add `logoStrip`, restructure `references` (per-locale `clients: string[]` instead of shared `groups`), add `contact.pricingNote`, remove nav entry for pricing in both locales, change hero side image `image05.jpg` → `image07.jpg`
- `src/layouts/BaseLayout.astro` — remove Google Fonts `@import`, add `@fontsource` imports, add Twitter/OG image meta tags, add JSON-LD via the new helper, add preconnect for Brandfetch, add preload for LCP hero image
- `src/components/HomePage.astro` — remove `PricingSection` import, rename `TrustStrip` → `LogoStrip`, drop `Pricing` from section order, remove `sectionIds.pricing`
- `src/components/home/HeroSection.astro` — migrate `<img>` → `<Image>`, import images as assets
- `src/components/home/ReferencesSection.astro` — switch from two-group render to single-list render
- `src/components/home/ContactSection.astro` — render `content.contact.pricingNote` below `content.contact.intro`
- `src/styles/global.css` — drop `backdrop-filter: blur(16px)` from image + card selector list (lines ~116-127)

**Deleted:**
- `src/components/home/TrustStrip.astro` (renamed to `LogoStrip.astro`)
- `src/components/home/PricingSection.astro`

## Testing

- `npm run check` passes (type-check + unit tests).
- Manual browser verification at `astro dev`:
  - Hero shows `image07.jpg` in the side slot.
  - Logo strip renders 8 logos, grayscale → color on hover.
  - Pricing section is gone from nav and from page.
  - References renders a single merged list, 14-15 entries, English shows translated suffixes.
  - Contact section shows the new `pricingNote` line.
  - Fonts load without flash of unstyled text.
  - No `@import` network request to `fonts.googleapis.com`.
  - LCP hero image is preloaded (check Network tab: priority High, initiator `(preload)`).
  - Page scroll feels smooth (no blur-induced jank).
- Build verification:
  - `npm run build` produces `dist/sitemap-index.xml`.
  - JSON-LD validates at https://validator.schema.org/ for both locale URLs.
  - OG preview renders correctly in https://www.opengraph.xyz/ or equivalent.
- Lighthouse score (desktop) target: Performance ≥ 90, SEO ≥ 95, Accessibility unchanged or better.

## Deliberate non-decisions (handed to the implementation plan)

- Exact visual treatment of the merged References list (two-column stack vs. wrap-tag-cloud vs. comma list).
- Whether to deduplicate Eurings in the merged references list or keep the two distinct entries.
- Whether `LogoStrip.astro` keeps a visible kicker label or is label-less.
- Final placement of font CSS imports (in `BaseLayout` style block vs. dedicated CSS entry).
- Whether `@type` for JSON-LD should be `CleaningService` or `LocalBusiness` — resolve by checking validator output.
- Exact HU placeholder wording for `contact.pricingNote` (marked TODO until HU copy pass).
