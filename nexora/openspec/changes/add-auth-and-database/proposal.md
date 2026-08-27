## Revision (2026-08-27, in-flight)

**Pivot from Keycloak-only to three-provider auth.** The original proposal below shipped a Keycloak-only auth. In practice, requiring the user to run a Keycloak container (and a Postgres container, and a realm import) before they could see any auth flow at all created too much friction — sign-in produced a "Try again" error page for any user without Docker set up.

This revision replaces the single Keycloak provider with three providers, all backed by Auth.js v5:

- **Google OAuth** — provider enabled when `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are set.
- **GitHub OAuth** — provider enabled when `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` are set.
- **Email + Password (Credentials)** — always available, no OAuth-app registration required.

**Persistence** stays PostgreSQL (unchanged spec-level). The `User` table gains an optional `password` column (nullable — populated only for Credentials users; OAuth users have `password = null`). This is an additive migration; nothing existing changes.

**Signup** is now supported (previously not in scope) — `/auth/signup` renders a form that runs a Server Action which validates + bcrypt-hashes + inserts a `User`. OAuth users are provisioned on first login as before. Same-email logins across providers auto-link to one `User` via `allowDangerousEmailAccountLinking: true` (Google + GitHub both verify emails, so this is safe).

**Removed**: Keycloak service from `docker-compose.yml`; `infra/keycloak/`; every `KEYCLOAK_*` env var; the "Keycloak-only identity provider" requirement; Keycloak references in tests and docs.

**Docker Compose** now runs Postgres only. Users without Docker can still run Credentials-based sign-in against any Postgres they point at (hosted, WSL, native install).

Everything below in this proposal (except for provider name and the removed Keycloak passages) still applies: server-only DB access, Result-typed service errors, session cookie strategy, Vitest infra, BDD scenarios, clean-code refactor.

---

## Why

Nexora ships a static marketing landing today (see `add-nexora-landing`), but nothing behind it. To turn the landing into a real SaaS, we need an identity provider, a place to store per-user application data, and a testing discipline that lets the team refactor and add features safely. Adding auth, a database, and a testing baseline together — rather than one at a time — is deliberate: each depends on the others (protected routes need identity; identity-linked records need a database; refactoring both without tests would be reckless). Doing it now, before we build user profiles, subscriptions, or workspaces, sets the foundation for every future feature and avoids retrofitting security and persistence later.

## What Changes

- Add **Keycloak-backed authentication** as the sole identity provider:
  - Server-side session integration via a Next.js auth adapter (Auth.js / NextAuth v5 with the Keycloak provider).
  - Public routes (marketing site) stay unauthenticated; app routes under `/app/**` are protected by Next.js middleware and require a valid session.
  - Login redirects to Keycloak; logout clears the local session and (optionally) triggers Keycloak's end-session endpoint.
  - Navbar gains login/logout controls and, when authenticated, shows the user's display name and an avatar/initial.
  - Reusable server-side helpers (`getSession()`, `requireSession()`) and small client-side helpers (a session context hook) live in `lib/auth/`.
- Add **PostgreSQL as the primary application database**, accessed exclusively server-side:
  - Prisma ORM with a `DATABASE_URL` (pool) and `DIRECT_URL` (migrations) split, following current Prisma best practice.
  - Initial schema covers `User` (application record linked to a Keycloak identity), `Account` (Keycloak identity link), and `Session` (persisted session record); designed to accept `Organization`, `Membership`, `Subscription`, `UserSettings`, and generic domain tables later without migration surgery.
  - Service layer under `lib/db/` and `services/` isolates Prisma from routes and components; components and Client Components never import the Prisma client.
  - Migrations live under `prisma/migrations/` and are applied via `prisma migrate` scripts.
  - The Keycloak `sub` claim is the join key: on first login, `getOrCreateUser()` upserts an application `User` and links it to the Keycloak identity in `Account`. No Keycloak passwords or credentials are ever written to Postgres.
- Add a **testing baseline** using Vitest + React Testing Library:
  - `vitest.config.ts` with two test projects — a Node project for server code and a `jsdom` project for React components — so the same runner covers both without leaking DOM globals into service tests.
  - Test helpers under `tests/` provide a Keycloak/Auth.js mock, a Prisma mock (via `vitest-mock-extended`), and a small BDD helper for Given/When/Then-shaped tests.
  - Coverage focuses on meaningful behavior: auth helpers, session flows, protected-route middleware, service-layer methods (including error paths), and important reusable UI components (Navbar auth states, protected-route redirects).
- Add **clean-code and folder-structure improvements** to the existing codebase without changing observable behavior:
  - Reorganize into `app/` (routes), `components/` (UI), `lib/` (shared server-safe utilities), `services/` (business logic against Prisma), `tests/` (helpers + fixtures), keeping the existing landing-page files where they are.
  - Enforce the server/client boundary with `import "server-only"` in `lib/db/` and `services/`, and `import "client-only"` (where applicable) in client-side auth hooks.
  - Introduce a `Result`/typed error pattern for service methods so route handlers can respond safely without leaking internal error details.
- Add an **example environment file** (`.env.example`) documenting every variable the application reads — Keycloak issuer/client/secret, NextAuth secret and URL, `DATABASE_URL`, `DIRECT_URL`, and `NODE_ENV`. Real secrets are never committed.

Non-goals (explicitly out of scope for this change):
- No user-profile page, subscriptions, billing, organizations/workspaces, teams, invitations, admin panel, or any application feature beyond an authenticated "hello, {user}" landing page under `/app` — those are future capabilities that this foundation makes cheap to add.
- No production-grade Keycloak deployment; this change assumes a Keycloak realm exists (self-hosted via Docker Compose for dev, cloud/prod chosen later) and only integrates with it.
- No CI pipeline changes beyond adding `npm run test` and `npm run test:coverage` scripts.
- No dark-mode toggle, i18n, analytics, or observability tooling.
- No E2E/browser tests (Playwright/Cypress) — Vitest + RTL only. E2E is a follow-up.

## Capabilities

### New Capabilities
- `auth`: Session-based authentication backed by Keycloak. Owns login, logout, session lifecycle, protected-route enforcement (middleware), the auth-aware navbar, and the server/client helpers that expose the current identity to the rest of the app. Explicitly does not own the persisted `User` record — that belongs to `persistence`.
- `persistence`: PostgreSQL-backed application data. Owns the database schema, the Prisma-based ORM layer, migrations, the service layer boundary, error contract for service methods, and the seed process for local development. Explicitly does not own authentication state — that belongs to `auth`.
- `testing`: Automated test infrastructure. Owns the test runner configuration, environment separation (Node vs. jsdom projects), the mocking strategy for Keycloak/Auth.js and Prisma, the BDD Given/When/Then convention, and the required-test contract (which behaviors must have tests, which don't).

### Modified Capabilities
<!-- None. `marketing-site` remains unchanged: landing is still public, the navbar's login/logout button is added by `auth` (which the marketing-site consumes) rather than being written into the marketing-site spec. `add-nexora-landing` is still in flight — leaving that spec untouched here avoids a dependency cycle between two open changes. -->

## Impact

- **Code**: New `lib/auth/`, `lib/db/`, `services/`, `middleware.ts` at repo root, `app/app/**` protected route group, `prisma/schema.prisma` + `prisma/migrations/`, `tests/` (helpers + suites), `vitest.config.ts`, `vitest.setup.ts`. Existing landing files untouched except for the navbar, which gains an auth-state slot.
- **Dependencies added** (runtime): `next-auth@^5` (Auth.js v5), `@auth/prisma-adapter`, `@prisma/client`. **Dev**: `prisma`, `vitest`, `@vitest/coverage-v8`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `vitest-mock-extended`, `msw` (only if we need to intercept fetch during auth tests — decision deferred to design).
- **Config**: New `.env.example`; `package.json` scripts add `test`, `test:watch`, `test:coverage`, `db:migrate`, `db:migrate:deploy`, `db:generate`, `db:studio`, `db:seed`; `docker-compose.yml` for local Postgres + Keycloak.
- **Runtime / server–client boundary**: `lib/db/**` and `services/**` become server-only. Middleware runs on every non-static request under protected paths. Client bundle does not gain Prisma or `next-auth/*/server` code. Environment variables are read via a single validated module (`lib/env.ts`).
- **Security**: All secrets in env; DB never accessed from client; Keycloak passwords never persisted; service errors returned as typed `Result` variants so route handlers translate them to safe HTTP responses without leaking internals. Sessions use `httpOnly`, `secure`, `sameSite: lax` cookies.
- **Marketing landing (add-nexora-landing)**: Continues to render at `/`, unauthenticated, unchanged. The Navbar gains a small server-rendered "auth slot" that shows Sign in / Get started when logged out and a user menu when logged in — this is a change to the Navbar component's implementation only, not to the marketing-site spec.
- **Docs**: `README.md` gains a "Local development" section covering `docker compose up`, `prisma migrate dev`, `npm run dev`, and env-var setup.
