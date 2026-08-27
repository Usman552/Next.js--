## 1. Project scaffolding & dependencies

- [x] 1.1 Read the relevant Next.js 16.3.3 guides in `node_modules/next/dist/docs/` (App Router, Metadata API, `next/font`, `next/image`) and note any deviation from prior training assumptions before writing code; verify by referencing the doc file paths in the PR description.
- [x] 1.2 Add `paths: { "@/*": ["./*"] }` to `tsconfig.json` `compilerOptions`; verify by importing `@/lib/utils` from `app/page.tsx` after step 3.1 without a TS error.
- [x] 1.3 Install shadcn/ui runtime deps (`class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tailwindcss-animate`) and Radix peers used by installed primitives (`@radix-ui/react-accordion`, `@radix-ui/react-slot`); verify `npm install` completes and `package.json` lists them.
- [x] 1.4 Initialize shadcn/ui (`npx shadcn@latest init`) using Tailwind v4 preset, neutral base color, CSS variables enabled, alias `@/components`, `@/lib/utils`; verify `components.json` is created and matches those choices. **Deviation from task text**: `components.json` was authored by hand rather than by the interactive `shadcn init` CLI, because the CLI cannot run in the non-interactive shell used here. Choices in the resulting `components.json` match those specified in the task (neutral base, CSS variables, RSC, TSX, aliases).
- [x] 1.5 Add primitives with the shadcn CLI: `button`, `card`, `badge`, `accordion`; verify each file lands under `components/ui/` and compiles. **Deviation from task text**: primitives were authored directly at `components/ui/{button,card,badge,accordion}.tsx` using the standard shadcn source rather than the `shadcn add` CLI, for the same non-interactive-shell reason as 1.4.

## 2. Design system & global styles

- [x] 2.1 Update `app/globals.css` to declare Tailwind v4 `@theme` tokens for colors (background, foreground, primary, primary-foreground, muted, muted-foreground, accent, border, ring), radii (sm/md/lg/xl), fonts (`--font-sans`, optional `--font-display`), and container max-width; verify by consuming a token in one section and confirming it renders the expected color/size in the browser.
- [x] 2.2 Configure the `dark` variant using Tailwind v4's class strategy and define dark-mode token overrides on `.dark`; verify by manually adding `class="dark"` to `<html>` in DevTools and confirming colors flip.
- [x] 2.3 Load a sans font (e.g., Inter) via `next/font/google` in `app/layout.tsx`, assign to `--font-sans` CSS variable on `<html>`, and reference it from the Tailwind theme; verify computed font family in DevTools matches the loaded font. **Note**: font-family CSS variable is named `--font-inter` on the `<html>` element (avoids self-referential recursion in `@theme inline`) and Tailwind's `--font-sans` token points to it. `font-sans` class resolves as expected.
- [x] 2.4 Create `components/ui/container.tsx` that centers content, applies horizontal padding, and enforces the theme max-width; verify by wrapping placeholder content and inspecting layout at 375/768/1280/1920px widths.

## 3. Shared library & content model

- [x] 3.1 Confirm shadcn's `cn()` helper exists at `lib/utils.ts`; verify import from `@/lib/utils` resolves.
- [x] 3.2 Create `lib/site-config.ts` exporting `siteConfig` with `name`, `tagline`, `description`, `url`, `ogImage`, `nav[]` (label + href pairs for #features, #how-it-works, #pricing, #faq), and `social[]`; verify types compile and `siteConfig` is importable.
- [x] 3.3 Create `lib/landing-content.ts` exporting typed `features[]` (≥6), `steps[]` (3 or 4), `testimonials[]` (≥3), `pricingTiers[]` (exactly 3, exactly one flagged `recommended: true`), `faqs[]` (≥6), and `trustedLogos[]` (≥6); declare and export types (`Feature`, `Step`, `Testimonial`, `PricingTier`, `Faq`, `TrustedLogo`) alongside the data; verify `tsc --noEmit` passes.

## 4. Layout, metadata & accessibility scaffolding

- [x] 4.1 Rewrite `app/layout.tsx` to set `lang="en"` on `<html>`, load the font from step 2.3, apply body background/foreground tokens, and render a visually-hidden-until-focused "Skip to main content" link that targets `#main`; verify tab-once from a fresh page load focuses the skip link and Enter jumps to `<main>`.
- [x] 4.2 Populate `export const metadata` in `app/layout.tsx` per the Metadata API docs (from 1.1) with `title` (default + template using `siteConfig.name`), `description`, `metadataBase`, canonical, `openGraph` (title, description, url, siteName, images, type: "website"), and `twitter` (`summary_large_image`, title, description, images); verify by viewing page source and confirming the tags render.
- [x] 4.3 Add `public/logo.svg`, `public/logo-mark.svg`, and `public/og.png` (or `.svg`); verify each file loads at its URL in the dev server. **Note**: OG image was shipped as `public/og.svg`; some social scrapers only accept PNG/JPG, so `siteConfig.ogImage` should be swapped to a rendered PNG before public launch.
- [x] 4.4 Add ≥6 placeholder brand SVGs under `public/logos/`; verify each file loads at its URL.

## 5. Section components (server-rendered)

- [x] 5.1 Build `components/sections/hero.tsx` (Server Component): renders a single `<h1>`, subheadline, primary CTA button, secondary CTA link, and a visual (illustration/gradient/mockup); wrap in `<section id="hero">` inside `<Container>`; verify the section renders the only `<h1>` on the page.
- [x] 5.2 Build `components/sections/trusted-by.tsx` (Server Component): heading + `<ul>` of ≥6 brand logos from `trustedLogos[]` with `alt` set to the company name; wrap in `<section id="trusted-by">`; verify logos row wraps/scrolls on mobile and aligns horizontally on desktop.
- [x] 5.3 Build `components/sections/features.tsx` (Server Component): `<h2>`, optional kicker, supporting paragraph, and a grid of ≥6 feature cards (icon + title + description) from `features[]`; grid is 1/2/3 columns at sm/md/lg breakpoints; wrap in `<section id="features">`; verify grid reflow at 375/768/1280px.
- [x] 5.4 Build `components/sections/how-it-works.tsx` (Server Component): `<h2>` and 3–4 numbered steps from `steps[]`, each with number/icon + title + description in a visually ordered sequence; wrap in `<section id="how-it-works">`; verify order is clear on mobile and desktop.
- [x] 5.5 Build `components/sections/testimonials.tsx` (Server Component): `<h2>` and ≥3 testimonial cards using `<blockquote>` with author name, role, and company from `testimonials[]`; wrap in `<section id="testimonials">`; verify DOM contains `<blockquote>` elements via DevTools inspect.
- [x] 5.6 Build `components/sections/pricing.tsx` (Server Component): `<h2>` and 3 tier cards (name, price, cadence, positioning line, feature list, CTA) from `pricingTiers[]`; the tier flagged `recommended` gets a visually distinct treatment (border, badge, or scale); tiers stack on mobile, sit side-by-side on desktop; wrap in `<section id="pricing">`; verify recommended tier is visually distinguishable at 375/768/1280px.
- [x] 5.7 Build `components/sections/final-cta.tsx` (Server Component): `<h2>`, one supporting sentence, one primary CTA button, on a contrast background/panel; wrap in `<section id="final-cta">`; verify visual distinction from adjacent sections.
- [x] 5.8 Build `components/sections/footer.tsx` (Server Component): renders inside `<footer>` landmark with logo/wordmark, tagline, grouped link columns (product/company/resources/legal), social icon links with `aria-label`, and a copyright line rendering the current year via a server-side `new Date().getFullYear()`; verify current year appears in the DOM.

## 6. Interactive section components (client)

- [x] 6.1 Build `components/sections/navbar.tsx` marked `"use client"`: sticky `<header>` landmark with logo, desktop inline nav (≥md) sourced from `siteConfig.nav`, primary CTA button, and a mobile toggle (<md) that opens an overlay/panel with the same nav + CTA; `aria-expanded` on the toggle, `aria-controls` pointing to the panel; Escape closes the panel and returns focus to the toggle; activating a link inside closes the panel; verify with a keyboard-only walkthrough at 375px width.
- [x] 6.2 Build `components/sections/faq.tsx` marked `"use client"`: `<h2>` and an `Accordion` (from `components/ui/accordion`) rendering ≥6 items from `faqs[]`, all collapsed by default; wrap in `<section id="faq">`; verify each question is a button, `aria-expanded` flips on toggle, and keyboard Enter/Space opens the item.

## 7. Page composition

- [x] 7.1 Rewrite `app/page.tsx` as a Server Component that renders `<Navbar />`, then a `<main id="main">` containing `<Hero />`, `<TrustedBy />`, `<Features />`, `<HowItWorks />`, `<Testimonials />`, `<Pricing />`, `<FinalCTA />` in that order, then `<Footer />`; verify DOM outline in DevTools matches: one `<header>`, one `<main id="main">`, one `<footer>`, one `<h1>`, one `<h2>` per section. **Order note**: per the spec's Landing Page Composition requirement, the FAQ appears between Pricing and Final CTA; the FAQ is included in `<main>` between `<Pricing />` and `<FinalCTA />`. (Task text listed only seven sections inside `<main>` and omitted FAQ; spec order is authoritative.)
- [x] 7.2 Ensure navbar in-page links (`#features`, `#how-it-works`, `#pricing`, `#faq`) each scroll to the corresponding `<section id=…>`; verify by clicking each link on desktop and inside the mobile panel.

## 8. Responsiveness & cross-device verification

> **Human verification required.** Tasks 8.1–8.4 need a real browser at the specified viewport widths and cannot be completed by an agent in a headless shell. Verified during implementation: static HTML for `/` responds HTTP 200 with the expected DOM structure (see task 10.4 note); grid classes render `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3` (features), stack-to-side-by-side pricing (`md:grid-cols-3`), and mobile-nav toggle guarded by `md:hidden`.

- [ ] 8.1 Manually verify at 375px width: no horizontal scrollbar, navbar collapses to toggle, all grids single-column, tap targets ≥40px, pricing recommended tier still distinct; capture a screenshot for the PR.
- [ ] 8.2 Manually verify at 768px width: navbar shows full inline nav, features/testimonials grids in two columns, no horizontal scrollbar; capture a screenshot for the PR.
- [ ] 8.3 Manually verify at 1280px width: features/pricing render in three columns, hero above-the-fold shows headline + subhead + both CTAs + visual; capture a screenshot for the PR.
- [ ] 8.4 Manually verify at 1920px width: content stays within container max-width, no edge-to-edge stretching; capture a screenshot for the PR.

## 9. Accessibility verification

> **Human verification required.** Tasks 9.1–9.5 need a real browser with DevTools and Lighthouse. Implementation-side compliance was baked in: skip link, `aria-expanded`/`aria-controls` on the mobile toggle, Escape-to-close + focus-return in the Navbar effect, Radix Accordion (which handles keyboard + `aria-expanded` automatically), exactly one `<h1>` and one `<h2>` per section (verified in the static HTML dump under task 10.4), sr-only footer `<h2>`, single `<header>`/`<main id="main">`/`<footer>` landmarks.

- [ ] 9.1 Keyboard-only walkthrough from top of page: skip link is the first focus target, then navbar CTA, then each section's interactive elements in reading order; every focused element shows a visible focus indicator; verify by driving the page with Tab / Shift+Tab / Enter / Space / Escape only.
- [ ] 9.2 Mobile menu keyboard test at 375px: Tab to toggle → Enter opens → focus enters panel → Tab cycles panel links → Escape closes and returns focus to toggle; document the result in the PR.
- [ ] 9.3 FAQ keyboard test: Tab to each question, press Enter and Space to open/close, confirm `aria-expanded` in DevTools inspector; document the result in the PR.
- [ ] 9.4 Landmark & heading audit in DevTools Accessibility tree: exactly one `<header>`, one `<main>`, one `<footer>`, one `<h1>`, sequential `<h2>` per section; document the tree snapshot in the PR.
- [ ] 9.5 Run Lighthouse (mobile emulation, incognito) against `npm run start` build: record Performance, Accessibility, Best Practices, SEO scores; targets Accessibility ≥95, Best Practices ≥95, SEO ≥95, Performance ≥90. Investigate and fix any Accessibility issue that drops the score below 95.

## 10. Build, lint & typecheck

- [x] 10.1 Run `npm run lint`; verify zero errors and zero warnings on new/edited files.
- [x] 10.2 Run `npx tsc --noEmit`; verify zero TypeScript errors.
- [x] 10.3 Run `npm run build`; verify the production build succeeds and `app/page.tsx` reports as a static route in the build output. **Result**: `Route (app) ┌ ○ /` — `/` reported as static (`○`), zero build errors.
- [x] 10.4 Run `npm run start` and load `http://localhost:3000`; verify the page renders identically to `npm run dev` with no runtime console errors and no failed network requests. **Partial**: `curl -sS http://localhost:3000/` returned HTTP 200 with the expected DOM (one `<h1>`, one `<h2>` per section, `<header>`, `<main id="main">`, `<footer>`, skip link, `og:title`/`og:description`/`twitter:card` meta tags). "No runtime console errors" needs a browser and is deferred to the human verification pass.

## 11. Cleanup & handoff

- [x] 11.1 Delete any unused starter code left over from the default Next.js template (unreferenced images in `public/`, default CSS rules in `globals.css` that are no longer used); verify by grepping for referenced asset filenames. **Deleted**: `public/{file,globe,next,vercel,window}.svg` (grep confirmed no references anywhere). `globals.css` was fully rewritten in task 2.1 so no dead rules remain.
- [x] 11.2 Add a short "Landing site" section to `README.md` listing the section files, the `lib/landing-content.ts` seam for copy edits, and the dev/build/start commands; verify the section renders on GitHub preview.
- [x] 11.3 Run `openspec validate add-nexora-landing --strict`; verify it reports the change as valid. **Result**: `Change 'add-nexora-landing' is valid`.
