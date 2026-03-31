# Poseidon Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the bilingual Poseidon homepage for Cloudflare Pages with geo-aware first-visit locale routing, a persistent light/dark theme toggle, and a more modern B2B-first design that stays closer to the legacy Poseidon brand.

**Architecture:** Convert the site from static Astro output to Cloudflare-compatible server output so Astro middleware can decide first-visit locale redirects from `CF-IPCountry` and a persisted locale cookie. Keep structured business content in `src/data/site.ts`, split the oversized homepage into focused Astro components, and use a very small client-side state layer only for theme persistence and header controls; language remains route-based at `/` and `/en/`.

**Tech Stack:** Astro 5, TypeScript, `@astrojs/cloudflare`, Vitest, CSS custom properties, vanilla browser JavaScript, Cloudflare Pages

---

## References To Read First

- Spec: `docs/superpowers/specs/2026-03-31-poseidon-homepage-redesign-design.md`
- Astro Cloudflare deployment docs: `https://docs.astro.build/en/guides/deploy/cloudflare/`
- Cloudflare geolocation header docs: `https://developers.cloudflare.com/network/ip-geolocation/`

## Chosen Implementation Decisions

- Use Astro server output with the Cloudflare adapter.
- Read the visitor country from `request.headers.get("cf-ipcountry")`.
- Persist locale choice in a cookie named `poseidon_locale` with `path=/`, `sameSite=lax`, and `maxAge=31536000`.
- Persist theme choice in `localStorage` only, using the key `poseidon_theme`.
- Use system `prefers-color-scheme` only when there is no saved theme.
- Apply theme before visible paint with a small inline bootstrap script in `BaseLayout.astro`.
- Keep the contact form mail-based for this implementation; do not introduce a backend form endpoint.
- Keep the current two routes only: `/` and `/en/`.

## File Map

**Create**

- `src/lib/locale-routing.ts` — pure helpers for locale cookie parsing, bot detection, and redirect decisions.
- `src/lib/theme.ts` — pure helpers for theme key names and the inline bootstrap script string.
- `src/middleware.ts` — Astro middleware that applies locale routing precedence and sets locale cookies after explicit language switches.
- `src/components/site/SiteHeader.astro` — sticky header shell with nav, language switcher, theme switcher, and mobile menu trigger.
- `src/components/site/SiteFooter.astro` — footer shell preserving the existing localized footer content.
- `src/components/site/LanguageSwitcher.astro` — route-based sliding-pill language control.
- `src/components/site/ThemeSwitcher.astro` — light/dark toggle markup for desktop and mobile.
- `src/components/home/HeroSection.astro` — hero copy, CTA group, image layout, trust stats.
- `src/components/home/ServicesSection.astro` — service overview card grid.
- `src/components/home/TrustStrip.astro` — early proof strip with key references or sectors.
- `src/components/home/AboutSection.astro` — shorter B2B operating-approach section.
- `src/components/home/PricingSection.astro` — indicative pricing table.
- `src/components/home/ReferencesSection.astro` — expanded references groups.
- `src/components/home/PartnerSection.astro` — TOP-CLEAN related-company block.
- `src/components/home/ContactSection.astro` — direct contact details and mail-based form card.
- `src/styles/tokens.css` — light/dark theme tokens, color system, motion variables.
- `tests/locale-routing.test.ts` — unit tests for redirect precedence.
- `tests/theme.test.ts` — unit tests for theme defaults and bootstrap generation.
- `tests/site-content.test.ts` — unit tests for required localized content shape.
- `vitest.config.mjs` — Vitest configuration for the repo.

**Modify**

- `package.json` — add Cloudflare and test dependencies plus scripts.
- `package-lock.json` — dependency lockfile update.
- `astro.config.mjs` — switch from static output to Cloudflare server output.
- `src/layouts/BaseLayout.astro` — add theme bootstrap, `color-scheme`, header script hooks, and stylesheet imports.
- `src/components/HomePage.astro` — reduce to page composition only.
- `src/data/site.ts` — add partner-company content, revised B2B copy emphasis, trust-strip data, and labels for theme controls.
- `src/pages/index.astro` — keep Hungarian page but pass any new page-shell props cleanly.
- `src/pages/en/index.astro` — keep English page but pass any new page-shell props cleanly.
- `src/styles/global.css` — layout, component, responsive, and motion rules.
- `README.md` — add local dev / Cloudflare Pages notes.

### Task 1: Cloudflare Runtime And Locale Routing Helper

**Files:**
- Create: `src/lib/locale-routing.ts`
- Create: `tests/locale-routing.test.ts`
- Create: `vitest.config.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `astro.config.mjs`
- Modify: `src/components/HomePage.astro` if a minimal type-only compatibility fix is required for `astro check`

- [ ] **Step 1: Add runtime and test dependencies to `package.json`**

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test:unit": "vitest run",
    "check": "astro check && vitest run"
  },
  "dependencies": {
    "@astrojs/cloudflare": "^12.0.0",
    "astro": "^5.6.1"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.0",
    "typescript": "^5.8.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Install the new dependencies**

Run: `npm install`
Expected: install completes and updates `package-lock.json`

- [ ] **Step 3: Write the failing locale-routing test**

```ts
import { describe, expect, it } from "vitest";
import {
  normalizeLocaleCookie,
  resolveLocaleRequest
} from "../src/lib/locale-routing";

describe("normalizeLocaleCookie", () => {
  it("accepts only hu and en", () => {
    expect(normalizeLocaleCookie("hu")).toBe("hu");
    expect(normalizeLocaleCookie("en")).toBe("en");
    expect(normalizeLocaleCookie("fr")).toBeUndefined();
  });
});

describe("resolveLocaleRequest", () => {
  it("keeps explicit /en/ requests on English", () => {
    expect(
      resolveLocaleRequest({
        pathname: "/en/",
        country: "HU",
        cookieLocale: null,
        userAgent: "Mozilla/5.0"
      })
    ).toEqual({ locale: "en", redirectTo: null });
  });

  it("redirects first-time non-Hungarian visitors from / to /en/", () => {
    expect(
      resolveLocaleRequest({
        pathname: "/",
        country: "DE",
        cookieLocale: null,
        userAgent: "Mozilla/5.0"
      })
    ).toEqual({ locale: "en", redirectTo: "/en/" });
  });

  it("keeps bots on the Hungarian canonical / route", () => {
    expect(
      resolveLocaleRequest({
        pathname: "/",
        country: "US",
        cookieLocale: null,
        userAgent: "Googlebot/2.1"
      })
    ).toEqual({ locale: "hu", redirectTo: null });
  });

  it("prefers the locale cookie over country detection", () => {
    expect(
      resolveLocaleRequest({
        pathname: "/",
        country: "HU",
        cookieLocale: "en",
        userAgent: "Mozilla/5.0"
      })
    ).toEqual({ locale: "en", redirectTo: "/en/" });
  });
});
```

- [ ] **Step 4: Run the locale test to verify it fails**

Run: `npm run test:unit -- tests/locale-routing.test.ts`
Expected: FAIL with `Cannot find module '../src/lib/locale-routing'` or missing export errors

- [ ] **Step 5: Implement `src/lib/locale-routing.ts` with the exact precedence from the spec**

```ts
export type Locale = "hu" | "en";

type LocaleRequest = {
  pathname: string;
  country: string | null;
  cookieLocale: Locale | null;
  userAgent: string | null;
};

const BOT_PATTERN = /bot|crawler|spider|slurp|bingpreview/i;

export function normalizeLocaleCookie(value?: string): Locale | undefined {
  return value === "hu" || value === "en" ? value : undefined;
}

export function resolveLocaleRequest(input: LocaleRequest): {
  locale: Locale;
  redirectTo: string | null;
} {
  if (input.pathname === "/en/" || input.pathname === "/en") {
    return { locale: "en", redirectTo: null };
  }

  if (input.pathname !== "/") {
    return { locale: "hu", redirectTo: null };
  }

  if (BOT_PATTERN.test(input.userAgent ?? "")) {
    return { locale: "hu", redirectTo: null };
  }

  const preferred =
    input.cookieLocale ??
    (input.country === "HU" ? "hu" : "en");

  return preferred === "en"
    ? { locale: "en", redirectTo: "/en/" }
    : { locale: "hu", redirectTo: null };
}
```

- [ ] **Step 6: Switch Astro to the Cloudflare adapter**

```js
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://poseidon-service.hu",
  output: "server",
  adapter: cloudflare()
});
```

- [ ] **Step 7: Add a minimal Vitest config**

```js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"]
  }
});
```

- [ ] **Step 8: Run `npm run check` and, if needed, apply the smallest type-only fix required by Astro diagnostics**

Allowed example:

```ts
const formElement = form as HTMLFormElement;
const formData = new FormData(formElement);
```

Do not refactor page behavior; only satisfy existing type diagnostics so `npm run check` becomes usable.

- [ ] **Step 9: Re-run the locale test to verify it passes**

Run: `npm run test:unit -- tests/locale-routing.test.ts`
Expected: PASS with the locale test cases green

- [ ] **Step 10: Run the full validation command once**

Run: `npm run check`
Expected: PASS without interactive dependency prompts

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json astro.config.mjs vitest.config.mjs tests/locale-routing.test.ts src/lib/locale-routing.ts src/components/HomePage.astro
git commit -m "feat: add cloudflare locale routing foundation"
```

### Task 2: Astro Middleware For Geo-Aware Entry Routing

**Files:**
- Modify: `src/lib/locale-routing.ts`
- Create: `src/middleware.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/en/index.astro`
- Test: `tests/locale-routing.test.ts`

- [ ] **Step 1: Extend the locale test with middleware-facing cookie helper cases**

```ts
import { getLocaleCookie, localeCookieValue } from "../src/lib/locale-routing";

it("reads the locale cookie from request headers", () => {
  const headers = new Headers({
    cookie: "foo=bar; poseidon_locale=en; theme=dark"
  });

  expect(getLocaleCookie(headers)).toBe("en");
});

it("builds the locale persistence cookie value", () => {
  expect(localeCookieValue("hu")).toContain("poseidon_locale=hu");
  expect(localeCookieValue("hu")).toContain("Path=/");
});
```

- [ ] **Step 2: Run the test file to verify the new cases fail**

Run: `npm run test:unit -- tests/locale-routing.test.ts`
Expected: FAIL with missing `getLocaleCookie` and `localeCookieValue` exports

- [ ] **Step 3: Update `src/lib/locale-routing.ts` so cookie precedence is explicit and reusable by middleware**

```ts
export const LOCALE_COOKIE_NAME = "poseidon_locale";

export function getLocaleCookie(headers: Headers): Locale | null {
  const cookie = headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)poseidon_locale=(hu|en)(?:;|$)/);
  return normalizeLocaleCookie(match?.[1] ?? null);
}

export function localeCookieValue(locale: Locale): string {
  return `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
```

- [ ] **Step 4: Implement Astro middleware with redirect and persistence rules**

```ts
import { defineMiddleware } from "astro:middleware";
import {
  getLocaleCookie,
  localeCookieValue,
  resolveLocaleRequest
} from "./lib/locale-routing";

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const userAgent = context.request.headers.get("user-agent");
  const country = context.request.headers.get("cf-ipcountry");
  const cookieLocale = getLocaleCookie(context.request.headers);

  const localeResult = resolveLocaleRequest({
    pathname,
    country,
    cookieLocale,
    userAgent
  });

  if (localeResult.redirectTo) {
    return context.redirect(localeResult.redirectTo, 302);
  }

  const response = await next();
  const explicitLocale = pathname.startsWith("/en/") ? "en" : pathname === "/" ? "hu" : null;

  if (explicitLocale) {
    response.headers.append("set-cookie", localeCookieValue(explicitLocale));
  }

  return response;
});
```

- [ ] **Step 5: Keep both page entrypoints thin and route-specific**

```astro
---
import HomePage from "../components/HomePage.astro";
import BaseLayout from "../layouts/BaseLayout.astro";
import { siteContent } from "../data/site";

const content = siteContent.hu;
---
```

Use the same pattern for `src/pages/en/index.astro`; do not add locale decision logic to the page files.

- [ ] **Step 6: Re-run the locale tests**

Run: `npm run test:unit -- tests/locale-routing.test.ts`
Expected: PASS with all locale precedence cases green

- [ ] **Step 7: Build once to verify middleware and Cloudflare output integrate**

Run: `npm run build`
Expected: PASS with Astro generating server output for the Cloudflare adapter

- [ ] **Step 8: Commit**

```bash
git add src/lib/locale-routing.ts src/middleware.ts src/pages/index.astro src/pages/en/index.astro tests/locale-routing.test.ts
git commit -m "feat: add locale middleware for cloudflare pages"
```

### Task 3: Theme Persistence And Base Layout Bootstrap

**Files:**
- Create: `src/lib/theme.ts`
- Create: `tests/theme.test.ts`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Write the failing theme test**

```ts
import { describe, expect, it } from "vitest";
import {
  THEME_STORAGE_KEY,
  getThemeBootstrapScript
} from "../src/lib/theme";

describe("theme bootstrap", () => {
  it("uses the agreed storage key", () => {
    expect(THEME_STORAGE_KEY).toBe("poseidon_theme");
  });

  it("contains prefers-color-scheme fallback logic", () => {
    expect(getThemeBootstrapScript()).toContain("prefers-color-scheme: dark");
  });
});
```

- [ ] **Step 2: Run the theme test to verify it fails**

Run: `npm run test:unit -- tests/theme.test.ts`
Expected: FAIL with missing module or export errors

- [ ] **Step 3: Implement `src/lib/theme.ts`**

```ts
export const THEME_STORAGE_KEY = "poseidon_theme";
export const DEFAULT_THEME = "light";

export function getThemeBootstrapScript(): string {
  return `
    (() => {
      const key = "${THEME_STORAGE_KEY}";
      const saved = window.localStorage.getItem(key);
      const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "${DEFAULT_THEME}";
      const theme = saved === "light" || saved === "dark" ? saved : preferred;
      document.documentElement.dataset.theme = theme;
    })();
  `;
}
```

- [ ] **Step 4: Update `BaseLayout.astro` to apply theme before paint and expose header control hooks**

```astro
---
import { getThemeBootstrapScript } from "../lib/theme";
interface Props {
  lang: string;
  title: string;
  description: string;
}
const { lang, title, description } = Astro.props;
---

<!doctype html>
<html lang={lang} data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <meta name="color-scheme" content="light dark" />
    <script is:inline set:html={getThemeBootstrapScript()} />
    <title>{title}</title>
  </head>
  <body>
    <slot />
    <script is:inline>
      const key = "poseidon_theme";
      document.querySelectorAll("[data-theme-value]").forEach((button) => {
        button.addEventListener("click", () => {
          const theme = button.getAttribute("data-theme-value");
          if (!theme) return;
          document.documentElement.dataset.theme = theme;
          window.localStorage.setItem(key, theme);
        });
      });
    </script>
  </body>
</html>
```

- [ ] **Step 5: Re-run the theme test**

Run: `npm run test:unit -- tests/theme.test.ts`
Expected: PASS with 2 passing tests

- [ ] **Step 6: Re-run the full unit suite**

Run: `npm run test:unit`
Expected: PASS with locale and theme tests green

- [ ] **Step 7: Commit**

```bash
git add src/lib/theme.ts src/layouts/BaseLayout.astro tests/theme.test.ts
git commit -m "feat: add persistent theme bootstrap"
```

### Task 4: Expand The Content Model For B2B Messaging And TOP-CLEAN

**Files:**
- Create: `tests/site-content.test.ts`
- Modify: `src/data/site.ts`

- [ ] **Step 1: Write the failing content-shape test**

```ts
import { describe, expect, it } from "vitest";
import { siteContent } from "../src/data/site";

describe("site content", () => {
  it("defines partner-company content for both locales", () => {
    expect(siteContent.hu.partnerCompany.name).toBe("TOP-CLEAN 87' Kft.");
    expect(siteContent.en.partnerCompany.name).toBe("TOP-CLEAN 87' Kft.");
  });

  it("includes theme toggle labels for both locales", () => {
    expect(siteContent.hu.themeToggle.light).toBeTruthy();
    expect(siteContent.en.themeToggle.dark).toBeTruthy();
  });

  it("keeps the hero business-focused", () => {
    expect(siteContent.hu.hero.title).toMatch(/vállalat|létesítmény|intézmény/i);
    expect(siteContent.en.hero.title).toMatch(/industrial|office|healthcare|facility/i);
  });
});
```

- [ ] **Step 2: Run the content test to verify it fails**

Run: `npm run test:unit -- tests/site-content.test.ts`
Expected: FAIL because `partnerCompany` and `themeToggle` fields do not exist yet

- [ ] **Step 3: Extend the site data types and localized content**

Add these fields to `src/data/site.ts`:

```ts
themeToggle: {
  label: string;
  light: string;
  dark: string;
};
partnerCompany: {
  kicker: string;
  title: string;
  intro: string;
  name: string;
  href: string;
  cta: string;
};
trustStrip: {
  kicker: string;
  items: string[];
};
```

Populate them for both locales with copy that:

- keeps Poseidon primary
- pushes TOP-CLEAN below the main Poseidon trust story
- emphasizes larger B2B clients over private-home language

- [ ] **Step 4: Shorten any overlong about copy and move trust-oriented messaging upward in the data model**

Specifically:

- keep service names and pricing data
- add 3 to 5 concise trust-strip items from existing reference brands or sectors
- keep the contact people and mailto labels intact

- [ ] **Step 5: Re-run the content test**

Run: `npm run test:unit -- tests/site-content.test.ts`
Expected: PASS with all content-shape assertions green

- [ ] **Step 6: Re-run the full unit suite**

Run: `npm run test:unit`
Expected: PASS with locale, theme, and content tests green

- [ ] **Step 7: Commit**

```bash
git add src/data/site.ts tests/site-content.test.ts
git commit -m "feat: expand homepage content for partner brand and theme controls"
```

### Task 5: Build The New Header And Homepage Component Structure

**Files:**
- Create: `src/components/site/SiteHeader.astro`
- Create: `src/components/site/SiteFooter.astro`
- Create: `src/components/site/LanguageSwitcher.astro`
- Create: `src/components/site/ThemeSwitcher.astro`
- Create: `src/components/home/HeroSection.astro`
- Create: `src/components/home/ServicesSection.astro`
- Create: `src/components/home/TrustStrip.astro`
- Create: `src/components/home/AboutSection.astro`
- Create: `src/components/home/PricingSection.astro`
- Create: `src/components/home/ReferencesSection.astro`
- Create: `src/components/home/PartnerSection.astro`
- Create: `src/components/home/ContactSection.astro`
- Modify: `src/components/HomePage.astro`

- [ ] **Step 1: Replace `HomePage.astro` with page composition only**

```astro
---
import SiteHeader from "./site/SiteHeader.astro";
import SiteFooter from "./site/SiteFooter.astro";
import HeroSection from "./home/HeroSection.astro";
import ServicesSection from "./home/ServicesSection.astro";
import TrustStrip from "./home/TrustStrip.astro";
import AboutSection from "./home/AboutSection.astro";
import PricingSection from "./home/PricingSection.astro";
import ReferencesSection from "./home/ReferencesSection.astro";
import PartnerSection from "./home/PartnerSection.astro";
import ContactSection from "./home/ContactSection.astro";
const { locale, content } = Astro.props;
---

<div class="page-shell">
  <SiteHeader locale={locale} content={content} />
  <main>
    <HeroSection locale={locale} content={content} />
    <ServicesSection locale={locale} content={content} />
    <TrustStrip content={content} />
    <AboutSection content={content} />
    <PricingSection locale={locale} content={content} />
    <ReferencesSection content={content} />
    <PartnerSection content={content} />
    <ContactSection content={content} />
  </main>
  <SiteFooter content={content} />
</div>
```

- [ ] **Step 2: Implement the route-based language switcher as a sliding pill control**

```astro
---
const { locale } = Astro.props;
const items = [
  { label: "HU", href: "/", active: locale === "hu" },
  { label: "EN", href: "/en/", active: locale === "en" }
];
---

<div class="lang-switcher" aria-label={Astro.props.label}>
  {items.map((item) => (
    <a class:list={["lang-link", { active: item.active }]} href={item.href}>
      {item.label}
    </a>
  ))}
</div>
```

Implementation requirement for final behavior:

- Before navigating, the language switcher must set `document.cookie = "poseidon_locale=<target>; Path=/; Max-Age=31536000; SameSite=Lax"` so an intentional switch back to `/` works even when the visitor previously chose English.
- Keep the visible behavior route-based; do not swap page copy in place.

- [ ] **Step 3: Implement the theme switcher with immediate client-side toggling**

```astro
---
const { label, themeToggle } = Astro.props;
---

<div class="theme-switcher" aria-label={label}>
  <button type="button" data-theme-value="light">{themeToggle.light}</button>
  <button type="button" data-theme-value="dark">{themeToggle.dark}</button>
</div>
```

- [ ] **Step 4: Build `SiteHeader.astro` so desktop and mobile both expose nav, language, and theme controls**

Requirements for this step:

- desktop: brand, nav, language switcher, theme switcher
- mobile: compact header plus menu panel or drawer
- no locale logic in the component beyond displaying the current route state
- place the theme switcher adjacent to the language switcher on desktop

- [ ] **Step 5: Build the section components in the exact spec order**

Use the existing content source and the new fields from Task 4. Keep:

- hero first with strong B2B messaging
- services next
- trust strip before about
- TOP-CLEAN after references and before contact
- footer last with the existing localized footer text preserved

- [ ] **Step 6: Preserve the prepared-email form behavior inside `ContactSection.astro`**

Move the current `data-mail-form` behavior out of the old monolithic `HomePage.astro` and keep it attached to the new contact section markup.

Use the same behavior contract:

```astro
<form
  class="contact-form"
  data-mail-form
  data-mailto-subject={content.contact.mailtoSubject}
  data-label-name={content.contact.mailBodyLabels.name}
  data-label-company={content.contact.mailBodyLabels.company}
  data-label-email={content.contact.mailBodyLabels.email}
  data-label-phone={content.contact.mailBodyLabels.phone}
  data-label-message={content.contact.mailBodyLabels.message}
>
```

and keep the submit handler equivalent to:

```ts
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const subject = form.getAttribute("data-mailto-subject") || "";
  const lines = [
    `${form.getAttribute("data-label-name")}: ${formData.get("name") || ""}`,
    `${form.getAttribute("data-label-company")}: ${formData.get("company") || ""}`,
    `${form.getAttribute("data-label-email")}: ${formData.get("email") || ""}`,
    `${form.getAttribute("data-label-phone")}: ${formData.get("phone") || ""}`,
    "",
    `${form.getAttribute("data-label-message")}:`,
    `${formData.get("message") || ""}`
  ];
  window.location.href =
    `mailto:info@poseidon-service.hu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\\n"))}`;
});
```

- [ ] **Step 7: Run a build to catch Astro composition errors**

Run: `npm run build`
Expected: PASS with no missing import or prop-type errors

- [ ] **Step 8: Commit**

```bash
git add src/components/HomePage.astro src/components/site src/components/home
git commit -m "feat: split homepage into header and section components"
```

### Task 6: Apply The New Visual System, Responsive Layout, And Deployment Notes

**Files:**
- Create: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `README.md`

- [ ] **Step 1: Add light and dark design tokens in `src/styles/tokens.css`**

```css
:root {
  --bg: #f4f8fb;
  --surface: rgba(255, 255, 255, 0.88);
  --surface-strong: #ffffff;
  --text: #13263d;
  --muted: #546f87;
  --line: rgba(19, 38, 61, 0.12);
  --primary: #0089d3;
  --primary-strong: #0b6a74;
  --accent: #7de0d2;
}

html[data-theme="dark"] {
  --bg: #081527;
  --surface: rgba(17, 33, 52, 0.82);
  --surface-strong: #10233a;
  --text: #eef6ff;
  --muted: #9fb7cc;
  --line: rgba(238, 246, 255, 0.12);
  --primary: #2cbcc2;
  --primary-strong: #0d6b75;
  --accent: #8be6dd;
}
```

- [ ] **Step 2: Import the token file before `global.css`**

```astro
<style is:global>
  @import "../styles/tokens.css";
  @import "../styles/global.css";
</style>
```

- [ ] **Step 3: Rewrite `src/styles/global.css` around the new structure**

Make these changes in one pass:

- dark blue / teal hero and sticky header
- white or near-white panel sections in light mode
- dark panel variants in dark mode
- modern responsive header
- sliding pill styles for language and theme controls
- stronger trust strip and service cards
- later partner-company panel with distinct but secondary emphasis
- mobile-first breakpoints for header, hero, card grids, and contact layout
- reduced-motion support for transitions

- [ ] **Step 4: Run the full automated checks**

Run: `npm run check`
Expected: PASS with Astro type-checking and all unit tests green

- [ ] **Step 5: Run a local browser verification pass**

Run: `npm run dev`

Manually verify:

- `http://localhost:4321/` loads Hungarian content
- clicking `EN` sends the browser to `/en/`
- the theme toggle changes the UI immediately
- theme choice persists after a reload
- header, hero, services, references, partner section, and contact all stack correctly on mobile width

Run these routing checks in a second terminal while `npm run dev` is running:

- `curl -I -H 'cf-ipcountry: DE' http://127.0.0.1:4321/`
  Expected: `302` redirect with `Location: /en/`
- `curl -I -H 'cf-ipcountry: DE' -H 'Cookie: poseidon_locale=hu' http://127.0.0.1:4321/`
  Expected: `200` or non-redirect response for `/`

- [ ] **Step 6: Add Cloudflare Pages notes to `README.md`**

Add a short section covering:

- build command: `npm run build`
- Astro Cloudflare adapter requirement
- Cloudflare Pages geo header dependency (`CF-IPCountry`)
- locale cookie name `poseidon_locale`
- theme storage key `poseidon_theme`

- [ ] **Step 7: Run one final production build**

Run: `npm run build`
Expected: PASS and no regressions after README / style cleanup

- [ ] **Step 8: Commit**

```bash
git add src/styles/tokens.css src/styles/global.css src/layouts/BaseLayout.astro README.md
git commit -m "feat: finish themed homepage redesign"
```

## Final Verification Checklist

- [ ] `npm run test:unit`
- [ ] `npm run check`
- [ ] `npm run build`
- [ ] Manual check of `/` and `/en/`
- [ ] Manual check of theme persistence
- [ ] Manual check that TOP-CLEAN appears below the main Poseidon trust story
- [ ] Manual check that the contact form still opens a prepared email

## Expected End State

- Cloudflare Pages-compatible Astro app with request-time locale routing
- Stronger Poseidon-first B2B homepage hierarchy
- Route-based animated language switching
- Persistent light/dark mode toggle next to the language switcher
- TOP-CLEAN shown later as a related company, not equal co-branding
- Content still sourced centrally from `src/data/site.ts`
