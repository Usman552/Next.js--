import { vi } from "vitest";

type ClientSession = {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
} | null;

type ClientStatus = "loading" | "authenticated" | "unauthenticated";

let currentClientSession: ClientSession = null;
let currentClientStatus: ClientStatus = "unauthenticated";

export const signInMock = vi.fn();
export const signOutMock = vi.fn();

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: () => ({
    data: currentClientSession,
    status: currentClientStatus,
    update: vi.fn(),
  }),
  signIn: (...args: unknown[]) => signInMock(...args),
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

export function setClientSession(status: ClientStatus, session: ClientSession = null): void {
  currentClientStatus = status;
  currentClientSession = session;
}
