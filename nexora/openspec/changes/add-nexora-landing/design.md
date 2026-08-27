## Context

See `proposal.md` for motivation. This design covers the *how* — the technical shape of the marketing site inside the existing repo.

Repo state today: Next.js 16.3.3 (App Router), React 19.2, TypeScript 5, Tailwind CSS v4 via `@tailwindcss/postcss`. `app/` contains only the default starter (`layout.tsx`, `page.tsx`, `globals.css`). There is no `components/`, `lib/`, `hooks/`, or `public/`-hosted brand asset yet. There is no `tsconfig.json` `paths` alias configured yet, no shadcn/ui setup (no `components.json`), and no `next.config.ts` customization relevant to this work.

Repo-specific constraint (see `AGENTS.md`): this Next.js version may diverge from training data — before writing implementation code, the relevant guide under `node_modules/next/dist/docs/` must be consulted. This design therefore avoids locking in any Next.js API detail that the docs could contradict (e.g., font loading module path, metadata API shape, image component props); those specifics are deferred to the implementation.

## Goals / Non-Goals

**Goals:**
- One page (`app/page.tsx`) composed of ten section components; page file stays small (composition only).
- Reusable component split: shadcn/ui primitives in `components/ui/`, one section component per landing section in `components/sections/`.
- All copy lives in a typed, static data module (`lib/landing-content.ts`) so section components stay pure and presentational.
- Server Components by default; opt into `"use client"` only where interactivity requires it (mobile nav toggle, accordion).
- Design system driven by Tailwind theme tokens declared once in `app/globals.css` (Tailwind v4's CSS-first `@theme` configuration).
- Accessibility baked in from first commit: landmarks, heading order, focus visibility, skip link, contrast tokens.
- Deployable as a static build with no environment variables, no API routes, no data fetching.

**Non-Goals:**
- Authentication, user state, backend integration, database, analytics, cookie banner, i18n, blog/CMS, dark-mode toggle UI (dark-mode-ready styling only), animation libraries beyond `tailwindcss-animate`.
- Custom design tokens beyond what the ten sections actually consume — no speculative token library.

## Decisions

### D1. App Router with a single Server Component page
Compose `app/page.tsx` as a Server Component that imports and renders the ten section components. Sections are Server Components unless they need client-side state.

- **Why**: Landing pages are pure content. Server rendering ships zero JS for most sections and keeps LCP low. Client boundaries stay minimal and explicit.
- **Alternatives considered**: Pages Router (rejected — App Router is the current default and this repo is already on App Router); marking the whole page `"use client"` (rejected — needlessly ships all copy as JS).

### D2. Client boundaries: only Navbar and FAQ
The Navbar is client-side because the mobile menu has open/closed state. The FAQ is client-side because the accordion needs disclosure state. Every other section — Hero, TrustedBy, Features, HowItWorks, Testimonials, Pricing, FinalCTA, Footer — remains server-rendered.

- **Why**: Keeps the client bundle to the smallest possible surface. Also isolates the two things most likely to need behavioral tweaks.
- **Alternatives considered**: Handling the mobile menu with a CSS-only `<details>`/checkbox trick (rejected — worse a11y story than a proper `aria-expanded` button + focus management).

### D3. Component directory layout
```
components/
  ui/                  # shadcn primitives (button, card, accordion, badge, container, etc.)
  sections/            # one file per landing section
    navbar.tsx
    hero.tsx
    trusted-by.tsx
    features.tsx
    how-it-works.tsx
    testimonials.tsx
    pricing.tsx
    faq.tsx
    final-cta.tsx
    footer.tsx
  icons/               # small wrappers around lucide-react icons if we need branded icon components
lib/
  utils.ts             # shadcn cn()
  site-config.ts       # site name, tagline, nav links, social links, base URL
  landing-content.ts   # typed content: features[], steps[], testimonials[], pricingTiers[], faqs[], trustedLogos[]
```
- **Why**: `ui/` vs. `sections/` is the standard shadcn split and keeps the mental model clear (primitive vs. composed section). One file per section keeps diffs surgical when a section is restyled.
- **Alternatives considered**: A single `sections.tsx` barrel (rejected — merge conflicts and unclear ownership); nesting section components in colocated folders with their own tests (rejected — over-engineered for static copy).

### D4. Content model in a typed data module
`lib/landing-content.ts` exports typed arrays consumed by sections. Types are declared inline (e.g., `Feature`, `PricingTier`, `Testimonial`, `Faq`, `Step`, `TrustedLogo`). Sections either import the arrays directly (simplest) or receive them as props (if a section is reused elsewhere later).

- **Why**: One place to change copy. Sections stay presentational. TypeScript catches shape drift.
- **Alternatives considered**: MDX per section (rejected — heavier tooling for copy that rarely changes); a headless CMS (explicitly a non-goal); JSON files (rejected — no type safety without a schema layer).

### D5. Tailwind v4 CSS-first theming
Tailwind v4's `@theme` directive in `app/globals.css` defines color, radius, font, and spacing tokens. No `tailwind.config.ts`. Dark mode is class-based (`dark:` variants written but no toggle shipped).

- **Why**: Matches Tailwind v4's recommended workflow, avoids maintaining a JS config, and keeps the design system in one file.
- **Alternatives considered**: Reintroducing `tailwind.config.ts` (rejected — v4-idiomatic path is CSS-first); CSS variables applied per-component (rejected — inconsistent, easy to drift).
- **Verification**: Implementation must consult `node_modules/next/dist/docs/` and Tailwind v4 conventions before finalizing token names and dark-mode syntax — this design fixes the *approach*, not the exact directive spelling.

### D6. shadcn/ui as the primitive layer
Install shadcn/ui with the neutral base color and Tailwind CSS variables. Install only the primitives the ten sections need: `button`, `card`, `badge`, `accordion`, and a hand-rolled `container` if shadcn doesn't ship one.

- **Why**: shadcn generates components into `components/ui/`, so we own the code and can restyle. It integrates cleanly with Tailwind and Radix's a11y-tested primitives (accordion, dialog if needed later).
- **Alternatives considered**: Radix directly (rejected — more boilerplate, no premade styling); Headless UI (rejected — thinner primitive set); MUI/Chakra (rejected — heavier, opinionated design language that fights a bespoke SaaS look).

### D7. Icons via `lucide-react`
All icons come from `lucide-react`. No inline SVG in section components except the Nexora wordmark/logomark.

- **Why**: `lucide-react` is shadcn's default, tree-shakes per icon, and gives a consistent visual weight.

### D8. Path alias `@/*`
Add `paths: { "@/*": ["./*"] }` in `tsconfig.json` so imports read `@/components/sections/hero` and `@/lib/landing-content`.

- **Why**: shadcn CLI expects `@/*`. Consistent with community convention.

### D9. Fonts via `next/font`
Use `next/font/google` to load one sans (Inter or similar) and optionally one display font, assigned to CSS variables and referenced by Tailwind theme tokens.

- **Why**: `next/font` self-hosts, avoids layout shift, and requires no runtime request. Assigning to a CSS variable keeps Tailwind theme tokens the single source of truth.
- **Verification**: The exact `next/font` import path/module is version-sensitive — implementer must confirm against `node_modules/next/dist/docs/` for 16.3.3.

### D10. Placeholder assets
Store static assets under `public/`:
- `public/logo.svg`, `public/logo-mark.svg` — Nexora wordmark and mark.
- `public/og.png` (or `.svg`) — social share image.
- `public/logos/{acme,globex,initech,umbrella,soylent,wayneenterprises}.svg` — placeholder brand marks for the TrustedBy row.
- `public/avatars/*.svg` — placeholder testimonial avatars (optional; may use initials in a colored circle instead).

Placeholders are simple SVGs so the site renders without any external fetch and stays under source control.

- **Alternatives considered**: External image URLs (rejected — introduces network dependency and possible outages); AI-generated bitmap logos (rejected — heavier, potentially licensed).

### D11. In-page navigation via anchors
Navbar links use in-page anchors (`#features`, `#how-it-works`, `#pricing`, `#faq`). Each section wraps its content in a `<section id="...">`. Skip link targets `#main`.

- **Why**: The whole site is one page. Anchors are the correct primitive and require no client-side router work.

### D12. Section container pattern
A small `<Container>` component in `components/ui/container.tsx` enforces max-width, horizontal padding, and centering. Every section wraps its content in `<Container>` so page-level rhythm and gutters stay consistent.

- **Why**: One place to change gutters/max-widths. Prevents each section from inventing its own padding.

## Risks / Trade-offs

- **Placeholder brand logos may feel generic** → Ship named placeholders (Acme, Globex, etc.) with an explicit note in `lib/landing-content.ts` that these are placeholders; replacing them is a copy-only diff.
- **Static content means marketing edits require a code change** → Acceptable at this stage; the `lib/landing-content.ts` seam makes those changes a one-file, one-line-of-code edit. Moving to a CMS is a follow-up capability.
- **Tailwind v4 + shadcn/ui integration is newer than most tutorials** → Implementation task explicitly requires consulting Tailwind v4 docs and shadcn's Tailwind v4 install path; do not copy Tailwind v3 config patterns.
- **Client boundary drift** → Reviewers should flag any new `"use client"` directive added to a section other than Navbar or FAQ.
- **Accessibility can silently regress** → Manual keyboard walkthrough is a required step in `tasks.md`; automated Lighthouse a11y ≥95 is the exit gate.
- **Copy in a TS module is not translator-friendly** → i18n is a non-goal now; when introduced, `lib/landing-content.ts` becomes the point where a translation loader is wired in.

## Migration Plan

This is greenfield content — no data migration. Deploy path:
1. Merge on `redux-practice` branch or a feature branch (implementer's choice; discuss with user before pushing).
2. `next build` locally must succeed with zero TypeScript errors and zero ESLint warnings on new files.
3. Manual smoke test at 375px, 768px, 1280px, and 1920px widths.
4. Keyboard walkthrough: tab from top of page through every interactive element; confirm focus visibility and skip link.
5. Lighthouse (mobile) targets: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥95.

Rollback: revert the merge commit — the default Next.js starter returns and the site remains buildable.
