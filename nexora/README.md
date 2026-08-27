This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Runtime versions

| Package         | Version         | Notes                                                                 |
| --------------- | --------------- | --------------------------------------------------------------------- |
| Next.js         | `16.3.3`        | App Router. `middleware.ts` was renamed to `proxy.ts` in v16.         |
| React           | `19.2.8`        |                                                                       |
| Auth.js         | `5.0.0-beta.32` | (`next-auth@5`). Pinned exact — the 5.x line is still in beta.        |
| Auth providers  | Google + GitHub + Credentials | OAuth pairs optional; Credentials (email + password) always on. |
| Password hash   | `bcryptjs`      | Pure JS (Windows-friendly). Cost factor 10.                           |
| Prisma          | `6.19.3`        | CLI and `@prisma/client` kept in lockstep.                            |
| PostgreSQL      | `16`            | Local dev via Docker Compose.                                         |
| Vitest          | `4.1.11`        | Two projects: Node for server tests, jsdom for React component tests. |
| Tailwind CSS    | `4`             | CSS-first `@theme` configuration in `app/globals.css`.                |

## Getting Started

```bash
npm install
cp .env.example .env.local            # fill in Keycloak + DB values (see below)
docker compose up -d postgres keycloak  # local Postgres + Keycloak (see "Local development")
npm run db:migrate                    # apply Prisma migrations
npm run dev                           # dev server on http://localhost:3000
```

Everyday scripts:

```bash
npm run build          # production build (runs prisma generate first)
npm run start          # serve the production build
npm run lint
npm run test           # Vitest (watch)
npm run test:run       # Vitest single-shot
npm run test:coverage  # coverage report (v8)
```

### Environment variables

Copy `.env.example` to `.env.local` and set the values. `lib/env.ts` validates
them at process start via zod, so a missing or malformed value fails fast with
a message identifying the key (values are never logged).

- `DATABASE_URL`, `DIRECT_URL` — Postgres connections (pool + direct).
- `KEYCLOAK_ISSUER`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET` — the OIDC
  client registered in your Keycloak realm (see `infra/keycloak/realm-export.json`
  for the local dev defaults).
- `AUTH_SECRET` — 32+ char random string for signing session cookies. Generate
  with `openssl rand -base64 32`.
- `AUTH_URL` — canonical base URL of the app.
- `AUTH_KEYCLOAK_LOGOUT_ENABLED` — when `true`, Sign Out also redirects through
  Keycloak's end-session endpoint.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Landing site

The Nexora marketing landing page lives at `/` and is composed as a Server
Component in `app/page.tsx`. It renders ten sections in this order:

- `components/sections/navbar.tsx` — sticky header with mobile menu (client)
- `components/sections/hero.tsx`
- `components/sections/trusted-by.tsx`
- `components/sections/features.tsx`
- `components/sections/how-it-works.tsx`
- `components/sections/testimonials.tsx`
- `components/sections/pricing.tsx`
- `components/sections/faq.tsx` — accordion (client)
- `components/sections/final-cta.tsx`
- `components/sections/footer.tsx`

All copy (features, steps, testimonials, pricing tiers, FAQs, trusted logos)
lives in `lib/landing-content.ts` with typed interfaces. Site-wide metadata
(name, tagline, nav links, socials) lives in `lib/site-config.ts`. To edit
marketing copy, change those two files — the section components stay
presentational.

Design tokens (colors, radii, font, container width, animations) are declared
once in `app/globals.css` using Tailwind CSS v4's CSS-first `@theme` block, with
a class-based `dark` variant ready for a future theme toggle. shadcn/ui
primitives live under `components/ui/`.

## Local development

Nexora ships a `docker-compose.yml` that brings up PostgreSQL. On a fresh clone:

```bash
docker compose up -d postgres             # ~5s to accept connections
cp .env.example .env.local                # populate the values (see "Authentication")
npm install
npm run db:migrate                        # apply the initial Prisma migrations
npm run dev
```

Tear down with `docker compose down` (preserves the volume) or
`docker compose down -v` (destroys it — you'll need to re-run migrations).

If you don't have Docker, point `DATABASE_URL` at any Postgres you can reach
(hosted Neon / Supabase / a native install), then `npm run db:migrate:deploy`
and `npm run dev`.

## Authentication

Nexora uses Auth.js v5 with three interchangeable providers:

- **Google OAuth** — enabled when `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are set.
- **GitHub OAuth** — enabled when `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` are set.
- **Email + Password** (Credentials) — always available. Passwords are hashed
  with bcrypt (cost 10); plaintext is never stored.

The sign-in page dynamically shows the OAuth buttons whose credentials are
configured, plus the email/password form. New users can register via the
**Sign up** link (email + password + name form; OAuth users are provisioned
automatically on first login). Same email across providers → same `User` row
(safe, because Google and GitHub verify emails).

### Registering the OAuth apps

- **Google**: <https://console.cloud.google.com/apis/credentials> → OAuth 2.0
  Client ID → Web application. Authorized redirect URI:
  `http://localhost:3000/api/auth/callback/google`. Copy Client ID + Secret to
  `.env.local`.
- **GitHub**: <https://github.com/settings/developers> → OAuth Apps → New.
  Homepage: `http://localhost:3000`. Authorization callback URL:
  `http://localhost:3000/api/auth/callback/github`. Copy Client ID + Secret to
  `.env.local`.

Skip either — the button just won't appear.

### How the flow works

1. Visitor clicks **Sign in** in the Navbar → navigates to `/auth/signin?callbackUrl=/app`.
2. Clicks a provider button:
   - OAuth: browser 302s to Google/GitHub → user authenticates → callback to
     `/api/auth/callback/{provider}` → Auth.js verifies → session cookie set →
     redirected to `/app`.
   - Credentials: form posts to `/api/auth/callback/credentials` → server
     verifies bcrypt hash → session cookie set → redirected to `/app`.
3. `proxy.ts` guards `/app/**` on subsequent requests.

Auth.js configuration lives in `lib/auth/config.ts` (base — Edge-safe factory
that builds provider list from env; exports `proxyAuthConfig` for the proxy)
and `lib/auth/server.ts` (server-only, wires the Credentials `authorize()` to
`userService.verifyCredentials` and installs the OAuth-provisioning `signIn`
callback). Session strategy is JWT-in-cookie; upstream OAuth tokens never
cross to the client — the `session` callback strips them.

## Database

Prisma is the ORM. The schema lives at `prisma/schema.prisma` and covers
`User`, `Account`, and `Session` — designed so future tables (Organization,
Membership, Subscription, UserSettings, domain data) can be added by additive
migrations without touching the initial keys.

Everyday commands:

```bash
npm run db:generate        # regenerate the Prisma client (also runs on `npm run build`)
npm run db:migrate         # create + apply a new dev migration (needs a running DB)
npm run db:migrate:deploy  # apply pending migrations non-interactively (CI/CD)
npm run db:studio          # open Prisma Studio at http://localhost:5555
npm run db:seed            # run prisma/seed.ts (idempotent)
```

To reset the local DB: `docker compose down -v && docker compose up -d postgres && npm run db:migrate`.

All data access flows through `services/**/*.service.ts` (business logic
returning `Result<T, ServiceError>`) and `services/**/*.repo.ts` (thin Prisma
wrappers). Every file under `lib/db/` and `services/**` starts with
`import "server-only"` — components and Client Components can never import
the Prisma client transitively.

## Testing

Vitest with two projects: **node** for server code and BDD, **jsdom** for
React component tests. Both live in the same `npm run test`.

```bash
npm run test              # watch (Vitest default)
npm run test:run          # single-shot (CI)
npm run test:coverage     # v8 coverage report to ./coverage
```

Test helpers under `tests/helpers/`:

- `session.ts` — `mockSession(session | null)` + `withAuthenticatedUser({...})`.
  Mocks `@/lib/auth/server` so the auth layer never talks to Keycloak in tests.
- `prisma.ts` — `prismaMock` (from `vitest-mock-extended`) auto-mocked at
  `@/lib/db`. Service tests set expectations on `prismaMock.*.mock*Value*`.
- `next-auth-react.ts` — mocks `next-auth/react` so Client Component tests can
  assert on `signIn`/`signOut` calls without a live provider.
- `bdd.ts` — `scenario(title, { given, when, then, cleanup? })` renders as one
  Vitest `it("Scenario: …")` block. Used in `tests/bdd/**`.

BDD scenarios in `tests/bdd/` mirror the "Scenario:" entries in the spec files
under `openspec/changes/add-auth-and-database/specs/**`.

## Architecture map

- `app/**` — App Router routes.
  - `app/(marketing)` implicit: `/` is the public landing.
  - `app/auth/{signin,error}/**` — public auth surface.
  - `app/api/auth/[...nextauth]/route.ts` — Auth.js HTTP handlers.
  - `app/app/**` — the protected application area (proxy-guarded).
- `components/`
  - `ui/**` — shadcn/ui primitives (Button, Card, Badge, Accordion, Container).
  - `auth/**` — session-aware pieces (SessionProvider, NavAuthSlot, UserMenu,
    SignInButton, SignOutButton).
  - `sections/**` — landing sections; the Navbar accepts an optional
    `rightSlot` prop consumed by `<NavAuthSlot />` on authenticated routes.
  - `icons/**` — bespoke SVGs (social brand marks lucide dropped).
- `lib/`
  - `env.ts` — zod-validated env, imported by every consumer.
  - `result.ts` — `Result<T, ServiceError>` for service methods.
  - `utils.ts` — shadcn `cn()`.
  - `auth/{config,server,__tests__}.ts` — Auth.js base config + server-only
    extension with `signIn` provisioning.
  - `db/index.ts` — `server-only` singleton PrismaClient.
- `services/**` — one folder per domain; `.repo.ts` (Prisma queries only) +
  `.service.ts` (business logic returning `Result`). Every file is
  `server-only`.
- `prisma/` — schema, migrations, seed.
- `proxy.ts` (repo root) — Next.js 16 proxy (was `middleware.ts` before v16)
  guarding `/app/**`. Redirects unauthenticated visitors to
  `/auth/signin?callbackUrl=<path>`.
- `tests/` — helpers, fixtures, BDD scenarios, smoke tests, `env.test.ts`,
  `setup.ts`, `stubs/server-only.ts`.
- `infra/keycloak/` — realm export imported by the Keycloak container.

**Server / client boundary contract**: `lib/db/**`, `services/**`, and
`lib/auth/server.ts` start with `import "server-only"`. The proxy imports only
the base auth config to keep the proxy bundle small. Client-only helpers
(hooks, buttons, provider) live under `components/auth/*.tsx` with `"use client"`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
