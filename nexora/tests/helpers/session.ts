import { vi } from "vitest";

export type MockedSessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export type MockedSession = {
  user: MockedSessionUser;
  expires: string;
} | null;

let currentSession: MockedSession = null;

vi.mock("@/lib/auth/server", () => ({
  getSession: () => Promise.resolve(currentSession),
  requireSession: () => {
    if (!currentSession) {
      throw new Error("requireSession: not authenticated (mocked)");
    }
    return Promise.resolve(currentSession);
  },
  auth: (arg?: unknown) => {
    if (typeof arg === "function") {
      return (req: unknown) => {
        const augmented = Object.assign(req as object, {
          auth: currentSession,
        });
        return (arg as (r: unknown) => unknown)(augmented);
      };
    }
    return Promise.resolve(currentSession);
  },
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

export function mockSession(session: MockedSession): void {
  currentSession = session;
}

export function withAuthenticatedUser(user: Partial<MockedSessionUser> = {}): void {
  currentSession = {
    user: {
      id: user.id ?? "user_test_1",
      name: user.name ?? "Test User",
      email: user.email ?? "test@nexora.local",
      image: user.image ?? null,
    },
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
}
