# Poseidon Homepage Redesign Design

## Summary

Redesign the current Astro draft into a sharper, more modern, JavaScript-enhanced bilingual marketing site for Poseidon Service Kft. The new site should preserve the trust and business-first tone of the live Poseidon website while replacing its dated structure with a responsive, image-led, interactive layout built for larger B2B customers.

The visual direction is a hybrid of the explored concepts:

- Use the `Control Room` direction for the hero, CTA treatment, image rhythm, and header behavior.
- Use the `Heritage Panels` direction for section framing and for the placement of the related TOP-CLEAN brand later in the page.
- Keep Poseidon as the clear primary brand.
- Introduce TOP-CLEAN 87' Kft. as a related company in a dedicated lower-page partner section rather than in the hero or top narrative.

The site should remain route-based by language:

- Hungarian at `/`
- English at `/en/`

Language switching should feel interactive and app-like, but still navigate between localized URLs instead of swapping content on a single page.

Deployment target is Cloudflare Pages, with server-side geo-aware locale routing for first-time visits.

## Goals

- Make the homepage feel more credible, modern, and operationally serious for business buyers.
- Match the legacy Poseidon design language more closely than the current green editorial Astro draft.
- Improve the bilingual UX with an animated route-based switcher.
- Keep the page conversion-focused: services, trust, references, and contact should all become easier to scan and reach.
- Prepare the site for future brand convergence with TOP-CLEAN without implying a false shared origin story.

## Audience And Positioning

Primary audience:

- Facility managers
- Operations leads
- Procurement decision-makers
- Representatives of industrial, office, logistics, retail, and healthcare sites

Positioning:

- Poseidon is the lead business-facing brand on this site.
- The site should communicate capability, reliability, and coverage, not consumer-friendly home-cleaning energy.
- Copy and visuals should avoid suggesting private household cleaning as the primary offer.

## Information Architecture

Homepage structure, in order:

1. Sticky header
2. Hero
3. Service overview
4. Trust / references strip
5. About / operating approach
6. Pricing guidance
7. Expanded references
8. Related company section for TOP-CLEAN
9. Contact section
10. Footer

Notes:

- The top of the page should establish B2B fit before any long-form descriptive content.
- References should move higher than in the current Astro draft.
- TOP-CLEAN should not appear in the hero, top nav, or primary trust narrative.
- The partner-company section should appear after Poseidon's own capability and trust sections are established.

## Visual And Interaction Direction

### Visual system

- Base palette should move from the current draft's soft green direction to a Poseidon-led blue and teal system inspired by the live site.
- Use a dark blue / teal hero and header treatment with white or near-white framed content panels below.
- Maintain high contrast, with restrained accent use.
- Typography should feel more corporate and stable than editorial. The live site's utilitarian clarity is the anchor; the redesign adds polish and hierarchy, not softness.
- Photography should stay real-work focused and support industrial, office, healthcare, and large-facility cleaning contexts.

### Header

- Sticky header on desktop and mobile.
- Clear brand lockup, compact nav, and animated language switcher.
- Header should compress cleanly at smaller breakpoints.
- Mobile nav should feel deliberate and contemporary, not like a default Astro drawer.

### Hero

- Large business-facing headline.
- Supporting copy focused on larger commercial / institutional work.
- Two CTAs:
  - Primary: quote / contact
  - Secondary: services
- Image composition should use one dominant work image and supporting secondary images.
- Trust stats may remain in the hero, but they should read as operational proof, not startup vanity metrics.

### Language switcher

- Use a sliding pill segmented control in the header.
- Active language state must be visually strong and obvious.
- Interaction should animate on hover / press and during page navigation.
- Switching language must navigate to the localized route instead of mutating page state in place.
- The switcher should be present in both desktop and mobile header contexts.

### Motion

- Motion should be purposeful and restrained.
- Use:
  - header / switcher transitions
  - content reveal on load
  - light hover motion on buttons, cards, and trust elements
- Avoid heavy parallax, scroll-jacking, or theatrical animation.

## Content Model

Keep the existing two-locale content model as the source of truth, but evolve the presentation:

- Shared section structure between locales
- Locale-specific copy for navigation, CTAs, body copy, and contact labels
- Reuse the current service, pricing, references, and contact datasets where possible
- Adjust copy emphasis so the top sections speak more directly to larger businesses

Current implementation source of truth:

- localized copy and structured business content live in `src/data/site.ts`
- homepage layout currently lives in `src/components/HomePage.astro`
- existing image assets live in `public/images/`

TOP-CLEAN content:

- Add a small, explicit related-company content block
- Include:
  - company name
  - short description
  - link to `https://topclean87kft.hu/`
  - language-appropriate label that makes the relationship clear without overstating integration

Do not:

- merge the two company histories
- rewrite Poseidon as a group umbrella brand
- treat TOP-CLEAN content as equal priority on the homepage

## Routing And Locale Behavior

Localized routes:

- `/` serves Hungarian
- `/en/` serves English

Locale routing rules:

- Explicit localized routes must always be respected.
- Automatic geo-based routing applies only to first-time entry behavior, not to every request forever.
- If a visitor arrives without a saved preference:
  - visitors from Hungary should land on Hungarian
  - visitors from outside Hungary should land on English
- After a manual language switch, the chosen locale should be remembered and should override geo-based defaults on subsequent visits.

Recommended persistence behavior:

- Store the visitor's chosen locale in a cookie.
- Use the cookie first, then geolocation fallback, then default to English if country data is missing or ambiguous.

Routing precedence:

1. Requests to `/en/` always render English and are never geo-redirected.
2. Requests to `/` from known bots / crawlers render the Hungarian canonical page directly, without geo-based redirect behavior.
3. Requests to `/` from human visitors use saved locale preference first.
4. If no preference exists, use Cloudflare country data:
   - `HU` stays on `/`
   - any other country redirects to `/en/`
5. If country data is unavailable, default `/` entry behavior to English for human first-time visits.

This design accepts that `/` remains the Hungarian canonical route while Cloudflare-driven first-visit behavior may redirect some non-Hungarian human visitors to `/en/`.

## Platform And Deployment Direction

Target platform:

- Cloudflare Pages

Rendering model:

- Use Astro with Cloudflare-compatible server rendering or hybrid rendering so request-time locale routing is possible.
- Keep the content mostly static where possible, but allow request-aware handling for locale entry behavior.

Platform-specific design assumptions:

- Cloudflare geolocation data will be used for first-visit locale routing.
- The site should be deployable through Cloudflare Pages without introducing a separate backend service.
- Contact handling should remain lightweight unless implementation discovers a clear need to replace the current mail-based approach.

## Section-Level Behavior

### Service overview

- Present service categories as strong scannable cards.
- Emphasize industrial, office, healthcare, glass cleaning, machine floor care, and operational support.
- Ensure cards scale cleanly across mobile, tablet, and wide desktop.

### Trust / references strip

- Introduce recognizable client names and sectors earlier than in the current draft.
- This section should quickly answer: "Have they done this kind of work for serious customers?"

### About / operating approach

- Keep the message grounded in experience, technology, and continuous quality control.
- Shorter and easier to scan than the current card-heavy draft.

### Pricing guidance

- Keep the pricing table or structured range guidance.
- Continue to frame prices as indicative, with exact quotes following site inspection / assessment.

### Related company section

- Clearly marked as a related company / partner company section.
- Include a clean outbound CTA to TOP-CLEAN.
- Visually consistent with the site, but distinct enough that it reads as a relationship block, not a second primary homepage.

### Contact

- Keep direct business contact pathways visible.
- Preserve leadership contacts and business contact details.
- The contact form can remain lightweight in the design; implementation can determine whether to keep `mailto` or move to an actual form endpoint.

## Accessibility And Responsiveness

- The site must remain fully usable on desktop and mobile.
- Header, switcher, nav, and CTA hierarchy must all work cleanly at narrow widths.
- Language switcher and navigation must be keyboard accessible.
- Motion should respect reduced-motion preferences.
- Contrast should remain strong across dark hero sections and light content panels.

## SEO And Metadata

- Maintain separate localized URLs for Hungarian and English.
- Preserve localized titles, descriptions, canonical tags, and language attributes.
- Language switch links should be crawlable.
- Geo-based routing must not override explicit locale URLs.

## Out Of Scope For This Redesign

- Full multi-page expansion beyond the current homepage-focused marketing site
- Deep company-group architecture spanning both brands
- Shared CMS or shared backend across Poseidon and TOP-CLEAN
- Complex lead management backend
- Rewriting TOP-CLEAN into the same codebase

## Acceptance Criteria

- The redesigned homepage clearly feels closer to the live Poseidon brand than the current Astro draft.
- The hero is more business-focused, image-led, and conversion-oriented.
- The language switcher is animated, route-based, and usable on both desktop and mobile.
- The page hierarchy favors services, proof, and contact over generic descriptive copy.
- TOP-CLEAN appears as a later related-company section, not as co-primary branding.
- The site design is compatible with Cloudflare Pages deployment and first-visit geo-aware locale routing.

## Open Implementation Decisions Intentionally Deferred

These are implementation-level choices, not design blockers:

- whether locale persistence uses a cookie only or cookie plus client-side storage
- whether contact remains `mailto`-based or moves to a Cloudflare-backed form handler
- the exact animation library or whether CSS-only motion is sufficient
- whether locale entry behavior is implemented in Astro middleware, Cloudflare Pages Functions, or another Cloudflare-compatible request layer
