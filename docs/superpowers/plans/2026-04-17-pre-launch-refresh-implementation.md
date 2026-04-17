# Pre-launch refresh — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the pre-launch homepage refresh: swap hero side image, replace the keyword Trust Strip with a curated logo strip, restructure References, absorb Pricing into Contact, and lay down the perf + SEO foundations (self-hosted fonts, image optimization, blur removal, LCP preload, sitemap, JSON-LD, social meta).

**Architecture:** The site is an Astro 5 SSR app deployed to Cloudflare. A single `src/data/site.ts` holds all homepage copy per locale (`hu`, `en`); pages in `src/pages/` + `src/pages/en/` render the shared `HomePage.astro` composition of section components. We'll change the data shape (remove `trustStrip` + `pricing`, add `logoStrip` + `contact.pricingNote`, restructure `references.groups` → `references.clients`), update existing tests, swap components, and then add infra (fonts, sitemap, JSON-LD) in isolated later tasks.

**Tech Stack:** Astro 5, TypeScript, Vitest, Cloudflare adapter, `@astrojs/sitemap`, `@fontsource/manrope`, `@fontsource-variable/fraunces`, Brandfetch CDN for logos, native `astro:assets` for image optimization.

---

## Pre-flight

- Working branch: `pre-launch-copy-refresh` (already created, already on it).
- Design spec: `docs/superpowers/specs/2026-04-17-pre-launch-refresh-design.md`.
- Run `npm install` if the repo has never been set up on this machine.
- Run `npm run check` to confirm a green baseline before starting. If the baseline is red, fix the failures or flag them before beginning implementation.

## File structure

**New files:**
- `src/data/logos.ts` — curated brand logo list (Brandfetch URLs + local fallbacks)
- `src/lib/structured-data.ts` — JSON-LD `LocalBusiness` / `CleaningService` builder
- `src/components/home/LogoStrip.astro` — replaces `TrustStrip.astro`
- `src/assets/images/` — directory; homepage source images migrated here for `astro:assets`
- `public/og-image.jpg` — 1200×630 Open Graph asset (placeholder built from existing photo is fine)

**Modified files:**
- `package.json`, `package-lock.json` — new dependencies
- `astro.config.mjs` — register sitemap integration, add `image.domains`
- `src/data/site.ts` — drop `trustStrip` + `pricing` blocks, add `logoStrip`, restructure `references`, add `contact.pricingNote`, remove pricing nav entry, swap hero side image
- `src/lib/language-switching.ts` — drop `arak ↔ pricing` hash mapping
- `src/layouts/BaseLayout.astro` — self-hosted fonts, social meta, JSON-LD, Brandfetch preconnect, LCP preload
- `src/components/HomePage.astro` — drop Pricing, rename TrustStrip → LogoStrip, remove `sectionIds.pricing`
- `src/components/home/HeroSection.astro` — migrate `<img>` → `<Image>`
- `src/components/home/ReferencesSection.astro` — render single flat list
- `src/components/home/ContactSection.astro` — render `pricingNote` below intro
- `src/styles/global.css` — remove `backdrop-filter: blur(16px)` from image/card selectors
- `tests/site-content.test.ts` — update content contract
- `tests/language-switching.test.ts` — update hash-map expectations

**Deleted files:**
- `src/components/home/TrustStrip.astro`
- `src/components/home/PricingSection.astro`

---

## Task 1: Update site content types and data shape

**Files:**
- Modify: `src/data/site.ts` (full rewrite of several blocks)

This task changes only the data + types. Tests will still fail afterward — that's expected; Task 2 updates them.

- [ ] **Step 1.1: Remove `PriceRow` type and rename `ReferenceGroup`**

In `src/data/site.ts`, delete the `PriceRow` type (lines around 8-11) and the `ReferenceGroup` type (lines around 13-16). Replace the `ReferenceGroup` type with nothing — the new `references` shape uses a flat `string[]`.

- [ ] **Step 1.2: Update `LocaleContent` type**

Modify the `LocaleContent` type (lines around 24-117) to:
- Remove the `trustStrip` field entirely.
- Add `logoStrip: { kicker: string }`.
- Remove the `pricing` field entirely.
- Change `references` from `{ kicker; title; intro; groups: ReferenceGroup[] }` to `{ kicker: string; title: string; intro: string; clients: string[] }`.
- Add `pricingNote: string` to the `contact` object (after `intro`).

Resulting (relevant excerpt):

```ts
export type LocaleContent = {
  lang: string;
  title: string;
  description: string;
  nav: Array<{ href: string; label: string }>;
  languageLabel: string;
  languageSwitch: Array<{ href: string; label: string; active: boolean }>;
  themeToggle: { label: string; light: string; dark: string };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    stats: Array<{ value: string; label: string }>;
  };
  heroImages: {
    main: { src: string; alt: string };
    side: Array<{ src: string; alt: string }>;
  };
  logoStrip: { kicker: string };
  about: {
    kicker: string;
    title: string;
    intro: string;
    cards: Array<{ title: string; text: string }>;
  };
  services: {
    kicker: string;
    title: string;
    intro: string;
    items: Service[];
  };
  references: {
    kicker: string;
    title: string;
    intro: string;
    clients: string[];
  };
  partnerCompany: {
    kicker: string;
    title: string;
    intro: string;
    name: string;
    href: string;
    cta: string;
  };
  contact: {
    kicker: string;
    title: string;
    intro: string;
    pricingNote: string;
    addressLabel: string;
    address: string;
    officeNote: string;
    emailLabel: string;
    socialLabel: string;
    socialText: string;
    people: ContactPerson[];
    formTitle: string;
    formIntro: string;
    formLabels: {
      name: string;
      company: string;
      email: string;
      phone: string;
      message: string;
      submit: string;
    };
    mailtoSubject: string;
    mailBodyLabels: {
      name: string;
      company: string;
      email: string;
      phone: string;
      message: string;
    };
  };
  footer: string;
};
```

- [ ] **Step 1.3: Delete the `sharedReferences` constant**

Remove the `sharedReferences` object (lines around 119-139). Its data is inlined per locale below.

- [ ] **Step 1.4: Update the Hungarian content block**

In the `hu` locale object:

- Remove the pricing nav entry: delete `{ href: "#arak", label: "Áraink" }` from the `nav` array.
- Replace `heroImages.side[0].src` from `"/images/image05.jpg"` to `"/images/image07.jpg"` (keep alt text as-is).
- Replace the `trustStrip` block with:

  ```ts
  logoStrip: { kicker: "Megbízóink köre" },
  ```

- Remove the `pricing` block entirely.
- Replace the `references` block with:

  ```ts
  references: {
    kicker: "Referenciák",
    title: "Megbízóink között egészségügyi, ipari, logisztikai és kereskedelmi szereplők is megtalálhatók.",
    intro: "A folyamatos együttműködés és a visszatérő megbízások adják munkánk legerősebb igazolását.",
    clients: [
      "Medicover klinika",
      "Eurings Zrt.",
      "Techszerviz Kft.",
      "Strabag Zrt.",
      "Axiál Kft.",
      "Novochem Kft.",
      "DHL Express Logisztikai Központ",
      "Laguna Lux Fürdőszoba Szalon",
      "Mitor Kft.",
      "McDonald's éttermek",
      "Thyssenkrupp Zrt.",
      "Plan-Épszer Kft.",
      "Diósgyőri kórház",
      "Egyházi rendezvénycsarnok",
      "Eurings Zrt. Szerszámregeneráló üzem"
    ]
  },
  ```

- In the `contact` block, add `pricingNote` right after `intro`:

  ```ts
  pricingNote: "TODO(hu-copy): átlátható árazás egyeztetés alapján — adaptálásra vár az angol változathoz igazítva.",
  ```

- [ ] **Step 1.5: Update the English content block**

In the `en` locale object, mirror the Hungarian changes:

- Remove the pricing nav entry: delete `{ href: "#pricing", label: "Pricing" }` from the `nav` array.
- Replace `heroImages.side[0].src` from `"/images/image05.jpg"` to `"/images/image07.jpg"`.
- Replace the `trustStrip` block with:

  ```ts
  logoStrip: { kicker: "Trusted by" },
  ```

- Remove the `pricing` block entirely.
- Replace the `references` block with:

  ```ts
  references: {
    kicker: "References",
    title: "Our client list includes healthcare, industrial, logistics and commercial organizations.",
    intro: "Long-term cooperation and repeat assignments remain the clearest proof of our service quality.",
    clients: [
      "Medicover clinic",
      "Eurings Zrt.",
      "Techszerviz Kft.",
      "Strabag Zrt.",
      "Axiál Kft.",
      "Novochem Kft.",
      "DHL Express logistics hub",
      "Laguna Lux bathroom showroom",
      "Mitor Kft.",
      "McDonald's restaurants",
      "Thyssenkrupp Zrt.",
      "Plan-Épszer Kft.",
      "Diósgyőri hospital",
      "Ecclesiastical event hall",
      "Eurings Zrt. tool regeneration plant"
    ]
  },
  ```

- In the `contact` block, add `pricingNote` right after `intro`:

  ```ts
  pricingNote: "Transparent pricing based on a free on-site survey — reach out by phone or email and we typically reply within 24 hours on weekdays.",
  ```

- [ ] **Step 1.6: Verify the file compiles**

Run: `npx astro check`

Expected: type errors in `ReferencesSection.astro`, `PricingSection.astro`, `TrustStrip.astro`, `HomePage.astro`, and the tests (because they reference the old shape). That is expected — we fix them in Tasks 2, 3, 5, 6, 7, 8. **Do not commit yet** — this task's commit happens after Task 2 so the test suite stays green.

Note: Task 2 updates tests; commit happens at the end of Task 2.

---

## Task 2: Update site-content tests for new shape

**Files:**
- Modify: `tests/site-content.test.ts`

- [ ] **Step 2.1: Rewrite the test file**

Replace the entire contents of `tests/site-content.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import siteContent from "../src/data/site";

describe("site content", () => {
  it("defines the homepage content contract for both locales", () => {
    expect(siteContent.hu.logoStrip.kicker).toBeTruthy();
    expect(siteContent.en.logoStrip.kicker).toBeTruthy();

    expect(siteContent.hu.partnerCompany).toEqual({
      kicker: expect.any(String),
      title: expect.any(String),
      intro: expect.any(String),
      name: "TOP-CLEAN 87' Kft.",
      href: "https://topclean87kft.hu/",
      cta: expect.any(String)
    });
    expect(siteContent.en.partnerCompany).toEqual({
      kicker: expect.any(String),
      title: expect.any(String),
      intro: expect.any(String),
      name: "TOP-CLEAN 87' Kft.",
      href: "https://topclean87kft.hu/",
      cta: expect.any(String)
    });

    expect(siteContent.hu.partnerCompany.name).toBe("TOP-CLEAN 87' Kft.");
    expect(siteContent.en.partnerCompany.name).toBe("TOP-CLEAN 87' Kft.");

    expect(siteContent.hu.themeToggle.label).toBeTruthy();
    expect(siteContent.hu.themeToggle.light).toBeTruthy();
    expect(siteContent.hu.themeToggle.dark).toBeTruthy();
    expect(siteContent.en.themeToggle.label).toBeTruthy();
    expect(siteContent.en.themeToggle.light).toBeTruthy();
    expect(siteContent.en.themeToggle.dark).toBeTruthy();

    expect(siteContent.hu.contact.people).toHaveLength(2);
    expect(siteContent.en.contact.people).toHaveLength(2);
    expect(siteContent.hu.contact.mailtoSubject).toBeTruthy();
    expect(siteContent.en.contact.mailtoSubject).toBeTruthy();
    expect(siteContent.hu.contact.pricingNote).toBeTruthy();
    expect(siteContent.en.contact.pricingNote).toBeTruthy();
    expect(siteContent.hu.contact.formLabels.name).toBeTruthy();
    expect(siteContent.hu.contact.formLabels.company).toBeTruthy();
    expect(siteContent.hu.contact.formLabels.email).toBeTruthy();
    expect(siteContent.hu.contact.formLabels.phone).toBeTruthy();
    expect(siteContent.hu.contact.formLabels.message).toBeTruthy();
    expect(siteContent.hu.contact.formLabels.submit).toBeTruthy();
    expect(siteContent.en.contact.formLabels.name).toBeTruthy();
    expect(siteContent.en.contact.formLabels.company).toBeTruthy();
    expect(siteContent.en.contact.formLabels.email).toBeTruthy();
    expect(siteContent.en.contact.formLabels.phone).toBeTruthy();
    expect(siteContent.en.contact.formLabels.message).toBeTruthy();
    expect(siteContent.en.contact.formLabels.submit).toBeTruthy();
    expect(siteContent.hu.contact.mailBodyLabels.name).toBeTruthy();
    expect(siteContent.hu.contact.mailBodyLabels.company).toBeTruthy();
    expect(siteContent.hu.contact.mailBodyLabels.email).toBeTruthy();
    expect(siteContent.hu.contact.mailBodyLabels.phone).toBeTruthy();
    expect(siteContent.hu.contact.mailBodyLabels.message).toBeTruthy();
    expect(siteContent.en.contact.mailBodyLabels.name).toBeTruthy();
    expect(siteContent.en.contact.mailBodyLabels.company).toBeTruthy();
    expect(siteContent.en.contact.mailBodyLabels.email).toBeTruthy();
    expect(siteContent.en.contact.mailBodyLabels.phone).toBeTruthy();
    expect(siteContent.en.contact.mailBodyLabels.message).toBeTruthy();

    expect(siteContent.hu.hero.title).toMatch(/vállalat|létesítmény|intézmény/i);
    expect(siteContent.en.hero.title).toMatch(/industrial|office|healthcare|facility/i);

    expect(siteContent.hu.heroImages.main.alt).toBeTruthy();
    expect(siteContent.en.heroImages.main.alt).toBeTruthy();
    expect(siteContent.hu.heroImages.side).toHaveLength(2);
    expect(siteContent.en.heroImages.side).toHaveLength(2);
    expect(siteContent.hu.heroImages.side[0].src).toBe("/images/image07.jpg");
    expect(siteContent.en.heroImages.side[0].src).toBe("/images/image07.jpg");

    expect(siteContent.hu.references.clients.length).toBeGreaterThanOrEqual(12);
    expect(siteContent.en.references.clients.length).toBeGreaterThanOrEqual(12);
    expect(siteContent.hu.references.clients).toContain("Thyssenkrupp Zrt.");
    expect(siteContent.en.references.clients).toContain("Thyssenkrupp Zrt.");
    expect(siteContent.hu.references.clients).toContain("Plan-Épszer Kft.");
    expect(siteContent.en.references.clients).toContain("Plan-Épszer Kft.");
    expect(siteContent.hu.references.clients).not.toContain("Skála ruházati áruház");
    expect(siteContent.en.references.clients).not.toContain("Skála ruházati áruház");
    expect(siteContent.hu.references.clients).not.toContain("Loxon Solutions Zrt.");
    expect(siteContent.en.references.clients).not.toContain("Loxon Solutions Zrt.");

    // English suffixes are translated
    expect(siteContent.en.references.clients).toContain("Medicover clinic");
    expect(siteContent.en.references.clients).toContain("McDonald's restaurants");
    expect(siteContent.en.references.clients).toContain("Diósgyőri hospital");

    // Navigation does not include a pricing entry
    const huNavHrefs = siteContent.hu.nav.map((n) => n.href);
    const enNavHrefs = siteContent.en.nav.map((n) => n.href);
    expect(huNavHrefs).not.toContain("#arak");
    expect(enNavHrefs).not.toContain("#pricing");
  });
});
```

- [ ] **Step 2.2: Run tests**

Run: `npx vitest run tests/site-content.test.ts`

Expected: all assertions in this file pass (the other test files are not yet updated and may still fail, which we fix in later tasks).

- [ ] **Step 2.3: Run full check**

Run: `npm run check`

Expected: `astro check` reports zero errors coming from `site.ts` / `site-content.test.ts`. Remaining errors are component files referencing removed fields (TrustStrip, PricingSection, ReferencesSection, HomePage) — those are fixed in later tasks. Vitest reports failures only in `language-switching.test.ts` if it references `arak/pricing` (Task 3) — verify.

- [ ] **Step 2.4: Commit**

```bash
git add src/data/site.ts tests/site-content.test.ts
git commit -m "refactor(data): restructure site content for logo strip and merged references

- Replace trustStrip with logoStrip (kicker only)
- Drop pricing block and nav entry in both locales
- Flatten references.groups → references.clients with per-locale strings
- Add contact.pricingNote (EN copy; HU placeholder TODO)
- Swap hero side image image05 → image07
- Update site-content tests to match new shape"
```

---

## Task 3: Remove pricing hash mapping from language switching

**Files:**
- Modify: `src/lib/language-switching.ts`
- Modify: `tests/language-switching.test.ts`

- [ ] **Step 3.1: Update the hash map**

In `src/lib/language-switching.ts`, change `HU_TO_EN_HASH` to remove the `arak: "pricing"` line:

```ts
const HU_TO_EN_HASH: Record<string, string> = {
  rolunk: "about",
  szolgaltatasok: "services",
  referenciak: "references",
  kapcsolat: "contact"
};
```

- [ ] **Step 3.2: Update the test file**

In `tests/language-switching.test.ts`, the existing tests don't assert on `arak/pricing` directly — they assert on other mappings. Add one assertion in the `mapLocaleHash` describe block to confirm `arak`/`pricing` are now treated as unknown hashes (pass through unchanged):

Find the test `"keeps unknown hashes unchanged"` (around line 32) and add two more assertions in the same test:

```ts
it("keeps unknown hashes unchanged", () => {
  expect(mapLocaleHash("#custom-anchor", "hu", "en")).toBe("#custom-anchor");
  expect(mapLocaleHash("#arak", "hu", "en")).toBe("#arak");
  expect(mapLocaleHash("#pricing", "en", "hu")).toBe("#pricing");
});
```

- [ ] **Step 3.3: Run language-switching tests**

Run: `npx vitest run tests/language-switching.test.ts`

Expected: all tests pass.

- [ ] **Step 3.4: Commit**

```bash
git add src/lib/language-switching.ts tests/language-switching.test.ts
git commit -m "refactor(locale): drop arak↔pricing hash mapping

Pricing section is being removed; the hash simply passes through as
unknown for any stale links."
```

---

## Task 4: Create the logos data file

**Files:**
- Create: `src/data/logos.ts`

- [ ] **Step 4.1: Add the new data file**

Create `src/data/logos.ts`:

```ts
const BRANDFETCH_CLIENT_ID = "1idKqX_mjt3_lN3ROtG";
const BRANDFETCH_CDN = "https://cdn.brandfetch.io";

export type BrandLogo = {
  name: string;
  src: string;
  width?: number;
  height?: number;
};

export const clientLogos: BrandLogo[] = [
  {
    name: "Medicover",
    src: `${BRANDFETCH_CDN}/medicover.com/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "Strabag",
    src: `${BRANDFETCH_CDN}/strabag.com/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "DHL",
    src: `${BRANDFETCH_CDN}/dhl.com/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "McDonald's",
    src: `${BRANDFETCH_CDN}/mcdonalds.com/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "Thyssenkrupp",
    src: `${BRANDFETCH_CDN}/thyssenkrupp.com/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "Axiál",
    src: `${BRANDFETCH_CDN}/axial.hu/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "Eurings",
    src: `${BRANDFETCH_CDN}/eurings.hu/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "Novochem",
    src: `${BRANDFETCH_CDN}/novochem.hu/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  }
];
```

Note on the client ID: this is the same ID used by the sibling `3p-kemeny.hu` project (it's already public in that repo's source, so reusing it is fine). If any of the eight brands doesn't resolve on Brandfetch, the implementing engineer should add a local PNG to `public/images/logos/` and swap that entry's `src` to `/images/logos/<slug>.png`. Verify each URL returns a valid image in the browser before committing.

- [ ] **Step 4.2: Commit**

```bash
git add src/data/logos.ts
git commit -m "feat(data): add curated client logo list sourced via Brandfetch"
```

---

## Task 5: Replace TrustStrip with LogoStrip component

**Files:**
- Delete: `src/components/home/TrustStrip.astro`
- Create: `src/components/home/LogoStrip.astro`
- Modify: `src/components/HomePage.astro`
- Modify: `src/styles/global.css` (add logo-strip styles)

- [ ] **Step 5.1: Create `LogoStrip.astro`**

Create `src/components/home/LogoStrip.astro`:

```astro
---
import type { LocaleContent } from "../../data/site";
import { clientLogos } from "../../data/logos";

interface Props {
  content: LocaleContent;
}

const { content } = Astro.props;
---

<section class="section logo-strip" aria-label={content.logoStrip.kicker}>
  <div class="section-heading">
    <p class="eyebrow">{content.logoStrip.kicker}</p>
  </div>

  <ul class="logo-strip-items" role="list">
    {clientLogos.map((logo) => (
      <li class="logo-strip-item">
        <img
          src={logo.src}
          alt={logo.name}
          width={logo.width}
          height={logo.height}
          loading="lazy"
          decoding="async"
        />
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 5.2: Delete the old component**

Delete `src/components/home/TrustStrip.astro`:

```bash
rm src/components/home/TrustStrip.astro
```

- [ ] **Step 5.3: Update `HomePage.astro` import + usage**

In `src/components/HomePage.astro`, replace the `TrustStrip` import with `LogoStrip` and update the usage:

- Change `import TrustStrip from "./home/TrustStrip.astro";` to `import LogoStrip from "./home/LogoStrip.astro";`
- Change the `<TrustStrip content={content} />` element to `<LogoStrip content={content} />`
- Move the `<LogoStrip>` line so it sits directly after the hero (above `<ServicesSection>`) — matches the new section order in the spec.
- Remove the `pricing` entry from both `sectionIds` branches (the `hu` object and the `en` object).
- Remove the `<PricingSection />` element from the `<main>` block.
- Remove the `import PricingSection from "./home/PricingSection.astro";` line.

The resulting file contents:

```astro
---
import type { Locale, LocaleContent } from "../data/site";
import AboutSection from "./home/AboutSection.astro";
import ContactSection from "./home/ContactSection.astro";
import HeroSection from "./home/HeroSection.astro";
import LogoStrip from "./home/LogoStrip.astro";
import PartnerSection from "./home/PartnerSection.astro";
import ReferencesSection from "./home/ReferencesSection.astro";
import ServicesSection from "./home/ServicesSection.astro";
import SiteFooter from "./site/SiteFooter.astro";
import SiteHeader from "./site/SiteHeader.astro";

interface Props {
  locale: Locale;
  content: LocaleContent;
}

const { locale, content } = Astro.props;

const sectionIds =
  locale === "hu"
    ? {
        about: "rolunk",
        services: "szolgaltatasok",
        references: "referenciak",
        contact: "kapcsolat"
      }
    : {
        about: "about",
        services: "services",
        references: "references",
        contact: "contact"
      };
---

<div class="page-shell">
  <SiteHeader locale={locale} content={content} />

  <main>
    <HeroSection content={content} servicesId={sectionIds.services} contactId={sectionIds.contact} />
    <LogoStrip content={content} />
    <ServicesSection content={content} id={sectionIds.services} />
    <AboutSection content={content} id={sectionIds.about} />
    <ReferencesSection content={content} id={sectionIds.references} />
    <PartnerSection content={content} />
    <ContactSection content={content} id={sectionIds.contact} />
  </main>

  <SiteFooter content={content} />
</div>
```

- [ ] **Step 5.4: Add logo-strip styles to `global.css`**

Find the existing `.trust-strip-items` / `.trust-strip-item` rules (the old `TrustStrip.astro` had them inline; confirm by searching `global.css`). If none exist there (they were inline in `TrustStrip.astro`), append to `src/styles/global.css`:

```css
.logo-strip-items {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.5rem 2rem;
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  align-items: center;
  justify-items: center;
}

.logo-strip-item img {
  max-width: 100%;
  max-height: 3.5rem;
  width: auto;
  height: auto;
  object-fit: contain;
  filter: grayscale(1);
  opacity: 0.65;
  transition: filter 200ms ease, opacity 200ms ease;
}

.logo-strip-item img:hover,
.logo-strip-item img:focus-visible {
  filter: none;
  opacity: 1;
}

@media (max-width: 47.99rem) {
  .logo-strip-items {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem 1.5rem;
  }
}
```

- [ ] **Step 5.5: Delete PricingSection component**

```bash
rm src/components/home/PricingSection.astro
```

- [ ] **Step 5.6: Run `astro check`**

Run: `npx astro check`

Expected: errors remain only in `ReferencesSection.astro` (Task 6) and `ContactSection.astro` (Task 7). All `HomePage.astro` / `TrustStrip` / `PricingSection` references are resolved.

- [ ] **Step 5.7: Commit**

```bash
git add src/components/home/LogoStrip.astro src/components/HomePage.astro src/styles/global.css
git rm src/components/home/TrustStrip.astro src/components/home/PricingSection.astro
git commit -m "feat(home): replace TrustStrip with curated LogoStrip, drop PricingSection

- New LogoStrip renders 8 client logos, grayscale default → color on hover
- Positions directly under hero, replacing the old keyword trust strip
- Pricing section removed entirely from HomePage composition"
```

---

## Task 6: Simplify ReferencesSection to a flat list

**Files:**
- Modify: `src/components/home/ReferencesSection.astro`
- Modify: `src/styles/global.css` (add/adjust reference-list styles)

- [ ] **Step 6.1: Rewrite the component**

Replace the full contents of `src/components/home/ReferencesSection.astro` with:

```astro
---
import type { LocaleContent } from "../../data/site";

interface Props {
  content: LocaleContent;
  id: string;
}

const { content, id } = Astro.props;
---

<section class="section references-section" id={id}>
  <div class="section-heading">
    <p class="eyebrow">{content.references.kicker}</p>
    <h2>{content.references.title}</h2>
    <p>{content.references.intro}</p>
  </div>

  <ul class="reference-list" role="list">
    {content.references.clients.map((client) => (
      <li class="reference-list-item">{client}</li>
    ))}
  </ul>
</section>
```

- [ ] **Step 6.2: Add / adjust styles in `global.css`**

Find the existing `.reference-groups` and `.reference-card` styles in `src/styles/global.css`. They may still be referenced from the `.reference-card` selector list in the backdrop-filter rule at line ~116-127 (that selector list also covers `.partner-callout` — don't remove it entirely yet, we handle blur in Task 11).

Append new rules for the flat list:

```css
.reference-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 2rem;
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0;
}

.reference-list-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--panel-border);
  font-weight: 500;
}

@media (min-width: 48rem) {
  .reference-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
```

The older `.reference-groups` / `.reference-card h3` / `.reference-card ul` / `.reference-card li` rules are now dead CSS. Remove them for cleanliness — but leave `.reference-card` itself, as the partner callout (`PartnerSection.astro`) uses `class="reference-card partner-callout"`. Specifically:

Search `src/styles/global.css` for `reference-card` and `reference-groups` and delete the rules that no longer apply to `.partner-callout`. If uncertain, leave them — dead CSS bytes are cheaper than regression risk.

- [ ] **Step 6.3: Run `astro check`**

Run: `npx astro check`

Expected: errors remain only in `ContactSection.astro` (Task 7).

- [ ] **Step 6.4: Run unit tests**

Run: `npx vitest run`

Expected: all tests pass (`site-content`, `language-switching`, `locale-routing`, `theme`, `layout-regressions`).

- [ ] **Step 6.5: Commit**

```bash
git add src/components/home/ReferencesSection.astro src/styles/global.css
git commit -m "refactor(references): flatten two reference groups into a single list"
```

---

## Task 7: Render pricing note in ContactSection

**Files:**
- Modify: `src/components/home/ContactSection.astro`

- [ ] **Step 7.1: Add the pricing note paragraph**

In `src/components/home/ContactSection.astro`, find the line:

```astro
      <p>{content.contact.intro}</p>
```

And insert directly below it:

```astro
      <p class="contact-pricing-note">{content.contact.pricingNote}</p>
```

- [ ] **Step 7.2: Add styling (minor)**

Append to `src/styles/global.css`:

```css
.contact-pricing-note {
  font-weight: 500;
  color: var(--text-strong, inherit);
}
```

If `--text-strong` isn't defined in `tokens.css`, `inherit` keeps the color as-is — that's fine.

- [ ] **Step 7.3: Run `astro check`**

Run: `npx astro check`

Expected: zero errors.

- [ ] **Step 7.4: Run full check**

Run: `npm run check`

Expected: `astro check` clean, all vitest suites pass.

- [ ] **Step 7.5: Manual browser smoke test**

Run: `npm run dev` (background it or run in another terminal).

Visit `http://localhost:4321/` and `http://localhost:4321/en/` and verify visually:

- Hero renders with `image07.jpg` in the top-right side slot (you should see a different image than before).
- Directly below the hero, a logo strip shows 8 company logos in grayscale; hovering turns them color.
- Services, About appear as before.
- References renders as a single list with all clients (15 items), English shows "Medicover clinic" / "McDonald's restaurants" / "Diósgyőri hospital" etc.
- No Pricing section anywhere.
- Contact shows a new paragraph about pricing right below the intro.
- Nav in header does not include a "Pricing" / "Áraink" link.

Stop the dev server when done: Ctrl+C.

- [ ] **Step 7.6: Commit**

```bash
git add src/components/home/ContactSection.astro src/styles/global.css
git commit -m "feat(contact): render pricing reassurance note below intro"
```

---

## Task 8: Self-host fonts and drop Google Fonts import

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 8.1: Install font packages**

Run:

```bash
npm install @fontsource/manrope @fontsource-variable/fraunces
```

Expected: `package.json` gains both as dependencies, `package-lock.json` updates.

- [ ] **Step 8.2: Replace the Google Fonts `@import` with self-hosted imports**

Open `src/layouts/BaseLayout.astro`. In the `<style is:global>` block (currently lines 42-46), replace:

```astro
<style is:global>
  @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap");
  @import "../styles/tokens.css";
  @import "../styles/global.css";
</style>
```

With:

```astro
<style is:global>
  @import "@fontsource/manrope/400.css";
  @import "@fontsource/manrope/500.css";
  @import "@fontsource/manrope/600.css";
  @import "@fontsource/manrope/700.css";
  @import "@fontsource/manrope/800.css";
  @import "@fontsource-variable/fraunces/index.css";
  @import "../styles/tokens.css";
  @import "../styles/global.css";
</style>
```

Notes:
- `@fontsource-variable/fraunces/index.css` loads the full variable font with the `opsz` optical-size axis, matching the intent of the original `opsz,wght@9..144,600;9..144,700` URL.
- Astro bundles these imports into the page's CSS output; the actual WOFF2 files are emitted to `dist/_astro/` with hashed names and served from the same origin.

- [ ] **Step 8.3: Verify `font-family` values still match in `tokens.css` and `global.css`**

Run:

```bash
grep -n "font-family" src/styles/tokens.css src/styles/global.css
```

If the declarations use `"Manrope"` and `"Fraunces"` (as bare names, not `"Manrope Variable"`), we're fine — `@fontsource/manrope` and `@fontsource-variable/fraunces` declare `font-family: Manrope` and `font-family: "Fraunces Variable"` respectively.

If `Fraunces` is referenced without "Variable", update the token value:

```css
/* tokens.css (example) */
--font-display: "Fraunces Variable", "Fraunces", serif;
```

Keeping `"Fraunces"` as a fallback ensures the static files (from a user who happens to have them installed) still match.

- [ ] **Step 8.4: Run full check + build**

```bash
npm run check
npm run build
```

Expected: both succeed. Inspect `dist/_astro/` (or wherever Astro emits hashed assets) for `.woff2` files — confirmation the fonts are bundled.

- [ ] **Step 8.5: Smoke test in dev**

Run: `npm run dev`.

Open the Network tab in the browser. Reload. Confirm:
- No requests to `fonts.googleapis.com` or `fonts.gstatic.com`.
- Woff2 files load from `/_astro/…`.
- Fonts render without FOUT (flash of unstyled text) — the browser may briefly show fallback, but there's no layout shift.

Stop dev server.

- [ ] **Step 8.6: Commit**

```bash
git add package.json package-lock.json src/layouts/BaseLayout.astro src/styles/tokens.css src/styles/global.css
git commit -m "perf(fonts): self-host Manrope + Fraunces via @fontsource

Removes the render-blocking @import to fonts.googleapis.com inside the
global style block. Woff2 files are now bundled by Astro and served
from the same origin."
```

(If `tokens.css` / `global.css` weren't modified, omit them from the add list.)

---

## Task 9: Remove backdrop-filter blur from image and card surfaces

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 9.1: Locate and remove the blur rule**

In `src/styles/global.css`, find the block around lines 116-127:

```css
.hero-main-image,
.hero-side-grid img,
.section,
.info-card,
.service-card,
.reference-card,
.person-card,
.contact-form-card,
.pricing-table-wrap,
.stat-card {
  backdrop-filter: blur(16px);
}
```

Delete the entire rule (the selector list + the `backdrop-filter` property). Reasoning: `.pricing-table-wrap` no longer exists (the PricingSection was deleted), and blur on images/cards is the primary scroll-paint cost. No surface on this homepage genuinely requires backdrop-filter — removing it entirely is the right call.

If another usage of `backdrop-filter` exists elsewhere in `global.css` (search with `grep -n "backdrop-filter" src/styles/global.css`), evaluate each case individually. For this task, only the rule above is targeted — leave any other usage alone.

- [ ] **Step 9.2: Run build + visual smoke test**

```bash
npm run dev
```

Visit `http://localhost:4321/` and scroll the page. The paint/scroll should feel noticeably snappier. The glassmorphism look on cards (if any was visible) is gone — this is intended.

Stop dev server.

- [ ] **Step 9.3: Run full check**

```bash
npm run check
```

Expected: clean.

- [ ] **Step 9.4: Commit**

```bash
git add src/styles/global.css
git commit -m "perf(css): drop backdrop-filter blur from image and card surfaces

This rule was painting blur on hero images, all section panels, and
every card — the primary compositor cost while scrolling. No surface
required it visually."
```

---

## Task 10: Migrate hero images to astro:assets

**Files:**
- Create: `src/assets/images/image11.jpg`, `image07.jpg`, `image03.jpg` (copied from `public/images/`)
- Modify: `src/components/home/HeroSection.astro`
- Modify: `src/data/site.ts` (hero image `src` fields become an identifier, not a URL)

Decision point for the implementing engineer: there are two viable patterns.

**Pattern A — Import directly in `HeroSection.astro`** (simpler, but decouples the `src` from the data file). The three hero images are imported as ES modules in the component; the data file's `heroImages` keeps `alt` text per image but the `src` field is ignored (or dropped from the type).

**Pattern B — Dynamic import via a map** (data-driven). The `src` in the data file stays a string key (e.g., `"image11"`) and the component resolves it through a static map of imported assets.

Pattern A is simpler and recommended here because we only have three hero images and the site isn't likely to grow many more soon. The steps below use Pattern A.

- [ ] **Step 10.1: Move images into `src/assets/images/`**

```bash
mkdir -p src/assets/images
cp public/images/image11.jpg src/assets/images/image11.jpg
cp public/images/image07.jpg src/assets/images/image07.jpg
cp public/images/image03.jpg src/assets/images/image03.jpg
```

Do **not** delete the originals from `public/images/` yet — other tooling (e.g., the brainstorming visual companion) may reference them, and social meta uses `/images/...` paths. They can be cleaned up in a follow-up pass.

- [ ] **Step 10.2: Rewrite `HeroSection.astro` to use `<Image>`**

Replace the full contents of `src/components/home/HeroSection.astro` with:

```astro
---
import { Image } from "astro:assets";
import type { LocaleContent } from "../../data/site";
import heroMain from "../../assets/images/image11.jpg";
import heroSide1 from "../../assets/images/image07.jpg";
import heroSide2 from "../../assets/images/image03.jpg";

interface Props {
  content: LocaleContent;
  servicesId: string;
  contactId: string;
}

const { content, servicesId, contactId } = Astro.props;

const sideImages = [
  { asset: heroSide1, alt: content.heroImages.side[0]?.alt ?? "" },
  { asset: heroSide2, alt: content.heroImages.side[1]?.alt ?? "" }
];
---

<section class="hero-section">
  <div class="hero-copy">
    <p class="eyebrow">{content.hero.eyebrow}</p>
    <h1>{content.hero.title}</h1>
    <p class="hero-text">{content.hero.subtitle}</p>

    <div class="hero-actions">
      <a class="button button-primary" href={`#${contactId}`}>{content.hero.primaryCta}</a>
      <a class="button button-secondary" href={`#${servicesId}`}>{content.hero.secondaryCta}</a>
    </div>

    <div class="hero-stats">
      {content.hero.stats.map((item) => (
        <div class="stat-card">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  </div>

  <div class="hero-visual">
    <figure class="hero-main-image">
      <Image
        src={heroMain}
        alt={content.heroImages.main.alt}
        loading="eager"
        fetchpriority="high"
        widths={[640, 960, 1280, 1600]}
        sizes="(max-width: 48rem) 100vw, 60vw"
      />
    </figure>

    <div class="hero-side-grid">
      {sideImages.map((img) => (
        <Image
          src={img.asset}
          alt={img.alt}
          loading="lazy"
          widths={[320, 480, 640]}
          sizes="(max-width: 48rem) 50vw, 30vw"
        />
      ))}
    </div>
  </div>
</section>
```

Notes:
- `<Image>` auto-selects WebP (and AVIF when enabled) and emits a responsive `srcset`.
- `fetchpriority="high"` on the main hero image tells the browser this is the LCP candidate, preferred over a separate `<link rel="preload">` tag when using Astro's Image (the preloader hint is now on the element itself — simpler than wiring a preload tag in `BaseLayout`).
- `loading="lazy"` on side images defers their network fetch.

- [ ] **Step 10.3: `heroImages.main.src` and `.side[0/1].src` in `site.ts` are now unused**

The rewritten `HeroSection.astro` no longer reads `content.heroImages.*.src`. The fields can stay in `site.ts` (they don't hurt) or be removed. **Leave them in place** to avoid churn in the type + tests, and because removing the fields would also require updating `site-content.test.ts` (which asserts on `heroImages.side[0].src === "/images/image07.jpg"`). Leaving them documents the original intent.

- [ ] **Step 10.4: Run build + dev smoke test**

```bash
npm run build
```

Expected: clean. Inspect `dist/_astro/` for WebP variants of the three hero images.

Run: `npm run dev`.

In browser DevTools Network tab:
- Hero main image loads as `.webp` (not `.jpg`).
- Side images are lazy — they may not load until you scroll near them.
- Fetch priority on the main hero is "High" (visible in the Priority column).

Stop dev server.

- [ ] **Step 10.5: Run full check**

```bash
npm run check
```

Expected: clean.

- [ ] **Step 10.6: Commit**

```bash
git add src/assets/images src/components/home/HeroSection.astro
git commit -m "perf(hero): migrate hero images to astro:assets

- Three hero images imported as assets; astro:assets emits WebP + srcset
- Main hero gets fetchpriority=high for LCP
- Side images lazy-load"
```

---

## Task 11: Install and configure @astrojs/sitemap

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `astro.config.mjs`

- [ ] **Step 11.1: Install the integration**

```bash
npm install @astrojs/sitemap
```

- [ ] **Step 11.2: Register the integration**

Replace the full contents of `astro.config.mjs` with:

```js
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://poseidon-service.hu",
  output: "server",
  adapter: cloudflare(),
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "hu",
        locales: {
          hu: "hu-HU",
          en: "en"
        }
      }
    })
  ],
  image: {
    domains: ["cdn.brandfetch.io"]
  }
});
```

- [ ] **Step 11.3: Build and verify sitemap output**

```bash
npm run build
```

Expected:
- Build succeeds.
- `dist/client/sitemap-index.xml` and `dist/client/sitemap-0.xml` exist (for SSR builds to Cloudflare, sitemap files land under the static client output). If the paths are different in this Astro version, locate them with `find dist -name "sitemap*"`.
- Verify file contents include both `/` and `/en/` URLs with `<xhtml:link rel="alternate" hreflang="…">` entries.

If the sitemap isn't generated, check the integration order (sitemap should be in `integrations`, not inside the adapter) and confirm `site` is set.

- [ ] **Step 11.4: Commit**

```bash
git add package.json package-lock.json astro.config.mjs
git commit -m "feat(seo): add @astrojs/sitemap with i18n alternates"
```

---

## Task 12: Add JSON-LD structured-data helper

**Files:**
- Create: `src/lib/structured-data.ts`
- Create: `tests/structured-data.test.ts`

- [ ] **Step 12.1: Write the failing test**

Create `tests/structured-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildLocalBusinessJsonLd } from "../src/lib/structured-data";

describe("buildLocalBusinessJsonLd", () => {
  it("includes core LocalBusiness fields for the Hungarian locale", () => {
    const result = buildLocalBusinessJsonLd({
      locale: "hu",
      siteOrigin: new URL("https://poseidon-service.hu")
    });

    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("CleaningService");
    expect(result.name).toBe("Poseidon Service Kft.");
    expect(result.url).toBe("https://poseidon-service.hu/");
    expect(result.inLanguage).toBe("hu");
    expect(result.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "Berettyó utca 10/1",
      postalCode: "4034",
      addressLocality: "Debrecen",
      addressCountry: "HU"
    });
    expect(result.telephone).toEqual(["+36 20 955 2464", "+36 30 946 0693"]);
    expect(result.areaServed).toEqual({ "@type": "Country", "name": "Hungary" });
    expect(result.sameAs).toContain("https://www.facebook.com/poseidonservice");
  });

  it("switches the url and language for the English locale", () => {
    const result = buildLocalBusinessJsonLd({
      locale: "en",
      siteOrigin: new URL("https://poseidon-service.hu")
    });

    expect(result.url).toBe("https://poseidon-service.hu/en/");
    expect(result.inLanguage).toBe("en");
  });
});
```

- [ ] **Step 12.2: Run test to verify it fails**

Run: `npx vitest run tests/structured-data.test.ts`

Expected: FAIL — `Cannot find module '../src/lib/structured-data'`.

- [ ] **Step 12.3: Implement the helper**

Create `src/lib/structured-data.ts`:

```ts
import type { Locale } from "../data/site";

type PostalAddress = {
  "@type": "PostalAddress";
  streetAddress: string;
  postalCode: string;
  addressLocality: string;
  addressCountry: string;
};

type Country = {
  "@type": "Country";
  name: string;
};

export type LocalBusinessJsonLd = {
  "@context": "https://schema.org";
  "@type": "CleaningService";
  name: string;
  url: string;
  inLanguage: Locale;
  address: PostalAddress;
  telephone: string[];
  areaServed: Country;
  sameAs: string[];
};

export function buildLocalBusinessJsonLd(input: {
  locale: Locale;
  siteOrigin: URL;
}): LocalBusinessJsonLd {
  const path = input.locale === "en" ? "/en/" : "/";
  return {
    "@context": "https://schema.org",
    "@type": "CleaningService",
    name: "Poseidon Service Kft.",
    url: new URL(path, input.siteOrigin).toString(),
    inLanguage: input.locale,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Berettyó utca 10/1",
      postalCode: "4034",
      addressLocality: "Debrecen",
      addressCountry: "HU"
    },
    telephone: ["+36 20 955 2464", "+36 30 946 0693"],
    areaServed: { "@type": "Country", "name": "Hungary" },
    sameAs: ["https://www.facebook.com/poseidonservice"]
  };
}
```

- [ ] **Step 12.4: Run tests to verify they pass**

Run: `npx vitest run tests/structured-data.test.ts`

Expected: all tests PASS.

- [ ] **Step 12.5: Run full check**

Run: `npm run check`

Expected: clean.

- [ ] **Step 12.6: Commit**

```bash
git add src/lib/structured-data.ts tests/structured-data.test.ts
git commit -m "feat(seo): add LocalBusiness/CleaningService JSON-LD builder"
```

---

## Task 13: Wire JSON-LD, social meta, preconnect into BaseLayout

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Create: `public/og-image.jpg` (1200×630 placeholder)

- [ ] **Step 13.1: Create the OG image placeholder**

An OG image is a 1200×630 JPEG. For launch, any on-brand photo suffices — a cropped `image11.jpg` with a logo overlay is fine; proper artwork can replace it later.

Create the file at `public/og-image.jpg`. If the implementing engineer has no image-editing tool at hand, an acceptable interim placeholder is copying an existing photo:

```bash
cp public/images/image11.jpg public/og-image.jpg
```

This produces a non-optimal but functional OG image (the 915×915 source will be auto-scaled to 1200×630 by consumers). Flag as TODO in the PR description that a proper 1200×630 asset should replace this before launch.

- [ ] **Step 13.2: Update `BaseLayout.astro`**

Replace the full contents of `src/layouts/BaseLayout.astro` with:

```astro
---
import { getThemeBootstrapScript } from "../lib/theme";
import { buildLocalBusinessJsonLd } from "../lib/structured-data";
import type { Locale } from "../data/site";

interface Props {
  lang: string;
  title: string;
  description: string;
}

const { lang, title, description } = Astro.props;
const siteOrigin = Astro.site ?? new URL(Astro.url.origin);
const canonical = new URL(Astro.url.pathname, siteOrigin);
const ogImage = new URL("/og-image.jpg", siteOrigin).toString();

const jsonLd = buildLocalBusinessJsonLd({
  locale: lang as Locale,
  siteOrigin
});
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="description" content={description} />

    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical.href} />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content={lang === "hu" ? "hu_HU" : "en_GB"} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />

    <meta name="generator" content={Astro.generator} />
    <link rel="canonical" href={canonical.href} />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="alternate" hreflang="hu" href={new URL("/", siteOrigin).href} />
    <link rel="alternate" hreflang="en" href={new URL("/en/", siteOrigin).href} />
    <link rel="alternate" hreflang="x-default" href={new URL("/", siteOrigin).href} />
    <link rel="preconnect" href="https://cdn.brandfetch.io" crossorigin />

    <script type="application/ld+json" is:inline set:html={JSON.stringify(jsonLd)} />
    <script is:inline set:html={getThemeBootstrapScript()} />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>

<style is:global>
  @import "@fontsource/manrope/400.css";
  @import "@fontsource/manrope/500.css";
  @import "@fontsource/manrope/600.css";
  @import "@fontsource/manrope/700.css";
  @import "@fontsource/manrope/800.css";
  @import "@fontsource-variable/fraunces/index.css";
  @import "../styles/tokens.css";
  @import "../styles/global.css";
</style>
```

Notes:
- `lang` stays typed as `string` (matching the existing signature and the `content.lang: string` field on `LocaleContent`). The value is cast to `Locale` only at the call site for `buildLocalBusinessJsonLd` — this avoids cascading type changes through `site.ts`.
- The `<script type="application/ld+json">` uses `is:inline set:html=` to prevent Astro from processing the JSON content.

- [ ] **Step 13.3: Run build and verify head metadata**

```bash
npm run build
```

Inspect `dist/client/index.html` (or the SSR output for `/`) — confirm:
- `<link rel="canonical">` present.
- `<meta property="og:image">`, `og:image:width`, `og:image:height` present.
- `<meta name="twitter:card" content="summary_large_image">` present.
- `<link rel="preconnect" href="https://cdn.brandfetch.io" crossorigin>` present.
- A `<script type="application/ld+json">` block contains a valid JSON object with `"@type":"CleaningService"` and the correct address.

For the English page, repeat for `dist/client/en/index.html` — the JSON-LD `url` should end in `/en/`.

- [ ] **Step 13.4: Validate JSON-LD**

Paste the JSON-LD block contents into https://validator.schema.org/ — it should validate with no errors. If `CleaningService` is flagged as unknown, fall back to `LocalBusiness`:

```ts
// In structured-data.ts, change:
"@type": "CleaningService",
// to:
"@type": "LocalBusiness",
```

And update the test's expected value. Commit the fallback change if needed.

- [ ] **Step 13.5: Run full check**

```bash
npm run check
```

Expected: clean.

- [ ] **Step 13.6: Commit**

```bash
git add src/layouts/BaseLayout.astro public/og-image.jpg
git commit -m "feat(seo): add JSON-LD, social meta, Brandfetch preconnect to BaseLayout

- LocalBusiness/CleaningService JSON-LD per locale
- Twitter card + OG image meta (placeholder og-image.jpg)
- Preconnect to cdn.brandfetch.io for logo strip
- TODO: replace og-image.jpg with branded 1200×630 artwork"
```

---

## Task 14: Final verification and launch checklist

**Files:** none (verification only)

- [ ] **Step 14.1: Run the full test suite**

```bash
npm run check
```

Expected: `astro check` reports zero errors, all vitest suites pass.

- [ ] **Step 14.2: Run production build**

```bash
npm run build
```

Expected: build succeeds. Output should include:
- `dist/client/sitemap-index.xml` and `dist/client/sitemap-0.xml`
- `dist/_astro/*.webp` (hero image variants)
- `dist/_astro/*.woff2` (font files)
- `dist/_astro/*.css` (hashed stylesheets)

- [ ] **Step 14.3: Start dev server, run through the visual checklist**

```bash
npm run dev
```

Open both `http://localhost:4321/` and `http://localhost:4321/en/`. Verify:

- [ ] Hero renders `image07.jpg` in the top side slot (was `image05.jpg`).
- [ ] Hero main image loads as `.webp`, fetchpriority high.
- [ ] 8-logo strip sits directly under the hero; logos are grayscale at rest, full color on hover.
- [ ] Sections appear in order: Hero → Logo Strip → Services → About → References → Partner → Contact.
- [ ] References is a single flat list with 15 entries (check both locales); English shows "Medicover clinic", "McDonald's restaurants", "Diósgyőri hospital", "Ecclesiastical event hall", "DHL Express logistics hub", etc.
- [ ] No Pricing section anywhere on the page.
- [ ] Header nav does not include a Pricing / Áraink link.
- [ ] Contact section shows a pricingNote paragraph directly below the intro (English is live copy; Hungarian shows the `TODO(hu-copy)…` placeholder string — this is expected).
- [ ] In DevTools Network tab: no requests to `fonts.googleapis.com` or `fonts.gstatic.com`. Woff2 files load from `/_astro/…`.
- [ ] In DevTools Elements tab: `<script type="application/ld+json">` exists in `<head>`; content is valid JSON with the correct address (Berettyó utca 10/1, 4034 Debrecen).
- [ ] `<meta property="og:image">` present with 1200×630 dimensions.
- [ ] Scrolling feels smooth (no blur-induced jank).

Stop dev server.

- [ ] **Step 14.4: Lighthouse pass**

Run Lighthouse (desktop) on both locale URLs. Target scores:

- Performance ≥ 90
- SEO ≥ 95
- Accessibility ≥ current baseline

If Performance is below 90, the likely culprits are: unoptimized third-party logos (Brandfetch CDN), font loading (check FOUT), or unexpected layout shift. Investigate the specific failing audit.

- [ ] **Step 14.5: Schema validation**

Paste the live page URL (both `/` and `/en/`) into https://validator.schema.org/ — both should validate.

- [ ] **Step 14.6: Social preview validation**

Use https://www.opengraph.xyz/ or similar to verify the OG image loads. It's acceptable if the preview shows a 915×915 square (from the placeholder `image11.jpg` copy) — flag in the PR description that proper 1200×630 artwork is a launch TODO.

- [ ] **Step 14.7: Push the branch**

```bash
git push -u origin pre-launch-copy-refresh
```

No commit in this task — it's pure verification. Open a PR against `main` describing the changes and the launch TODOs (OG image artwork, Hungarian pricingNote copy, keyword-targeted title/description for next session).

---

## Launch TODOs (not in scope for this plan)

- Replace `public/og-image.jpg` with proper 1200×630 branded artwork.
- Hungarian copy adaptation for `contact.pricingNote` (currently a `TODO(hu-copy)` placeholder).
- Deeper SEO pass: keyword-targeted `title` + `description` rewrites for both locales.
- Verify that every Brandfetch logo URL in `src/data/logos.ts` resolves to a real image; add local PNG fallbacks in `public/images/logos/` for any that don't.
- Decide whether to deduplicate the two Eurings entries in `references.clients`, or keep both for the distinct engagements.
