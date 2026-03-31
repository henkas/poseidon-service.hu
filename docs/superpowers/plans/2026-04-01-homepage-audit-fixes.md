# Homepage Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 19 issues identified in the post-redesign audit — covering broken CSS, duplicate content, dark mode gaps, accessibility, SEO, and code hygiene.

**Architecture:** All fixes are isolated edits to existing files. No new components or routes. Data model gets three small additions (hero alt text, pricing column headers, eyebrow/link/marker tokens). Tests are extended to cover the new data fields. Global CSS gets token variables to replace hardcoded hex colors.

**Tech Stack:** Astro 5, CSS custom properties, Vitest, TypeScript

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/components/site/ThemeSwitcher.astro` | Modify | Remove conflicting scoped styles (issue 1) |
| `src/components/home/PartnerSection.astro` | Modify | Remove duplicate intro paragraph (issue 2) |
| `src/components/site/SiteHeader.astro` | Modify | Replace hardcoded mobile panel colors with tokens (issue 3) |
| `src/lib/locale-routing.ts` | Modify | Remove duplicate Locale type, import from site.ts (issue 4) |
| `src/layouts/BaseLayout.astro` | Modify | Add hreflang tags, OG meta, move theme script to component (issues 5, 9, 13) |
| `src/styles/global.css` | Modify | Fix focus selector, add token references, replace hardcoded colors (issues 6, 8) |
| `src/styles/tokens.css` | Modify | Add eyebrow, link, marker, and focus-border tokens (issue 8) |
| `src/data/site.ts` | Modify | Add hero image alt text, pricing column headers, remove galleryImages (issues 7, 10, 16) |
| `src/components/home/HeroSection.astro` | Modify | Use localized alt text, add loading=lazy (issues 7, 15) |
| `src/components/home/PricingSection.astro` | Modify | Use content model for column headers (issue 10) |
| `src/components/site/LanguageSwitcher.astro` | Modify | Fix undefined --surface-strong token (issue 11) |
| `src/components/home/ContactSection.astro` | Modify | Add autocomplete attributes (issue 12) |
| `src/components/home/TrustStrip.astro` | Modify | Change spans to ul/li (issue 14) |
| `tests/site-content.test.ts` | Modify | Cover new data fields (hero alt, pricing headers) |

---

### Task 1: Fix ThemeSwitcher scoped styles breaking pill animation

The scoped `<style>` in `ThemeSwitcher.astro` sets `display: inline-flex` which overrides the `display: inline-grid` in `global.css:316-323`. The grid layout is required for the `::before` sliding pill to position correctly. The fix is to remove the entire scoped `<style>` block — all needed styles already exist in `global.css`.

**Files:**
- Modify: `src/components/site/ThemeSwitcher.astro:20-31`

- [ ] **Step 1: Remove the scoped style block**

In `src/components/site/ThemeSwitcher.astro`, delete the entire `<style>` block (lines 20-31):

```astro
<style>
  .theme-switcher {
    display: inline-flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .theme-switcher-button {
    min-height: 42px;
    padding-inline: 16px;
  }
</style>
```

The file should end after line 19 (the closing `</div>`).

- [ ] **Step 2: Run build to verify no breakage**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/components/site/ThemeSwitcher.astro
git commit -m "fix: remove ThemeSwitcher scoped styles that break sliding pill animation"
```

---

### Task 2: Remove duplicate intro in PartnerSection

`PartnerSection.astro` renders `content.partnerCompany.intro` twice — once in the section heading (line 15) and again in the partner card (line 20). Remove the duplicate from inside the card.

**Files:**
- Modify: `src/components/home/PartnerSection.astro:18-21`

- [ ] **Step 1: Remove the duplicate paragraph from the partner card**

In `src/components/home/PartnerSection.astro`, change lines 18-21 from:

```astro
  <article class="reference-card partner-card">
    <h3>{content.partnerCompany.name}</h3>
    <p>{content.partnerCompany.intro}</p>
    <a
```

to:

```astro
  <article class="reference-card partner-card">
    <h3>{content.partnerCompany.name}</h3>
    <a
```

- [ ] **Step 2: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/components/home/PartnerSection.astro
git commit -m "fix: remove duplicate intro paragraph in PartnerSection"
```

---

### Task 3: Fix SiteHeader mobile panel dark mode

The scoped `<style>` in `SiteHeader.astro` uses hardcoded `rgba(255,255,255,...)` for the mobile panel and nav links. These override the token-aware styles in `global.css` because Astro scoped styles have higher specificity. Replace them with CSS custom property references.

**Files:**
- Modify: `src/components/site/SiteHeader.astro:98-119`

- [ ] **Step 1: Replace hardcoded colors with token variables**

In `src/components/site/SiteHeader.astro`, replace the mobile panel styles (lines 98-119) from:

```css
  .site-header-mobile-panel {
    display: grid;
    gap: 16px;
    margin-top: 12px;
    padding: 18px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 16px 40px rgba(19, 47, 38, 0.08);
  }

  .site-header-mobile-nav {
    display: grid;
    gap: 10px;
  }

  .site-header-mobile-nav a {
    padding: 10px 14px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(23, 49, 41, 0.08);
  }
```

to:

```css
  .site-header-mobile-panel {
    display: grid;
    gap: 1rem;
    margin-top: 0.75rem;
    padding: 1rem;
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--header-bg) 84%, transparent);
    border: 1px solid var(--header-border);
    box-shadow: var(--header-shadow);
  }

  .site-header-mobile-nav {
    display: grid;
    gap: 0.625rem;
  }

  .site-header-mobile-nav a {
    padding: 0.625rem 0.875rem;
    border-radius: var(--radius-xs);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
```

- [ ] **Step 2: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/components/site/SiteHeader.astro
git commit -m "fix: use token variables for mobile panel to support dark mode"
```

---

### Task 4: Remove duplicate Locale type

`src/lib/locale-routing.ts` defines its own `Locale` type on line 1 that duplicates `src/data/site.ts` line 1. Import from the canonical source instead.

**Files:**
- Modify: `src/lib/locale-routing.ts:1`

- [ ] **Step 1: Replace the local Locale type with an import**

In `src/lib/locale-routing.ts`, change line 1 from:

```ts
export type Locale = "hu" | "en";
```

to:

```ts
export type { Locale } from "../data/site";
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run`
Expected: all 12 tests pass

- [ ] **Step 3: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 4: Commit**

```bash
git add src/lib/locale-routing.ts
git commit -m "fix: import Locale type from canonical source instead of re-declaring"
```

---

### Task 5: Add hreflang tags to BaseLayout

The spec requires bilingual SEO with localized alternate URLs. Add `<link rel="alternate" hreflang>` tags for both locales.

**Files:**
- Modify: `src/layouts/BaseLayout.astro:4-8,21`

- [ ] **Step 1: Add locale prop and hreflang links**

In `src/layouts/BaseLayout.astro`, change the Props interface and add hreflang tags. Replace:

```astro
interface Props {
  lang: string;
  title: string;
  description: string;
}

const { lang, title, description } = Astro.props;
```

with:

```astro
interface Props {
  lang: string;
  title: string;
  description: string;
}

const { lang, title, description } = Astro.props;
const siteOrigin = Astro.site ?? new URL(Astro.url.origin);
```

Then, after the existing `<link rel="canonical" .../>` line, add:

```astro
    <link rel="alternate" hreflang="hu" href={new URL("/", siteOrigin)} />
    <link rel="alternate" hreflang="en" href={new URL("/en/", siteOrigin)} />
    <link rel="alternate" hreflang="x-default" href={new URL("/", siteOrigin)} />
```

- [ ] **Step 2: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: add hreflang alternate links for bilingual SEO"
```

---

### Task 6: Fix contact form focus outline for accessibility

`global.css:763-764` uses `:focus` + `outline: none`, which removes focus indicators in Windows High Contrast Mode. Change to `:focus-visible` with `outline: 2px solid transparent` (high-contrast mode overrides transparent outlines).

**Files:**
- Modify: `src/styles/global.css:763-768`

- [ ] **Step 1: Replace :focus with :focus-visible and keep outline visible**

In `src/styles/global.css`, replace lines 763-768:

```css
.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: #1ea4a0;
  box-shadow: 0 0 0 4px var(--focus-ring);
}
```

with:

```css
.contact-form input:focus-visible,
.contact-form textarea:focus-visible {
  outline: 2px solid transparent;
  border-color: var(--focus-border);
  box-shadow: 0 0 0 4px var(--focus-ring);
}
```

(The `--focus-border` token will be added in Task 8.)

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "fix: use :focus-visible with transparent outline for high contrast mode"
```

---

### Task 7: Add localized hero image alt text to content model

Hero images use hardcoded English alt text. Add localized `heroImages` data to `site.ts`, update `HeroSection.astro` to use it, and add `loading="lazy"` to secondary images. Also remove the unused `galleryImages` export.

**Files:**
- Modify: `src/data/site.ts` (add `heroImages` to `LocaleContent`, both locales; remove `galleryImages`)
- Modify: `src/components/home/HeroSection.astro:34-43`
- Modify: `tests/site-content.test.ts`

- [ ] **Step 1: Write the failing test for heroImages**

In `tests/site-content.test.ts`, add after the `hero.title` assertions (before the closing `});` on line 69):

```ts
    expect(siteContent.hu.heroImages.main.alt).toBeTruthy();
    expect(siteContent.en.heroImages.main.alt).toBeTruthy();
    expect(siteContent.hu.heroImages.side).toHaveLength(2);
    expect(siteContent.en.heroImages.side).toHaveLength(2);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/site-content.test.ts`
Expected: FAIL — `heroImages` does not exist on `LocaleContent`

- [ ] **Step 3: Add heroImages type and data to site.ts**

In `src/data/site.ts`, add to the `LocaleContent` type after the `hero` field (after line 43):

```ts
  heroImages: {
    main: { src: string; alt: string };
    side: Array<{ src: string; alt: string }>;
  };
```

Then add the `heroImages` field to the `hu` locale content (after the `hero` block, around line 170):

```ts
    heroImages: {
      main: { src: "/images/image11.jpg", alt: "Professzionális takarító munkában" },
      side: [
        { src: "/images/image05.jpg", alt: "Gépi padlótisztítás" },
        { src: "/images/image03.jpg", alt: "Nagy üvegfelületek tisztítása" }
      ]
    },
```

And to the `en` locale content (after the `hero` block, around line 332):

```ts
    heroImages: {
      main: { src: "/images/image11.jpg", alt: "Professional cleaner at work" },
      side: [
        { src: "/images/image05.jpg", alt: "Floor cleaning machine in use" },
        { src: "/images/image03.jpg", alt: "Cleaning large windows" }
      ]
    },
```

Then delete the `galleryImages` export at the bottom of the file (lines 464-471):

```ts
export const galleryImages = [
  { src: "/images/image01.jpg", alt: "Cleaning staff maintaining a bright interior space" },
  { src: "/images/image02.jpg", alt: "Professional cleaning in a modern office environment" },
  { src: "/images/image03.jpg", alt: "Worker cleaning large glass surfaces" },
  { src: "/images/image04.jpg", alt: "Detailed cleaning work with protective equipment" },
  { src: "/images/image05.jpg", alt: "Machine-assisted floor cleaning" },
  { src: "/images/image06.jpg", alt: "Commercial interior prepared after cleaning" }
];
```

- [ ] **Step 4: Update HeroSection to use content model**

In `src/components/home/HeroSection.astro`, replace lines 34-43:

```astro
  <div class="hero-visual">
    <figure class="hero-main-image">
      <img src="/images/image11.jpg" alt="Professional cleaner at work" loading="eager" />
    </figure>

    <div class="hero-side-grid">
      <img src="/images/image05.jpg" alt="Floor cleaning machine in use" />
      <img src="/images/image03.jpg" alt="Cleaning large windows" />
    </div>
  </div>
```

with:

```astro
  <div class="hero-visual">
    <figure class="hero-main-image">
      <img src={content.heroImages.main.src} alt={content.heroImages.main.alt} loading="eager" />
    </figure>

    <div class="hero-side-grid">
      {content.heroImages.side.map((img) => (
        <img src={img.src} alt={img.alt} loading="lazy" />
      ))}
    </div>
  </div>
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run`
Expected: all tests pass (including the new heroImages assertions)

- [ ] **Step 6: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 7: Commit**

```bash
git add src/data/site.ts src/components/home/HeroSection.astro tests/site-content.test.ts
git commit -m "feat: add localized hero image alt text, lazy-load secondary images, remove unused galleryImages"
```

---

### Task 8: Replace hardcoded hex colors with tokens

Five accent colors in `global.css` bypass the token system. Add token variables in `tokens.css` and reference them.

**Files:**
- Modify: `src/styles/tokens.css` (add tokens to both `:root` and `html[data-theme="dark"]`)
- Modify: `src/styles/global.css:554-562,687-688,722-731,766`

- [ ] **Step 1: Add tokens to tokens.css**

In `src/styles/tokens.css`, add before the closing `}` of the `:root` block (before line 72):

```css
  --eyebrow-accent: #0c5e79;
  --link-accent: #0c6c88;
  --marker-accent: #1ea4a0;
  --focus-border: #1ea4a0;
```

In the `html[data-theme="dark"]` block, add before the closing `}` (before line 129):

```css
  --eyebrow-accent: #78d0c8;
  --link-accent: #8fe0da;
  --marker-accent: #1ea4a0;
  --focus-border: #1ea4a0;
```

- [ ] **Step 2: Replace hardcoded colors in global.css**

In `src/styles/global.css`, replace each hardcoded color:

Replace lines 554-562:
```css
.section-heading .eyebrow,
.contact-copy .eyebrow {
  color: #0c5e79;
}

html[data-theme="dark"] .section-heading .eyebrow,
html[data-theme="dark"] .contact-copy .eyebrow {
  color: #78d0c8;
}
```
with:
```css
.section-heading .eyebrow,
.contact-copy .eyebrow {
  color: var(--eyebrow-accent);
}
```

Replace lines 687-688:
```css
.reference-card li::marker {
  color: #1ea4a0;
}
```
with:
```css
.reference-card li::marker {
  color: var(--marker-accent);
}
```

Replace lines 722-731:
```css
.contact-copy a,
.person-card a {
  color: #0c6c88;
  font-weight: 800;
}

html[data-theme="dark"] .contact-copy a,
html[data-theme="dark"] .person-card a {
  color: #8fe0da;
}
```
with:
```css
.contact-copy a,
.person-card a {
  color: var(--link-accent);
  font-weight: 800;
}
```

(The `:focus-visible` rule was already updated in Task 6 to use `var(--focus-border)`.)

- [ ] **Step 3: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 4: Commit**

```bash
git add src/styles/tokens.css src/styles/global.css
git commit -m "refactor: extract hardcoded hex colors into design tokens"
```

---

### Task 9: Move theme toggle script into ThemeSwitcher component

The click handler for theme buttons lives in `BaseLayout.astro` (lines 27-48) but the buttons are rendered by `ThemeSwitcher.astro`. This invisible coupling means the buttons silently do nothing if ThemeSwitcher is used outside BaseLayout. Move the script into the component, matching LanguageSwitcher's pattern.

**Files:**
- Modify: `src/layouts/BaseLayout.astro:27-49`
- Modify: `src/components/site/ThemeSwitcher.astro`

- [ ] **Step 1: Add the script to ThemeSwitcher.astro**

In `src/components/site/ThemeSwitcher.astro`, after the closing `</div>` (line 18), add:

```astro
<script>
  import { THEME_STORAGE_KEY } from "../../lib/theme";

  document.querySelectorAll<HTMLButtonElement>("[data-theme-value]").forEach((button) => {
    button.addEventListener("click", () => {
      const theme = button.dataset.themeValue;
      if (!theme) return;

      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (error) {
        console.warn("[poseidon] Could not save theme preference:", error);
      }

      document.documentElement.dataset.theme = theme;
    });
  });
</script>
```

Note: This uses a regular `<script>` (not `is:inline`) so Astro can bundle and deduplicate it. The import of `THEME_STORAGE_KEY` from the module replaces the inline JSON.stringify approach and ensures the key stays in sync.

- [ ] **Step 2: Remove the inline theme script from BaseLayout.astro**

In `src/layouts/BaseLayout.astro`, delete lines 27-49 (the entire `<script is:inline set:html={...} />` block for the theme toggle handler). Keep the theme bootstrap script in `<head>` — that one must remain inline and render-blocking.

The `</body>` tag should follow directly after `<slot />`.

- [ ] **Step 3: Remove the THEME_STORAGE_KEY import from BaseLayout if no longer used**

After removing the inline script, check if `THEME_STORAGE_KEY` is still referenced in `BaseLayout.astro`. It was only used in the removed inline script block. If the import `{ getThemeBootstrapScript, THEME_STORAGE_KEY }` now only needs `getThemeBootstrapScript`, update line 2:

```astro
import { getThemeBootstrapScript } from "../lib/theme";
```

- [ ] **Step 4: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 5: Commit**

```bash
git add src/components/site/ThemeSwitcher.astro src/layouts/BaseLayout.astro
git commit -m "refactor: colocate theme toggle script in ThemeSwitcher component"
```

---

### Task 10: Move pricing column headers into content model

`PricingSection.astro` computes `serviceColumnLabel` and `priceColumnLabel` via an inline `content.lang` check instead of pulling from the content model. Add these to `site.ts`.

**Files:**
- Modify: `src/data/site.ts` (add `pricingHeaders` to `LocaleContent`, both locales)
- Modify: `src/components/home/PricingSection.astro:10-11`
- Modify: `tests/site-content.test.ts`

- [ ] **Step 1: Write the failing test**

In `tests/site-content.test.ts`, add before the closing `});`:

```ts
    expect(siteContent.hu.pricing.serviceHeader).toBeTruthy();
    expect(siteContent.hu.pricing.priceHeader).toBeTruthy();
    expect(siteContent.en.pricing.serviceHeader).toBeTruthy();
    expect(siteContent.en.pricing.priceHeader).toBeTruthy();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/site-content.test.ts`
Expected: FAIL — `serviceHeader` does not exist

- [ ] **Step 3: Add fields to type and data**

In `src/data/site.ts`, update the pricing section of the `LocaleContent` type. Change:

```ts
  pricing: {
    kicker: string;
    title: string;
    note: string;
    rows: PriceRow[];
  };
```

to:

```ts
  pricing: {
    kicker: string;
    title: string;
    note: string;
    serviceHeader: string;
    priceHeader: string;
    rows: PriceRow[];
  };
```

Add `serviceHeader` and `priceHeader` to the `hu` pricing content:

```ts
    pricing: {
      kicker: "Áraink",
      title: "Átlátható irányárak, pontos ajánlat személyes felmérés után.",
      note: "Személyes felmérés és részletes ajánlat kéréséhez keressen minket telefonon vagy emailben.",
      serviceHeader: "Szolgáltatás",
      priceHeader: "Ár",
      rows: [
```

Add to the `en` pricing content:

```ts
    pricing: {
      kicker: "Pricing",
      title: "Indicative pricing with tailored quotes after a site visit.",
      note: "Contact us by phone or email for a personal survey and a detailed quotation.",
      serviceHeader: "Service",
      priceHeader: "Price",
      rows: [
```

- [ ] **Step 4: Update PricingSection to use content model**

In `src/components/home/PricingSection.astro`, delete lines 10-11:

```ts
const serviceColumnLabel = content.lang === "hu" ? "Szolgáltatás" : "Service";
const priceColumnLabel = content.lang === "hu" ? "Ár" : "Price";
```

And replace the `<th>` references on lines 25-26:

```astro
          <th>{serviceColumnLabel}</th>
          <th>{priceColumnLabel}</th>
```

with:

```astro
          <th>{content.pricing.serviceHeader}</th>
          <th>{content.pricing.priceHeader}</th>
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run`
Expected: all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/data/site.ts src/components/home/PricingSection.astro tests/site-content.test.ts
git commit -m "refactor: move pricing table headers into content model"
```

---

### Task 11: Fix undefined --surface-strong in LanguageSwitcher pill

The scoped `<style>` in `LanguageSwitcher.astro` references `var(--surface-strong)` which doesn't exist in the token system. Also uses a hardcoded green-tinted shadow. Replace with correct tokens.

**Files:**
- Modify: `src/components/site/LanguageSwitcher.astro:100-111`

- [ ] **Step 1: Replace undefined token and hardcoded shadow**

In `src/components/site/LanguageSwitcher.astro`, replace lines 100-111:

```css
  .lang-switcher-enhanced .lang-switcher-pill {
    position: absolute;
    top: 6px;
    bottom: 6px;
    left: 6px;
    width: calc((100% - 12px) / var(--switcher-count));
    border-radius: 999px;
    background: var(--surface-strong);
    box-shadow: 0 6px 16px rgba(20, 83, 64, 0.1);
    transform: translateX(calc(100% * var(--switcher-active)));
    transition: transform 180ms ease;
  }
```

with:

```css
  .lang-switcher-enhanced .lang-switcher-pill {
    position: absolute;
    top: 0.375rem;
    bottom: 0.375rem;
    left: 0.375rem;
    width: calc((100% - 0.75rem) / var(--switcher-count));
    border-radius: var(--radius-pill);
    background: var(--toggle-pill);
    box-shadow: var(--toggle-shadow);
    transform: translateX(calc(100% * var(--switcher-active)));
    transition: transform var(--motion-base);
  }
```

- [ ] **Step 2: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/components/site/LanguageSwitcher.astro
git commit -m "fix: replace undefined --surface-strong with --toggle-pill token"
```

---

### Task 12: Add autocomplete attributes to contact form

Missing `autocomplete` hints degrade mobile autofill and fail WCAG 1.3.5 Level AA.

**Files:**
- Modify: `src/components/home/ContactSection.astro:65-81`

- [ ] **Step 1: Add autocomplete attributes to each input**

In `src/components/home/ContactSection.astro`, update the form inputs:

Replace:
```astro
          <input name="name" type="text" required />
```
with:
```astro
          <input name="name" type="text" autocomplete="name" required />
```

Replace:
```astro
          <input name="company" type="text" />
```
with:
```astro
          <input name="company" type="text" autocomplete="organization" />
```

Replace:
```astro
          <input name="email" type="email" required />
```
with:
```astro
          <input name="email" type="email" autocomplete="email" required />
```

Replace:
```astro
          <input name="phone" type="tel" />
```
with:
```astro
          <input name="phone" type="tel" autocomplete="tel" />
```

- [ ] **Step 2: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/components/home/ContactSection.astro
git commit -m "fix: add autocomplete attributes to contact form for WCAG 1.3.5"
```

---

### Task 13: Add Open Graph meta tags to BaseLayout

A B2B marketing site needs OG tags for social sharing. Add `og:title`, `og:description`, `og:url`, `og:type`, and `og:locale`.

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add OG meta tags after description meta**

In `src/layouts/BaseLayout.astro`, after the `<meta name="description" .../>` line, add:

```astro
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={new URL(Astro.url.pathname, siteOrigin).href} />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content={lang === "hu" ? "hu_HU" : "en_GB"} />
```

Note: `siteOrigin` was already added in Task 5.

- [ ] **Step 2: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: add Open Graph meta tags for social sharing"
```

---

### Task 14: Change TrustStrip items from spans to semantic list

Screen readers can't announce trust items as a list because they're `<span>` elements inside a `<div>`.

**Files:**
- Modify: `src/components/home/TrustStrip.astro:16-20`

- [ ] **Step 1: Replace div/span structure with ul/li**

In `src/components/home/TrustStrip.astro`, replace lines 16-20:

```astro
  <div class="trust-strip-items">
    {content.trustStrip.items.map((item) => (
      <span class="stat-card trust-strip-item">{item}</span>
    ))}
  </div>
```

with:

```astro
  <ul class="trust-strip-items" role="list">
    {content.trustStrip.items.map((item) => (
      <li class="stat-card trust-strip-item">{item}</li>
    ))}
  </ul>
```

- [ ] **Step 2: Add list-style reset to TrustStrip scoped styles**

In the `<style>` block of `TrustStrip.astro`, add at the top of the block:

```css
  .trust-strip-items {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    list-style: none;
    padding: 0;
    margin: 0;
  }
```

This replaces the existing `.trust-strip-items` rule (add `list-style: none; padding: 0; margin: 0;` to the existing rule).

- [ ] **Step 3: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 4: Commit**

```bash
git add src/components/home/TrustStrip.astro
git commit -m "fix: use semantic ul/li for TrustStrip items for screen reader accessibility"
```

---

### Task 15: (Covered in Task 7)

Secondary hero images `loading="lazy"` was addressed in Task 7 step 4. No separate task needed.

---

### Task 16: (Covered in Task 7)

Unused `galleryImages` export removal was addressed in Task 7 step 3. No separate task needed.

---

### Task 17: Fix SiteHeader scoped styles — px to rem consistency

The scoped `<style>` in `SiteHeader.astro` uses px values while the rest of the codebase uses rem and token variables. This was partially addressed in Task 3 (mobile panel). This task covers the remaining px values in the controls and mobile-controls sections.

**Files:**
- Modify: `src/components/site/SiteHeader.astro:73-80,121-137`

- [ ] **Step 1: Fix controls gap and mobile controls gap**

In `src/components/site/SiteHeader.astro`, replace:

```css
  .site-header-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    flex-wrap: wrap;
  }
```

with:

```css
  .site-header-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
```

Replace:

```css
  .site-header-mobile-controls {
    display: grid;
    gap: 12px;
  }
```

with:

```css
  .site-header-mobile-controls {
    display: grid;
    gap: 0.75rem;
  }
```

- [ ] **Step 2: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/components/site/SiteHeader.astro
git commit -m "fix: convert remaining px values to rem in SiteHeader scoped styles"
```

---

### Task 18: Add console.warn to theme localStorage catch

The empty catch block in the theme toggle handler was moved to ThemeSwitcher in Task 9, where it already includes `console.warn`. This task adds a matching `console.warn` to the bootstrap script's catch block.

**Files:**
- Modify: `src/lib/theme.ts:20-23`

- [ ] **Step 1: Add console.warn to bootstrap catch**

In `src/lib/theme.ts`, replace:

```ts
    } catch (_error) {
      if (window.matchMedia(darkQuery).matches) {
        theme = "dark";
      }
    }
```

with:

```ts
    } catch (error) {
      console.warn("[poseidon] localStorage unavailable for theme; using system preference.", error);
      if (window.matchMedia(darkQuery).matches) {
        theme = "dark";
      }
    }
```

- [ ] **Step 2: Update the theme test to match new error logging**

In `tests/theme.test.ts`, the existing test at line 15 simulates a `localStorage.getItem` throwing. The test currently only checks that the theme becomes "dark". It should still pass since we only added a `console.warn`, but verify:

Run: `npx vitest run tests/theme.test.ts`
Expected: all 3 tests pass

- [ ] **Step 3: Commit**

```bash
git add src/lib/theme.ts
git commit -m "fix: log warning when localStorage is unavailable in theme bootstrap"
```

---

### Task 19: Optimize middleware cookie set — only when changed

The middleware currently appends a `set-cookie` header on every homepage request. Only set it when the cookie value differs from what's already stored.

**Files:**
- Modify: `src/middleware.ts:24-28`

- [ ] **Step 1: Add cookie comparison before setting**

In `src/middleware.ts`, replace lines 24-28:

```ts
  const response = await next();

  if (pathname === "/" || pathname === "/en/" || pathname === "/en") {
    response.headers.append("set-cookie", localeCookieValue(locale));
  }
```

with:

```ts
  const response = await next();

  if ((pathname === "/" || pathname === "/en/" || pathname === "/en") && cookieLocale !== locale) {
    response.headers.append("set-cookie", localeCookieValue(locale));
  }
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run`
Expected: all tests pass

- [ ] **Step 3: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: `Complete!`

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts
git commit -m "perf: only set locale cookie when value differs from existing"
```

---

## Final Verification

- [ ] **Run full test suite:** `npx vitest run` — all tests pass
- [ ] **Run build:** `npm run build 2>&1 | tail -5` — `Complete!`
- [ ] **Verify no TypeScript errors:** `npx astro check 2>&1 | tail -10`
