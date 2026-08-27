## Purpose

The marketing-site capability defines Nexora's public, unauthenticated web presence — the landing page that describes the product, its value, its pricing, and its social proof — so that visitors can evaluate Nexora and be motivated to convert once product signup exists.

## ADDED Requirements

### Requirement: Landing page composition
The system SHALL render a single landing page at the site root (`/`) composed of these ten sections in this exact top-to-bottom order: Navbar, Hero, Trusted Companies, Features, How It Works, Testimonials, Pricing, FAQ, Final CTA, Footer.

#### Scenario: Visitor loads the root URL
- **WHEN** an unauthenticated visitor requests `/`
- **THEN** the response is a fully rendered HTML page containing all ten sections in the specified order
- **AND** each section is individually addressable by an in-page anchor (e.g., `#features`, `#pricing`, `#faq`) so navbar links can scroll to it

#### Scenario: Section is missing content
- **WHEN** a section's content source is empty (e.g., no testimonials)
- **THEN** the section container SHALL still be present in the DOM but render a documented empty state rather than crashing or being omitted silently

### Requirement: Responsive layout
The system SHALL render correctly and remain usable at viewport widths from 320px to 1920px without horizontal scrolling.

#### Scenario: Mobile viewport (≤640px)
- **WHEN** the page is viewed at 375px width
- **THEN** the navbar collapses its links behind a toggle control
- **AND** multi-column grids (features, pricing, testimonials, footer) reflow to a single column
- **AND** no element causes a horizontal scrollbar

#### Scenario: Tablet viewport (641–1024px)
- **WHEN** the page is viewed at 768px width
- **THEN** multi-column grids render in two columns where the design specifies
- **AND** the navbar shows its full link set

#### Scenario: Desktop viewport (≥1025px)
- **WHEN** the page is viewed at 1280px width
- **THEN** feature and pricing grids render in three columns
- **AND** page content is centered inside a max-width container so it does not stretch edge-to-edge on ultrawide displays

### Requirement: Responsive navbar behavior
The navbar SHALL provide primary navigation on all viewports and adapt its interaction pattern to available space.

#### Scenario: Desktop navigation
- **WHEN** the viewport is ≥768px wide
- **THEN** the navbar displays the site logo, in-page anchor links (Features, How It Works, Pricing, FAQ), and a primary CTA button inline

#### Scenario: Mobile menu toggle
- **WHEN** the viewport is <768px wide and the user activates the menu toggle
- **THEN** an overlay or panel reveals the same navigation links and CTA
- **AND** the toggle control's `aria-expanded` reflects the open/closed state
- **AND** activating a link inside the panel closes the panel and scrolls to the corresponding section

#### Scenario: Keyboard-only user opens mobile menu
- **WHEN** a keyboard-only user tabs to the menu toggle and presses Enter or Space
- **THEN** the menu opens
- **AND** focus moves into the first focusable element inside the menu
- **AND** pressing Escape closes the menu and returns focus to the toggle

### Requirement: Hero section content
The Hero section SHALL communicate what Nexora is, who it is for, and the primary action a visitor should take, above the fold on a 1440×900 desktop viewport.

#### Scenario: Hero is rendered
- **WHEN** the page loads
- **THEN** the Hero section contains: a headline, a supporting subheadline, a primary CTA button, a secondary CTA link, and a supporting visual (product mockup, illustration, or gradient composition)
- **AND** the primary CTA is visually the most prominent interactive element in the section

### Requirement: Trusted companies section
The Trusted Companies section SHALL display recognizable social-proof marks and label them as such.

#### Scenario: Logos are rendered
- **WHEN** the page loads
- **THEN** the section shows a heading identifying the row as trusted-by/customers-of/used-by
- **AND** at least six brand marks render in a horizontally-aligned row on desktop and wrap or scroll on mobile
- **AND** each mark has descriptive alternative text naming the company

### Requirement: Features section
The Features section SHALL present the product's core value propositions as a scannable grid.

#### Scenario: Features render
- **WHEN** the page loads
- **THEN** the section shows a heading, an optional eyebrow/kicker, and a supporting paragraph
- **AND** at least six feature cards render, each with an icon, a short title, and a one-to-two-sentence description
- **AND** on desktop the cards render in a three-column grid; on tablet two columns; on mobile one column

### Requirement: How It Works section
The How It Works section SHALL explain the product experience as an ordered sequence of steps.

#### Scenario: Steps render
- **WHEN** the page loads
- **THEN** the section renders exactly three or four numbered steps
- **AND** each step has a number or icon, a short title, and a supporting description
- **AND** steps are visually ordered so a reader understands the sequence at a glance

### Requirement: Testimonials section
The Testimonials section SHALL present quoted customer feedback attributed to a named person, role, and company.

#### Scenario: Testimonials render
- **WHEN** the page loads
- **THEN** the section shows at least three testimonial cards
- **AND** each card contains the quoted text, the author's name, the author's role/company, and optionally an avatar
- **AND** quotes are marked up as `<blockquote>` so assistive tech recognizes them as quotations

### Requirement: Pricing section
The Pricing section SHALL present distinct plan tiers so a visitor can compare and select.

#### Scenario: Tiers render
- **WHEN** the page loads
- **THEN** the section shows exactly three tiers side-by-side on desktop (Starter, Pro, Enterprise or equivalents)
- **AND** each tier displays: name, price, billing cadence, a short positioning line, a bulleted feature list, and a CTA button
- **AND** exactly one tier is visually marked as recommended/most popular

#### Scenario: Tiers on mobile
- **WHEN** the section is viewed at <768px
- **THEN** tiers stack vertically in a single column
- **AND** the recommended tier remains visually distinct from the others

### Requirement: FAQ section
The FAQ section SHALL provide expand/collapse answers to common questions with accessible disclosure semantics.

#### Scenario: FAQ renders
- **WHEN** the page loads
- **THEN** the section shows at least six questions, each collapsed by default
- **AND** questions render as buttons whose `aria-expanded` reflects open state
- **AND** activating a question toggles its answer's visibility

#### Scenario: Keyboard interaction
- **WHEN** a keyboard-only user tabs to a question and presses Enter or Space
- **THEN** the corresponding answer opens
- **AND** the visible focus indicator remains on the activated question

### Requirement: Final CTA section
The Final CTA section SHALL present a single dominant conversion prompt as the last content section before the footer.

#### Scenario: Final CTA renders
- **WHEN** the page loads
- **THEN** the section contains a short headline, one supporting sentence, and a single primary CTA button
- **AND** the section is visually distinct from surrounding sections (contrast background, panel, or gradient)

### Requirement: Footer
The Footer SHALL provide site navigation, brand identity, and legal/social links.

#### Scenario: Footer renders
- **WHEN** the page loads
- **THEN** the footer contains: the Nexora logo/wordmark, a short brand tagline, grouped link columns (product, company, resources, legal), social links, and a copyright line with the current year
- **AND** all footer links have accessible names, and social-media icon links have `aria-label` text

### Requirement: Reusable component architecture
The system SHALL keep landing content presentational and data-driven so sections can be reused, reordered, and restyled without editing individual layouts.

#### Scenario: Content lives in a data module
- **WHEN** copy for features, steps, testimonials, pricing tiers, FAQs, or trusted logos needs to change
- **THEN** the change is made by editing a single static data module (typed with TypeScript interfaces) rather than JSX
- **AND** the section component consumes that data via typed props or a direct import

#### Scenario: UI primitives are shared
- **WHEN** a section needs a button, card, badge, accordion, or container
- **THEN** it uses a shared primitive from the shared UI primitives directory rather than re-implementing styles inline

### Requirement: Design system consistency
The system SHALL apply a single consistent design system across all sections.

#### Scenario: Tokens applied
- **WHEN** any section renders text, colors, radii, spacing, or shadows
- **THEN** the values come from Tailwind theme tokens configured for the site, not arbitrary literals scattered across components
- **AND** the same token names are reused across sections so a token change propagates everywhere

### Requirement: Accessibility baseline
The landing page SHALL meet WCAG 2.1 AA baseline expectations for a static marketing site.

#### Scenario: Landmarks and headings
- **WHEN** the page renders
- **THEN** it contains exactly one `<header>` landmark, one `<main>` landmark, and one `<footer>` landmark
- **AND** it contains exactly one `<h1>` (in the Hero) and each subsequent section starts with an `<h2>`

#### Scenario: Skip link
- **WHEN** a keyboard user tabs into the page for the first time
- **THEN** the first focusable element is a visually-hidden-until-focused "Skip to main content" link that moves focus to `<main>`

#### Scenario: Color contrast
- **WHEN** any text is rendered against its background
- **THEN** the contrast ratio meets WCAG 2.1 AA (≥4.5:1 for body text, ≥3:1 for large text and non-text UI indicators)

#### Scenario: Focus visibility
- **WHEN** a keyboard user tabs to any interactive element (link, button, disclosure, menu toggle)
- **THEN** a visible focus indicator is drawn that is distinguishable from the resting state

#### Scenario: Non-decorative images
- **WHEN** an image conveys information (product screenshot, company logo, author avatar)
- **THEN** it has descriptive `alt` text
- **AND** purely decorative images have `alt=""`

### Requirement: SEO metadata
The system SHALL expose SEO and social-share metadata on the landing page.

#### Scenario: HTML metadata
- **WHEN** a crawler or link-preview scraper fetches `/`
- **THEN** the document `<head>` contains: `<title>`, meta description, canonical URL, `og:title`, `og:description`, `og:image`, `og:type=website`, `og:url`, `twitter:card=summary_large_image`, and `<html lang="en">`

### Requirement: No backend dependencies
The landing page SHALL render without requiring any backend service, database, API route, authentication provider, or environment variable specific to Nexora.

#### Scenario: Fresh clone builds and runs
- **WHEN** a developer clones the repository, installs dependencies, and runs the dev server
- **THEN** the landing page renders end-to-end with no runtime errors and no unfulfilled network requests to internal services

#### Scenario: CTAs are visual only
- **WHEN** a visitor clicks any CTA on the landing page
- **THEN** the click resolves to a static in-page anchor or a placeholder route stub (e.g., `/#pricing`, `/#final-cta`) rather than submitting data to a backend
- **AND** no form on the page performs a network submission
