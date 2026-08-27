## Purpose

The `testing` capability establishes Nexora's automated-test discipline: which runner is used, how server code and React components are tested in the same repo without cross-contamination, how Keycloak and the database are mocked, how BDD scenarios are expressed as tests, and which behaviors MUST be covered by tests before implementation is considered complete.

## ADDED Requirements

### Requirement: Vitest as the test runner
The system SHALL use Vitest as the single test runner for both server-side and UI tests.

#### Scenario: Running all tests
- **WHEN** a developer runs `npm run test`
- **THEN** Vitest discovers and runs every test in the repository
- **AND** the process exits 0 only if every test passes

#### Scenario: Watch mode
- **WHEN** a developer runs `npm run test:watch`
- **THEN** Vitest runs in watch mode, re-running affected tests on file changes

#### Scenario: Coverage reporting
- **WHEN** a developer runs `npm run test:coverage`
- **THEN** Vitest produces a text summary and a machine-readable coverage report (v8 provider) under `coverage/`

### Requirement: Two test environments in one repo
The system SHALL run server tests in a Node environment and React component tests in a `jsdom` environment, isolated so DOM globals do not leak into server tests and Node-only APIs do not leak into UI tests.

#### Scenario: Server tests run in Node
- **WHEN** a test file matches the server pattern (`**/*.server.test.ts`, or lives under `services/**`, `lib/db/**`, `lib/auth/**`)
- **THEN** it runs in the Node project without `window`, `document`, or `navigator` defined

#### Scenario: Component tests run in jsdom
- **WHEN** a test file matches the UI pattern (`**/*.test.tsx` or lives under `components/**` and imports React)
- **THEN** it runs in the jsdom project with `window` and `document` available and `@testing-library/jest-dom` matchers loaded

#### Scenario: Cross-environment isolation
- **WHEN** a server test accidentally imports a component that touches the DOM
- **THEN** the test fails with a clear message indicating environment mismatch rather than silently succeeding

### Requirement: Keycloak / Auth.js mocked in tests
The system SHALL provide a reusable mock for the auth session helpers so tests never hit Keycloak over the network.

#### Scenario: Test asserts unauthenticated behavior
- **WHEN** a test declares "given the user is unauthenticated"
- **THEN** the test uses the shared `mockSession(null)` helper
- **AND** the code under test observes `getSession()` returning `null` without any HTTP call

#### Scenario: Test asserts authenticated behavior
- **WHEN** a test declares "given the user is authenticated as X"
- **THEN** the test uses the shared `mockSession({ user: { id, email, name, image }, expiresAt })` helper
- **AND** `getSession()` and the client-side session hook both resolve to the mocked user in that test

#### Scenario: No real Keycloak requests in tests
- **WHEN** any test runs
- **THEN** no outbound HTTP request is issued to the value of `KEYCLOAK_ISSUER`
- **AND** if such a request would be issued, the test fails fast rather than silently talking to a real service

### Requirement: Prisma / database mocked in tests
The system SHALL provide a reusable mock for the Prisma client so unit and service tests never touch a real database.

#### Scenario: Service test with mocked Prisma
- **WHEN** a service test imports the mocked Prisma client via the shared helper
- **THEN** the mock is a deep, type-safe stub (via `vitest-mock-extended`)
- **AND** the test can assert both call arguments and return values

#### Scenario: No real DB connection in tests
- **WHEN** any unit or service test runs
- **THEN** no TCP connection is opened to `DATABASE_URL`
- **AND** no migration is executed as a side effect of running tests

#### Scenario: Optional integration tests are opt-in
- **WHEN** the developer wants to run tests against a real ephemeral Postgres
- **THEN** they run `npm run test -- --project=integration` (or the documented equivalent)
- **AND** the default `npm run test` invocation does not require Docker or a live database

### Requirement: BDD Given/When/Then convention
The system SHALL support Given/When/Then structured tests for important user-facing and behavioral flows, using a small helper that maps directly onto Vitest's `describe`/`it` primitives.

#### Scenario: Writing a BDD test
- **WHEN** a developer writes a scenario using the `scenario("...", { given, when, then })` helper
- **THEN** the resulting test appears in the reporter output as one `it` block whose title reads "Scenario: <title>"
- **AND** the `given`/`when`/`then` blocks execute in order

#### Scenario: BDD reads directly from spec scenarios
- **WHEN** a spec file lists a Scenario (`#### Scenario: ...`) for a behavior tagged as "must be tested"
- **THEN** a corresponding automated test exists with a matching title
- **AND** the BDD test file lives alongside the code implementing that behavior (co-located)

### Requirement: Required test coverage of critical behaviors
The system SHALL have automated tests for the following behaviors before the change is considered complete. Coverage percentages alone are not sufficient; each item below MUST have at least one meaningful assertion of behavior.

#### Scenario: Auth helpers are tested
- **WHEN** the change is ready to merge
- **THEN** tests exist for `getSession()` (authenticated + unauthenticated), `requireSession()` (redirects when missing), and the client session hook (`loading` → `authenticated`/`unauthenticated` transitions)

#### Scenario: Protected-route middleware is tested
- **WHEN** the change is ready to merge
- **THEN** tests exist covering: unauthenticated request to `/app/**` redirects to sign-in with `callbackUrl` preserved; authenticated request to `/app/**` passes through; unauthenticated request to `/` is not redirected

#### Scenario: Service layer is tested
- **WHEN** the change is ready to merge
- **THEN** tests exist for `userService.getOrCreateUser` covering: creates on first login, reuses on subsequent login, updates changed profile fields, and returns a typed error `Result` when the underlying Prisma call throws

#### Scenario: Auth-aware Navbar is tested
- **WHEN** the change is ready to merge
- **THEN** tests exist covering: unauthenticated navbar shows "Sign in" and "Get started" controls; authenticated navbar shows the user's name/avatar and a Sign out control; loading state does not flash the wrong UI

#### Scenario: Auth error page is tested
- **WHEN** the change is ready to merge
- **THEN** tests exist covering `/auth/error` rendering safe messages for the enumerated `code` values without leaking raw error details

### Requirement: Deterministic and isolated tests
Tests SHALL be independent of run order, wall-clock time, and network conditions. A test SHALL NOT rely on state left behind by another test.

#### Scenario: No shared mutable state between tests
- **WHEN** a test mutates a mock or a module-scoped variable
- **THEN** it resets that state in `beforeEach`/`afterEach` (or uses `vi.resetAllMocks()`)
- **AND** running the same test file with `--sequence.shuffle` produces the same result

#### Scenario: No wall-clock dependence
- **WHEN** a test asserts against time-sensitive behavior (session expiry, `createdAt` fields)
- **THEN** it uses `vi.useFakeTimers()` or an explicit clock injected into the code under test
- **AND** does not rely on `new Date()` or `Date.now()` in test assertions

#### Scenario: No real network in unit and component tests
- **WHEN** any unit or component test runs
- **THEN** it does not issue an outbound network request; any such attempt fails the test explicitly rather than silently succeeding

### Requirement: Documented test scripts
The `package.json` SHALL expose a documented set of test scripts.

#### Scenario: Scripts are declared
- **WHEN** a developer inspects `package.json` scripts
- **THEN** they find at least `test`, `test:watch`, `test:coverage`, and (documented as optional) `test:integration`
- **AND** the README's "Testing" section describes when to use each
