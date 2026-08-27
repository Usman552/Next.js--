## Why

Nexora needs a public-facing marketing website so prospective customers can understand the product, evaluate its value, and be motivated to sign up when the product goes live. The repository currently ships only the default Next.js starter (`app/page.tsx`), so there is nothing to show visitors. A premium, responsive landing page is the foundation for launch: it is the single asset every future channel (ads, docs, launch posts, partnerships) will link to, and without it downstream work (auth, dashboard, docs) has no entry point.

## What Changes

- Add a full public marketing landing page rendered from `app/page.tsx` as a Server Component, composed of ten well-defined sections in this order: Navbar, Hero, Trusted Companies, Features, How It Works, Testimonials, Pricing, FAQ, Final CTA, Footer.
- Add a reusable component library under `components/` split into:
  - `components/ui/` — primitive shadcn/ui components (button, card, accordion, badge, container, etc.) installed via the shadcn CLI.
  - `components/sections/` — one component per landing section (`Navbar`, `Hero`, `TrustedBy`, `Features`, `HowItWorks`, `Testimonials`, `Pricing`, `FAQ`, `FinalCTA`, `Footer`).
- Add a `lib/` folder containing:
  - `lib/utils.ts` — the shadcn `cn()` helper.
  - `lib/site-config.ts` — the site metadata used by `<head>`, footer, and social links.
  - `lib/landing-content.ts` — static content (features, steps, testimonials, pricing tiers, FAQs, trusted-company logos) so section components stay presentational.
- Configure Tailwind CSS v4 tokens (colors, typography, radius, spacing) in `app/globals.css` to establish a consistent premium design system, plus dark-mode readiness via the `class` strategy on `<html>`.
- Update `app/layout.tsx` with SEO metadata (title, description, Open Graph, canonical), the site font, `lang="en"`, and a skip-to-content link for accessibility.
- Add placeholder assets under `public/` (logo mark, OG image, trusted-company logo placeholders) so the site renders without external dependencies.

Non-goals (explicitly out of scope for this change):
- No authentication, no Keycloak, no session management.
- No API routes, database, or backend services.
- No CMS integration — all copy is static in `lib/landing-content.ts`.
- No signup, waitlist, or contact form submission handling — CTAs are visual links only for now.
- No analytics, cookie banner, or i18n.

## Capabilities

### New Capabilities
- `marketing-site`: The public, unauthenticated marketing surface for Nexora — the landing page, its section composition, its design-system contract, its content model, and its accessibility and responsiveness guarantees. Owns everything a visitor sees before signing in.

### Modified Capabilities
<!-- None. No existing specs to modify. -->

## Impact

- **Code**: New `components/` and `lib/` directories; rewritten `app/page.tsx` and `app/layout.tsx`; updated `app/globals.css` with Tailwind v4 theme tokens.
- **Assets**: New files under `public/` (logo, OG image, placeholder brand marks).
- **Dependencies**: Adds shadcn/ui and its peer deps — `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tailwindcss-animate`, `@radix-ui/react-accordion`, `@radix-ui/react-slot`. No changes to Next.js, React, or Tailwind major versions.
- **Config**: Adds `components.json` (shadcn config) and `tsconfig.json` `paths` alias `@/*` if not already present.
- **APIs/Backend**: None affected.
- **Runtime**: All sections render as Server Components except the Navbar (mobile menu toggle) and FAQ (accordion), which are marked `"use client"`. No new environment variables.
