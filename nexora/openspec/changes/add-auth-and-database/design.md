## Revision (2026-08-27, in-flight): Keycloak → Google + GitHub + Credentials

The Keycloak-only decision was reversed. New provider set:

- **Google OAuth** (Auth.js `providers/google`) — enabled when `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are set.
- **GitHub OAuth** (Auth.js `providers/github`) — enabled when `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` are set.
- **Credentials (email + password)** — always enabled. Auth.js `providers/credentials` with an `authorize()` callback that delegates to `userService.verifyCredentials`. Passwords hashed with `bcryptjs` (pure JS; Windows-friendly; no native compile).

### Why not Auth.js Email (magic link) provider?
Requires SMTP infrastructure. Out of scope for a "run this on your laptop" story. Add as follow-up.

### Sign-up
New: `/auth/signup` page + a Server Action (`app/auth/signup/actions.ts`) that validates the form (zod), calls `userService.createCredentialsUser`, and redirects to `/auth/signin?email=<...>` on success. OAuth users are provisioned on first login (no explicit sign-up needed).

### Same-email account linking
`allowDangerousEmailAccountLinking: true` on both OAuth providers, so a user who signed up with email/password and later "Continue with Google" (same email) ends up on the same `User` row. Google and GitHub both mark emails as verified before returning them, which makes this "dangerous" flag actually safe in practice.

### Session strategy
Still JWT-in-cookie. Credentials provider **requires** JWT strategy in Auth.js v5 (DB sessions don't work with credentials).

### Password storage
`bcryptjs.hash(pw, 10)` on write, `bcryptjs.compare(pw, hash)` on read. Cost 10 = ~50 ms per hash on modern hardware, acceptable for a dev-facing app; bump to 12 in production if needed.

### Env
`KEYCLOAK_*` variables removed entirely. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` added as **optional** (validated only if present). `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL` stay required.

### Infrastructure removed
Keycloak service and its `--import-realm` volume dropped from `docker-compose.yml`. `infra/keycloak/` folder deleted. Docker Compose now has one service (Postgres).

### Migration
Additive Prisma migration adds `password TEXT` (nullable) to `User`. Committed as `prisma/migrations/20260827160000_add_user_password/migration.sql`. No destructive changes to existing tables.

---

## Context

See `proposal.md` for motivation. This design covers *how* to add auth, persistence, and testing to the current repo without breaking the landing site.

Repo state today (after `add-nexora-landing`):
- Next.js 16.3.3 App Router, React 19.2, TypeScript 5, Tailwind CSS v4.
- Landing page at `/` composed of ten sections. `Navbar` and `FAQ` are the only Client Components; everything else is server-rendered.
- `lib/utils.ts`, `lib/site-config.ts`, `lib/landing-content.ts` exist. No `services/`, no database, no auth, no middleware, no tests, no `tsconfig.paths`-driven server-only guard.
- `tsconfig.json` already has `@/*` → `./*` alias.

Constraints from `AGENTS.md`:
- Next.js 16.3.3 may diverge from training data — the implementer must read `node_modules/next/dist/docs/` before writing code that touches App Router, middleware, `next/font`, or route handlers.
- Auth.js (NextAuth v5) is under active migration; the implementer must consult its docs, not memory, before wiring the provider or middleware.

## Goals / Non-Goals

**Goals:**
- Deliver auth, database, and test infrastructure as a single foundation change, so downstream features have all three from day one.
- Keep the landing page's public behavior byte-identical (except for the navbar's right side, which becomes auth-aware — a UI change, not a spec change to `marketing-site`).
- Enforce a hard server-only boundary: `lib/db/**` and `services/**` are never bundled into client code.
- Provide a one-command local setup so a fresh clone reaches "authenticated hello page" in under 10 minutes.

**Non-Goals:**
- No product features beyond a minimal authenticated landing (`/app` shows "Hello, {name}").
- No CI configuration beyond adding scripts to `package.json`.
- No production Keycloak deploy — a docker-compose Keycloak is sufficient for dev; production Keycloak is a separate infra concern.
- No E2E browser tests (Playwright, Cypress) in this change.
- No dark-mode toggle, no i18n, no analytics.

## Decisions

### D1. Auth.js v5 (NextAuth v5) with the Keycloak provider
Use Auth.js v5's Keycloak provider for OpenID Connect. Auth.js handles PKCE, code exchange, state, cookies, and provider adapters — all the boilerplate we'd otherwise reinvent.

- **Why**: v5 is designed for the App Router, its middleware helper composes cleanly with our route protection, and its provider set includes Keycloak out of the box. It also has a Prisma adapter maintained in the same monorepo.
- **Alternatives considered**:
  - **Hand-rolled OIDC client (openid-client)** — full control, but reimplements PKCE, state, cookie management, and callback handling. High surface area for security bugs.
  - **`keycloak-js`** — client-side flow; forces auth state into the browser, exposes tokens, defeats the server/client secret boundary.
  - **Lucia** — solid library but requires more wiring for OIDC/Keycloak specifically; also positioned as more session-store-focused than Auth.js.
- **Version handling**: v5 is in RC/GA depending on the day of the week; the implementer must pin to a stable release and read `node_modules/next-auth/**` docs before writing code, per `AGENTS.md`.

### D2. Session storage: JWT cookie, tokens server-side only
Use Auth.js's default JWT-session-in-cookie strategy, but store no Keycloak tokens (`access_token`, `refresh_token`, `id_token`) in the cookie. Sensitive tokens live only in the Auth.js session record accessed server-side inside its `session` callback.

- **Why**: Cookie-based sessions avoid a DB round-trip on every request. Keeping tokens off the cookie preserves the server/client secret boundary. If the app later needs to call Keycloak-protected APIs on the user's behalf, we can persist tokens to `Account` (server-side only) at that time.
- **Alternatives considered**:
  - **DB-backed sessions via `@auth/prisma-adapter`** — nice for revocation and audit, adds a DB read per request. We ship the `Session` table anyway (spec requires it) but do not put the primary session flow behind it in v1. It's a one-config-line switch later.
  - **Encrypted tokens in the cookie** — Auth.js does encrypt by default, but larger cookies risk hitting size limits and every request payload grows.

### D3. Protected routes via Next.js middleware + a route group
Protect `/app/**` in `middleware.ts` at the repo root. Use a `(app)` or `app/app/` route group so all authenticated routes share a nested layout that trusts the session already exists.

- **Why**: Middleware is the single choke point; enforcing at the layout level too would risk drift.
- **Alternatives considered**:
  - **Per-page `requireSession()` calls** — repetitive, easy to forget. Middleware makes protection declarative.
  - **`unstable_expireTag` / RSC-only guards** — App Router is edge-friendly and middleware is the intended enforcement point.
- **Matcher shape**: `matcher: ['/app/:path*']` — the middleware never touches static assets or the marketing landing.

### D4. Prisma with `DATABASE_URL` + `DIRECT_URL` split
Use Prisma with a Postgres provider. Configure two connection URLs: `DATABASE_URL` (pooled, for the app runtime, e.g. Supabase pgbouncer) and `DIRECT_URL` (direct, for migrations). If we deploy on plain Postgres, both point to the same DSN.

- **Why**: This is the current Prisma-recommended shape and future-proofs deployment to Supabase / Neon / Vercel Postgres, all of which mandate the split for connection pooling to work with migrations.

### D5. Prisma schema (initial): `User`, `Account`, `Session`
Match Auth.js's expected adapter shape so the same schema works whether we're using DB-backed sessions or not. `Account` stores no tokens for now (fields exist in the adapter schema but we don't populate them).

- **Why**: If we later switch to DB sessions or need `Account.refresh_token` for calling Keycloak-protected APIs, no migration is required. Matching Auth.js's shape also means `@auth/prisma-adapter` "just works" if we opt into DB sessions later.
- Fields deliberately omitted from `Account`: `refresh_token`, `access_token`, `id_token`, `expires_at`, `scope`, `session_state`, `token_type`. We keep the columns nullable so the adapter is compatible, but our services never write them.

### D6. Server-only boundary enforcement
- Add `import "server-only"` at the top of every `lib/db/*.ts`, `services/**/*.ts`, and `lib/auth/server.ts`.
- Add an ESLint rule (via `eslint-plugin-boundaries` or a custom `no-restricted-imports`) forbidding client files (`*.client.tsx`, or files marked `"use client"`) from importing `@/lib/db/**`, `@/services/**`, `@/lib/auth/server`.
- The Client Component auth surface lives in `lib/auth/client.ts` and re-exports only the session hook and a `<SessionProvider>` wrapper.

### D7. Directory structure additions
```
prisma/
  schema.prisma
  migrations/
  seed.ts

middleware.ts                         # protect /app/**

lib/
  auth/
    server.ts                         # getSession, requireSession, auth() from next-auth
    client.ts                         # SessionProvider, useSession re-export
    config.ts                         # NextAuth config object
  db/
    index.ts                          # singleton PrismaClient + "server-only"
  env.ts                              # runtime env validation (zod)
  result.ts                           # Result<T, E> type + helpers

services/
  users/
    user.service.ts                   # getOrCreateUser + updateProfile
    user.repo.ts                      # Prisma queries only (no business logic)

app/
  (marketing)/                        # optional grouping; keeps landing files together
    layout.tsx                        # existing marketing layout, if extracted
  auth/
    signin/route.ts                   # next-auth signin handler (or wire via api/auth)
    signout/route.ts
    error/page.tsx
  api/
    auth/[...nextauth]/route.ts       # next-auth route handler
  app/                                # protected route group
    layout.tsx                        # renders session-aware chrome
    page.tsx                          # "Hello, {name}" placeholder
components/
  auth/
    nav-auth-slot.tsx                 # server component that reads session & renders correct nav CTA
    user-menu.tsx                     # client dropdown for signed-in state
    sign-in-button.tsx                # client link that hits /api/auth/signin
    sign-out-button.tsx               # client link that hits /api/auth/signout

tests/
  setup.ts                            # global test setup (jest-dom, cleanup)
  helpers/
    session.ts                        # mockSession(session | null)
    prisma.ts                         # mockDeep<PrismaClient>()
    bdd.ts                            # scenario({ given, when, then })
  fixtures/
    users.ts                          # sample User/Account fixtures
```

### D8. Env validation with zod at boot
`lib/env.ts` parses `process.env` through a zod schema. Any missing/malformed variable throws at import time. Values are re-exported as `env.DATABASE_URL`, etc., so no bare `process.env.*` reads scatter through the codebase.

- **Why**: One place to see every required variable. Fails fast in CI and prod. Removes the "why does this crash three levels deep" class of bug.

### D9. Vitest config with two projects
`vitest.config.ts` declares two `projects`:
- `node`: environment `node`, includes `services/**`, `lib/db/**`, `lib/auth/**`, `middleware.test.ts`, and `**/*.server.test.ts`.
- `jsdom`: environment `jsdom`, includes `components/**`, `app/**/*.test.tsx`, `**/*.ui.test.tsx`, loads `tests/setup.ts` for `@testing-library/jest-dom`.

- **Why**: Same runner, different globals. Prevents accidental `window` reads in server tests and Node-only imports in UI tests.
- **Coverage**: v8 provider, `coverage/` under gitignore. Meaningful thresholds only for `services/**` and `lib/auth/**`; do not gate the change on component-coverage percentages.

### D10. Test doubles: `vitest-mock-extended` for Prisma, factory helper for auth
- Prisma is mocked via `vitest-mock-extended`'s `mockDeep<PrismaClient>()` — type-safe and requires no manual stubs.
- Auth is mocked via a small `mockSession(session)` helper that stubs the `getSession`/`auth` return via `vi.mock('@/lib/auth/server')`.
- HTTP-level mocking (MSW) is not required for v1 — no code fetches anything at runtime.

### D11. BDD helper: thin `scenario()` wrapper over Vitest
Ship a ~20-line helper: `scenario(title, { given, when, then, cleanup? })` that calls `it("Scenario: <title>", async () => { await given(ctx); await when(ctx); await then(ctx); })`. No dependency on a Cucumber runner.

- **Why**: Keeps BDD readable in Vitest reporter output without a second toolchain. Given/When/Then blocks share a `ctx` object for wiring subjects.
- **Alternatives considered**:
  - **Cucumber.js** — second runner, second config, weaker TypeScript story for step defs.
  - **Just plain `describe`/`it`** — works but easy for teams to drift on structure. The helper is a soft standard, not a hard requirement.

### D12. Result / typed error contract
Introduce `type Result<T, E extends { code: string; message: string } = ServiceError>` in `lib/result.ts`. Every service method returns `Result<T>` (never throws for known errors). This lets route handlers translate to safe HTTP responses without leaking internal error text.

- **Why**: Explicit failure paths are testable; try/catch at every call site is not.
- **Alternatives considered**:
  - **fp-ts / neverthrow** — adds a library and mental model for a small domain. Overkill for now.
  - **Throwing** — makes unknown errors easy but pollutes hot paths with `try/catch`, and route handlers frequently forget to catch specific classes.

### D13. Docker Compose for local Postgres and Keycloak
`docker-compose.yml` at the repo root brings up Postgres (16) and Keycloak (26.x). Named volumes for both. Realm and client are configured via a JSON import file at `infra/keycloak/realm-export.json` so developers get a working `nexora` realm out of the box.

- **Why**: Removes onboarding friction. Everyone gets the same versions.
- **Alternatives considered**:
  - **Hosted dev Keycloak** — introduces shared state; test users conflict; auth failures block everyone.

### D14. Consumption by the Navbar
The existing `components/sections/navbar.tsx` gets a small slot: it accepts a `rightSlot` prop and defaults to the existing "Sign in / Get started" pair. `app/page.tsx` (marketing) passes `<NavAuthSlot />` — a server component under `components/auth/nav-auth-slot.tsx` — that reads the session and returns either the marketing buttons or a `<UserMenu />` (client).

- **Why**: Navbar stays a thin composition point. Auth-aware behavior is owned by an auth component, not smuggled into the marketing section.
- **Marketing-site spec impact**: none — the navbar's right region always renders "controls", the identity of those controls is the auth capability's business.

## Risks / Trade-offs

- **Auth.js v5 is still stabilizing** → Pin an exact version; document the exact release in `README.md`. Implementer reads `node_modules/next-auth/**` before writing configuration (per `AGENTS.md`).
- **Middleware runs on the Edge runtime in Next.js by default** → Auth.js v5 middleware is Edge-compatible, but if the Prisma adapter is used, sessions cannot be read in middleware. Design keeps middleware limited to a JWT cookie check; DB reads happen in RSCs after middleware allows the request through.
- **Docker Compose adds a local dependency** → Document that `sqlite` or an existing Postgres works too by overriding `DATABASE_URL`; Compose is a sensible default, not a mandate.
- **Server-only import boundaries can regress** → Add an ESLint rule; write a simple test that imports every file in `components/**` via a client-simulating loader and asserts no `@/lib/db` import chain (deferred if too costly).
- **BDD-in-Vitest may not fully replicate Gherkin ergonomics** → We accept this trade for zero extra tooling. If a team member later wants full Cucumber, the `scenario()` helper is small enough to migrate.
- **Landing page navbar could regress** → The navbar accepts a slot; the marketing render uses a marketing-flavored slot; a test asserts the marketing landing still renders both "Sign in" and "Get started" for unauthenticated users on `/`.
- **Keycloak realm bootstrap can drift** → The realm export lives under `infra/keycloak/`; a task documents how to re-export after changes.
- **Sensitive env values leaked in logs** → `lib/env.ts` never `console.log`s a value on failure — only names.

## Migration Plan

Greenfield for the app itself, but the landing page already exists. Deploy path:
1. All new files added; existing files touched only in the navbar slot.
2. `docker compose up -d postgres keycloak` locally; import realm JSON.
3. `cp .env.example .env.local` and fill in real values.
4. `npm run db:migrate` locally creates the initial schema.
5. `npm run dev` boots the app; `/` still renders the marketing site; `/app` requires login.
6. `npm run test` passes.
7. `npm run build` succeeds; middleware appears in build output.

Rollback: revert the change; `middleware.ts` disappears; `/app` is not routed. The landing page continues to work — the navbar reverts to hard-coded "Sign in / Get started" buttons because the slot pattern falls back to that.

## Open Questions

Deferrable — none of these change the specs, chosen approach, or task breakdown; each is a knob the first implementation can pick without rewrites:

- Do we ship database-backed sessions in v1 (via `@auth/prisma-adapter` with `strategy: "database"`), or keep the JWT-in-cookie default? Design assumes JWT for v1 but the schema supports either.
- Which Keycloak version do we standardize on for docker-compose (25, 26)? Latest at implementation time.
- Do we ship an ESLint boundary rule now or defer to a follow-up? Design assumes ship now, but "convention + `server-only`" is acceptable if the plugin adds churn.
