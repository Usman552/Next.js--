## Purpose

The `auth` capability provides Nexora's session-based authentication using Auth.js v5 with three interchangeable providers — Google OAuth, GitHub OAuth, and Email + Password (Credentials). It defines how visitors sign up and sign in, how sessions are maintained and read on both server and client, how protected routes are enforced, how the UI reflects authenticated state, and how the auth layer collaborates with `persistence` to associate an identity with an application user record.

## ADDED Requirements

### Requirement: Multi-provider identity
The system SHALL support three interchangeable sign-in methods: Google OAuth, GitHub OAuth, and Email + Password (Credentials). Providers requiring OAuth secrets (Google, GitHub) SHALL be enabled only when their `*_CLIENT_ID` and `*_CLIENT_SECRET` environment variables are set; the Credentials provider is always available.

#### Scenario: OAuth provider offered when configured
- **WHEN** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- **THEN** the sign-in page exposes a "Continue with Google" button
- **AND** clicking it initiates Google's OpenID Connect flow with the configured `client_id`, `redirect_uri` (`/api/auth/callback/google`), PKCE, and state

#### Scenario: OAuth provider hidden when not configured
- **WHEN** either of `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` is unset
- **THEN** no "Continue with GitHub" button appears on the sign-in page
- **AND** attempting to invoke the GitHub sign-in endpoint returns a safe error rather than crashing

#### Scenario: Credentials always available
- **WHEN** no OAuth credentials are configured
- **THEN** the sign-in page still renders the email + password form
- **AND** a valid email + password combination authenticates the user

### Requirement: Email + password sign-up
The system SHALL provide a sign-up flow that creates a new application user from an email + password + display-name form. Passwords SHALL be stored as bcrypt hashes and never as plaintext.

#### Scenario: Successful sign-up
- **WHEN** an unauthenticated visitor submits the sign-up form with a valid, unused email, a password meeting the strength policy, and a display name
- **THEN** the server creates a new `User` row with `email`, `name`, and a bcrypt-hashed `password`
- **AND** the visitor is redirected to `/auth/signin` with the new email pre-filled (or auto-signed-in as a follow-up option)

#### Scenario: Duplicate email
- **WHEN** the sign-up form is submitted with an email that already exists in `User`
- **THEN** the form re-renders with a user-facing message ("An account with this email already exists")
- **AND** no new `User` row is created
- **AND** the underlying uniqueness error is logged server-side but not surfaced to the client

#### Scenario: Password strength policy
- **WHEN** the sign-up form is submitted with a password shorter than 8 characters, or containing no letter, or containing no digit
- **THEN** the form re-renders with a clear validation message identifying which rule failed
- **AND** no `User` row is created

#### Scenario: Passwords are never stored in plaintext
- **WHEN** a sign-up succeeds
- **THEN** the value stored in `User.password` is a bcrypt hash (starts with `$2a$` or `$2b$`)
- **AND** the plaintext password does not appear in server logs, database columns, or client responses

### Requirement: Email + password sign-in
The Credentials provider SHALL authenticate an existing user by verifying a submitted email + password against the bcrypt hash stored in `User.password`.

#### Scenario: Correct credentials
- **WHEN** an unauthenticated visitor submits the sign-in form with a matching email + password
- **THEN** the server verifies the password using `bcrypt.compare()` against `User.password`
- **AND** on match, a session cookie is issued and the visitor is redirected to the requested `callbackUrl` (default `/app`)

#### Scenario: Incorrect credentials
- **WHEN** the sign-in form is submitted with an unknown email, a matching email with a wrong password, or an existing `User` whose `password` is `null` (OAuth-only account)
- **THEN** the visitor is redirected to `/auth/signin?error=CredentialsSignin`
- **AND** the same generic message ("Email or password is incorrect") is shown regardless of which case failed — the server MUST NOT reveal whether the email exists

### Requirement: OAuth sign-in and first-login provisioning
Google and GitHub sign-ins SHALL complete OAuth 2.0 / OpenID Connect against the respective provider, and on first success SHALL provision an application `User` linked to the provider identity via `Account.(provider, providerAccountId)`.

#### Scenario: Successful OAuth callback
- **WHEN** Google or GitHub redirects back to `/api/auth/callback/{provider}` with a valid authorization code
- **THEN** Auth.js exchanges the code for tokens, verifies the ID token / user profile, and establishes a session cookie
- **AND** the visitor is redirected to `callbackUrl` (default `/app`)

#### Scenario: First OAuth login
- **WHEN** a user completes OAuth sign-in for the first time on a given provider
- **THEN** the auth layer calls `userService.getOrCreateUser({ providerId, providerAccountId, email, name, image })`
- **AND** a new `User` and linked `Account` row are inserted in one transaction
- **AND** the returned application `user.id` is stored in the JWT for use by downstream code

#### Scenario: Same email across providers
- **WHEN** a user first signs up with email + password using `foo@example.com`, and later signs in with Google using the same `foo@example.com`
- **THEN** the OAuth callback links the Google `Account` to the existing `User` (via `allowDangerousEmailAccountLinking`)
- **AND** no duplicate `User` row is created
- **AND** subsequent sign-ins with either provider resolve to the same `User.id`

### Requirement: Session lifecycle
Sessions SHALL be JWT-in-cookie (Auth.js default): `HttpOnly`, `Secure` in production, `SameSite=Lax`, bounded expiry. Upstream OAuth tokens (`accessToken`, `refreshToken`, `idToken`) MUST NOT be exposed in the session object that reaches Client Components.

#### Scenario: Session cookie flags
- **WHEN** a session cookie is issued
- **THEN** it is `HttpOnly`, `Secure` in production (not in dev), `SameSite=Lax`, and has a bounded expiration matching the configured session lifetime

#### Scenario: Sensitive tokens never cross to the client
- **WHEN** a session object is exposed to a Client Component or serialized into HTML
- **THEN** it contains only non-sensitive fields (`user.id`, `user.name`, `user.email`, `user.image`, `expires`) and MUST NOT include access tokens, refresh tokens, or provider client secrets

### Requirement: Logout flow
The system SHALL provide a logout action that clears the local session cookie.

#### Scenario: Standard logout
- **WHEN** an authenticated user activates "Sign out"
- **THEN** the local session cookie is deleted
- **AND** the user is redirected to `/` (public marketing home)
- **AND** the next server request from that browser is treated as unauthenticated

### Requirement: Protected route enforcement
The system SHALL protect all routes under a designated authenticated prefix (`/app/**`) via the Next.js Proxy (`proxy.ts`). Public routes SHALL remain accessible without a session.

#### Scenario: Unauthenticated visitor requests a protected route
- **WHEN** an unauthenticated visitor requests any URL matching `/app/**`
- **THEN** the proxy responds with a redirect to `/auth/signin`
- **AND** the original destination is preserved in a `callbackUrl` query parameter

#### Scenario: Authenticated visitor requests a protected route
- **WHEN** an authenticated visitor with a valid session requests any URL matching `/app/**`
- **THEN** the proxy allows the request through
- **AND** the route handler receives a session object via the server-side helper

#### Scenario: Public routes remain unauthenticated
- **WHEN** any visitor requests `/`, `/#*`, `/auth/**`, `/api/auth/**`, or any static asset
- **THEN** the proxy does not require or attempt to load a session for that request

### Requirement: Server-side and client-side session accessors
The system SHALL expose a server-only helper (`getSession()` / `requireSession()`) and a client-side hook (`useSession()`, re-exported from `next-auth/react`) that reflect the same identity, with a loading state on the client during initial hydration.

#### Scenario: Optional server session read
- **WHEN** server code calls `getSession()`
- **THEN** it receives a `Session` object when authenticated or `null` when not
- **AND** the call never throws for the "unauthenticated" case

#### Scenario: Required server session read
- **WHEN** server code calls `requireSession()` on an unauthenticated request
- **THEN** the helper responds by redirecting to `/auth/signin?callbackUrl=<current-path>` rather than throwing

#### Scenario: Client loading state
- **WHEN** a Client Component first renders and the session has not yet resolved
- **THEN** `useSession()` returns `{ status: "loading", data: null }`
- **AND** components render a stable placeholder rather than flashing a signed-out UI

### Requirement: Auth-aware navbar
The Navbar SHALL adapt its right-side controls based on session state without changing the marketing site's visual identity on public routes.

#### Scenario: Signed-out user on any page
- **WHEN** the Navbar renders for an unauthenticated visitor
- **THEN** its "Sign in" and "Get started" controls, when activated, navigate to `/auth/signin?callbackUrl=/app` (Sign in) or `/auth/signup?callbackUrl=/app` (Get started) — they MUST NOT be scroll anchors

#### Scenario: Signed-in user
- **WHEN** the Navbar renders for an authenticated visitor
- **THEN** it shows the user's display name / email and a menu containing at least "Sign out"

### Requirement: Configuration via environment variables
All provider, session, and callback configuration SHALL be sourced from environment variables validated at process start. OAuth `*_CLIENT_ID` / `*_CLIENT_SECRET` pairs are optional (each provider is enabled only when both are present). `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL` are required.

#### Scenario: Required env vars validated at boot
- **WHEN** the application starts
- **THEN** it validates the presence and shape of `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`
- **AND** invalid or missing values fail the process fast with a message identifying the key (never the value)

#### Scenario: Optional OAuth env vars
- **WHEN** `GOOGLE_CLIENT_ID` or `GITHUB_CLIENT_ID` is unset
- **THEN** the app boots successfully
- **AND** the corresponding OAuth provider is simply omitted from the sign-in page

#### Scenario: Secrets never reach the client bundle
- **WHEN** the application is built for production
- **THEN** `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_SECRET`, `AUTH_SECRET`, and any other server-only env var MUST NOT appear in any file emitted into `.next/static/**` or any Client Component bundle
- **AND** only `NEXT_PUBLIC_*`-prefixed values reach client code

### Requirement: Safe error surface
The auth layer SHALL translate internal failures into safe, generic messages before they reach the UI or URL.

#### Scenario: Auth.js error page
- **WHEN** any auth flow fails (OAuth error, provisioning failure, invalid state, verification failure)
- **THEN** the user is redirected to `/auth/error?error=<safe-code>` (using Auth.js's own error codes: `Configuration`, `AccessDenied`, `Verification`, `Default`, `CredentialsSignin`, plus our `provisioning_failed`)
- **AND** the error page renders a mapped human-readable message per code
- **AND** underlying exception details are logged server-side but never rendered in the URL, DOM, or client bundle
