import "server-only";

import NextAuth, { type Session } from "next-auth";
import { redirect } from "next/navigation";

import {
  buildAuthConfig,
  CREDENTIALS_PROVIDER_ID,
} from "@/lib/auth/config";
import { isErr, isOk } from "@/lib/result";
import { userService } from "@/services/users/user.service";

/**
 * Server-side auth: wires the Credentials `authorize()` to the real
 * verifyCredentials service, and installs the `signIn` callback that
 * provisions OAuth users on first login.
 */
const serverAuthConfig = buildAuthConfig(async (input) => {
  const { email, password } = input as { email: string; password: string };
  const result = await userService.verifyCredentials({ email, password });
  if (isErr(result)) return null;
  return {
    id: result.value.id,
    email: result.value.email,
    name: result.value.name,
    image: result.value.image,
  };
});

serverAuthConfig.callbacks = {
  ...serverAuthConfig.callbacks,
  async signIn(params: {
    user: { id?: string; email?: string | null; name?: string | null; image?: string | null };
    account?: { provider: string; providerAccountId?: string } | null;
    profile?: Record<string, unknown>;
  }) {
    const { user, account, profile } = params;
    // Credentials: the authorize() above already validated + returned the
    // application User. Nothing more to do here.
    if (!account || account.provider === CREDENTIALS_PROVIDER_ID) {
      return Boolean(user?.id);
    }

    // OAuth: provision (or link) on first login.
    const providerAccountId =
      account.providerAccountId ??
      (typeof (profile as { sub?: unknown } | undefined)?.sub === "string"
        ? ((profile as { sub: string }).sub)
        : null);
    if (!providerAccountId) return false;

    const result = await userService.getOrCreateUser({
      providerId: account.provider,
      providerAccountId,
      email: user.email ?? null,
      name: user.name ?? null,
      image: user.image ?? null,
    });

    if (isOk(result)) {
      user.id = result.value.id;
      return true;
    }
    // Surface a safe error page; Auth.js will redirect.
    return `/auth/error?error=provisioning_failed`;
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(serverAuthConfig);

/**
 * Optional session read for Server Components, Server Actions, and route
 * handlers. Returns `null` for unauthenticated visitors — never throws.
 */
export async function getSession(): Promise<Session | null> {
  return auth();
}

/**
 * Required session read. Redirects to /auth/signin when no session exists.
 */
export async function requireSession(callbackUrl = "/app"): Promise<Session> {
  const session = await auth();
  if (!session) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}
