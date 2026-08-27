## Purpose

The `persistence` capability defines Nexora's application data layer — a PostgreSQL database accessed only from the server via a typed ORM. It owns the initial schema (identity link, user, session), the migration workflow, the boundary that separates data access from UI and business logic, the error contract that service methods present to callers, and the local development database setup so that any engineer can spin up a working environment in one command.

## ADDED Requirements

### Requirement: PostgreSQL is the single application database
The system SHALL use PostgreSQL for all persistent application data. No other database engine (SQLite, MongoDB, DynamoDB, file storage, etc.) MAY be used for application state in this change.

#### Scenario: Application data reads and writes
- **WHEN** the application reads or writes user, account, or session records
- **THEN** every such operation goes through the PostgreSQL connection configured in environment variables
- **AND** no records are read from or written to the filesystem, an in-memory store, or any other datastore

### Requirement: ORM-mediated access only
The system SHALL access PostgreSQL exclusively through a maintained TypeScript ORM (Prisma). Raw SQL strings MAY appear only in migration files and, if unavoidable, inside a documented `services/**/*.repo.ts` file behind a typed method.

#### Scenario: Component or route imports the database client
- **WHEN** any file under `app/`, `components/`, `hooks/`, or a `"use client"` module attempts to import the Prisma client, an ORM builder, or a `services/**` module
- **THEN** the import is rejected at build time by the module boundary rules (either via `import "server-only"` guards in the imported files or via ESLint boundary rules)
- **AND** the developer sees a clear error identifying the boundary violation

#### Scenario: Prisma client is a singleton
- **WHEN** the application starts (dev or prod)
- **THEN** exactly one `PrismaClient` instance is created per Node process (memoized on `globalThis` in development to survive hot reload)
- **AND** service code imports the shared instance rather than instantiating its own

### Requirement: Server-only data access
All modules under `lib/db/` and `services/` SHALL be server-only. Database credentials SHALL NEVER be exposed to client code, URLs, HTML, or serialized props.

#### Scenario: `server-only` guard on data modules
- **WHEN** a data-layer module is imported into a Client Component tree
- **THEN** the `server-only` guard throws at build time with a message pointing to the offending import chain
- **AND** the build fails

#### Scenario: Database URL is never sent to the client
- **WHEN** the application is built for production
- **THEN** the `DATABASE_URL` and `DIRECT_URL` values do not appear in `.next/static/**`, any client bundle, any HTML response body, or any error message rendered to the browser

### Requirement: Initial schema
The system SHALL define an initial schema containing at least three tables: `User` (application-level user), `Account` (per-provider identity link), and `Session` (persisted server session record). The schema SHALL be designed so that future tables (Organization, Membership, Subscription, UserSettings, and generic domain tables) can be added by additive migrations without altering the initial tables' primary keys or unique constraints.

#### Scenario: User table shape
- **WHEN** the initial migration runs against an empty database
- **THEN** a `User` table exists with at minimum: `id` (primary key, CUID/UUID), `email` (unique, nullable to accommodate providers without email), `name` (nullable), `image` (nullable), `password` (nullable — bcrypt hash for Credentials users only; OAuth users have `null`), `createdAt` (timestamp), `updatedAt` (timestamp)
- **AND** the `id` column is stable across renames and email changes
- **AND** when `password` is not `null`, its value is a bcrypt hash (never plaintext)

#### Scenario: Account (identity link) table shape
- **WHEN** the initial migration runs
- **THEN** an `Account` table exists with at minimum: `id`, `userId` (FK → User.id, cascade delete), `provider` (e.g. "keycloak"), `providerAccountId` (Keycloak `sub`), a unique constraint on `(provider, providerAccountId)`, `createdAt`, `updatedAt`
- **AND** no columns exist to store passwords, refresh tokens, or client secrets

#### Scenario: Session table shape (if using database-backed sessions)
- **WHEN** the initial migration runs
- **THEN** a `Session` table exists with at minimum: `id`, `sessionToken` (unique), `userId` (FK → User.id, cascade delete), `expires` (timestamp)

#### Scenario: Extensibility contract
- **WHEN** a future change adds `Organization`, `Membership`, `Subscription`, `UserSettings`, or an application domain table
- **THEN** it can be added by an additive migration referencing `User.id`
- **AND** no destructive change to the initial `User`, `Account`, or `Session` tables is required

### Requirement: Migrations workflow
The system SHALL manage schema changes through Prisma migrations. Every schema change SHALL be tracked as a versioned migration file under `prisma/migrations/`.

#### Scenario: Local development migration
- **WHEN** a developer edits `prisma/schema.prisma` and runs `npm run db:migrate`
- **THEN** Prisma generates a new timestamped migration under `prisma/migrations/<timestamp>_<name>/migration.sql`
- **AND** the migration is applied to the local database
- **AND** the developer commits both the schema and the generated migration file

#### Scenario: Deploy migration
- **WHEN** the deploy pipeline runs `npm run db:migrate:deploy`
- **THEN** all pending migrations are applied to the target database in order
- **AND** the command exits non-zero if any migration fails, halting the deploy

#### Scenario: Client generation
- **WHEN** the developer runs `npm run db:generate` (or `npm run build`)
- **THEN** the Prisma client is generated into `node_modules/.prisma/client` so type-safe queries are available in the codebase

### Requirement: Service-layer boundary and error contract
The system SHALL wrap all data access behind service functions that return a typed `Result` variant, so route handlers, Server Actions, and RSCs never destructure raw ORM errors.

#### Scenario: Successful service call
- **WHEN** a service method (e.g. `userService.getOrCreate(input)`) completes successfully
- **THEN** it returns `{ ok: true, value: T }`
- **AND** the caller can rely on `value` being of the declared type

#### Scenario: Known failure
- **WHEN** a service method fails for a known reason (validation, uniqueness, not-found)
- **THEN** it returns `{ ok: false, error: { code: <enum>, message: <safe-string> } }`
- **AND** the `code` is a stable enum the caller can switch on
- **AND** the `message` is safe to show to end users

#### Scenario: Unknown failure
- **WHEN** an unexpected exception is thrown inside a service method (DB down, driver error)
- **THEN** the method logs the raw error server-side with a request/trace id
- **AND** returns `{ ok: false, error: { code: "internal", message: "Something went wrong" } }`
- **AND** the raw error, stack trace, or DB error code is not returned to the caller

### Requirement: OAuth identity linkage
The system SHALL link OAuth provider identities (Google, GitHub) to application `User` rows via `Account.(provider, providerAccountId)` and expose a single service entrypoint used by the auth layer to resolve or create a user on OAuth login.

#### Scenario: `getOrCreateUser` behavior for OAuth
- **WHEN** `userService.getOrCreateUser({ providerId, providerAccountId, email, name, image })` is called (providerId is `"google"` or `"github"`)
- **THEN** if `Account.(provider, providerAccountId)` already exists, the linked `User` is returned unchanged
- **AND** if it does not exist AND a `User` with the same `email` exists, the OAuth `Account` row is linked to that existing user (safe cross-provider linkage; the OAuth provider is trusted to have verified the email)
- **AND** if neither exists, a new `User` (with `password = null`) and a linked `Account` row are created inside a single transaction
- **AND** if `email`, `name`, or `image` from the provider differs from what is stored, the corresponding `User` fields are updated in the same transaction

#### Scenario: No OAuth tokens persisted
- **WHEN** `getOrCreateUser` writes to the database for an OAuth login
- **THEN** the SQL executed does not contain any access token, refresh token, ID token, or OAuth client secret
- **AND** the `Account` row stores only identifiers and audit timestamps

### Requirement: Credentials (email + password) service
The system SHALL provide a service entrypoint used by the auth layer to (a) create a Credentials-based `User` on sign-up and (b) verify a submitted password on sign-in.

#### Scenario: `createCredentialsUser` behavior
- **WHEN** `userService.createCredentialsUser({ email, name, password })` is called with a valid input
- **THEN** the service checks that no `User` with that `email` exists (case-insensitive)
- **AND** hashes the `password` with bcrypt (cost factor ≥10)
- **AND** inserts a `User` row with the hash and returns `ok({ id, email, name })`
- **AND** if the email is already taken, returns `err({ code: "conflict", message: "An account with this email already exists" })`
- **AND** never persists the plaintext password

#### Scenario: `verifyCredentials` behavior
- **WHEN** `userService.verifyCredentials({ email, password })` is called
- **THEN** the service looks up the `User` by `email`
- **AND** if not found, returns `err({ code: "not_found", message: "Email or password is incorrect" })` (same message as password mismatch)
- **AND** if found and `password` field is `null` (OAuth-only account), returns the same `err({ code: "not_found", ... })` (never reveals the account type)
- **AND** if found and `password` is set, compares the submitted password with `bcrypt.compare()`
- **AND** on match returns `ok({ id, email, name, image })`
- **AND** on mismatch returns the same `err({ code: "not_found", ... })`

### Requirement: Environment-driven connection
The database connection SHALL be configured entirely by environment variables and validated at process start; no default connection strings, credentials, or hostnames MAY be hardcoded.

#### Scenario: Required env vars validated at boot
- **WHEN** the application starts
- **THEN** it validates the presence of `DATABASE_URL` (and `DIRECT_URL` if Prisma migrations use a separate direct connection)
- **AND** an invalid or missing value fails the process fast with a message identifying which variable is missing (and never logs the value)

#### Scenario: `.env.example` documents every read variable
- **WHEN** the repository is cloned
- **THEN** `.env.example` lists every environment variable read by the persistence layer with a placeholder value and a short comment
- **AND** no real credentials appear in the file

### Requirement: Local development setup
The system SHALL provide a documented, one-command local setup so a new contributor can bring up a working database and apply migrations.

#### Scenario: One-command bring-up
- **WHEN** a new contributor runs `docker compose up -d postgres` (or the documented equivalent) followed by `npm run db:migrate`
- **THEN** the local PostgreSQL container is running, migrations have been applied, and the application can start with `npm run dev`
- **AND** the entire process is documented in `README.md` under "Local development"

#### Scenario: Optional seed data
- **WHEN** a contributor runs `npm run db:seed`
- **THEN** the seed script inserts a small, deterministic set of dev-only records
- **AND** the seed script is safe to run multiple times (idempotent) or clearly documents that it is destructive
