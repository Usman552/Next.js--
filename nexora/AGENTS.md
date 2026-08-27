<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Nexora-specific guidance for agents

This project depends on several fast-moving libraries whose docs may not match
your training data. Before writing or modifying code that touches any of them,
read the pinned docs shipped inside `node_modules/` — do not rely on memory:

- **Next.js 16.3.3** — `node_modules/next/dist/docs/**`. Especially: `01-app/**`
  App Router, `03-api-reference/03-file-conventions/proxy.md` (the file
  formerly known as `middleware.ts` was **renamed to `proxy.ts`** in v16),
  `03-api-reference/04-functions/generate-metadata.md`.
- **Auth.js (`next-auth@5.0.0-beta.32`)** — `node_modules/next-auth/**` and
  `node_modules/@auth/core/**`. The v5 line is still in beta; check the
  installed version's `.d.ts` before wiring providers, callbacks, adapters,
  or middleware. Nexora's provider set is Google + GitHub OAuth + Credentials
  (email + password with bcryptjs); Keycloak was removed.
- **Prisma 6.19.3** — `node_modules/@prisma/client/**`. Migration invocation
  and connection-URL semantics (`DATABASE_URL` vs `DIRECT_URL`) differ from
  earlier majors.

The server-only boundary is enforced by `import "server-only"` at the top of
every file under `lib/db/`, `services/**`, and `lib/auth/server.ts`. Do not
weaken this — Vitest tests use an alias-stub for `server-only`, but the real
build depends on it to keep secrets out of client bundles.

