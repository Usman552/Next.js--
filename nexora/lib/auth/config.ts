import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { env } from "@/lib/env";

/**
 * NextAuth v5 base configuration.
 *
 * `providers` is built dynamically:
 *  - Google is included only when GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET are set.
 *  - GitHub is included only when GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET are set.
 *  - Credentials is always included; its `authorize()` in server.ts delegates
 *    to userService.verifyCredentials.
 *
 * The `session` callback narrows what reaches Client Components: upstream OAuth
 * tokens (accessToken, refreshToken, idToken) never enter React props.
 *
 * NOTE: Keep this file free of `import "server-only"` and free of any Prisma
 * import — it is loaded by `proxy.ts`, which must stay bundle-lean.
 */

const CREDENTIALS_INPUT_SCHEMA = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const CREDENTIALS_PROVIDER_ID = "credentials";
export const GOOGLE_PROVIDER_ID = "google";
export const GITHUB_PROVIDER_ID = "github";

/** Provider IDs enabled at boot for this deployment. */
export const enabledProviderIds: Array<
  | typeof CREDENTIALS_PROVIDER_ID
  | typeof GOOGLE_PROVIDER_ID
  | typeof GITHUB_PROVIDER_ID
> = [
  ...(env.GOOGLE_ENABLED ? ([GOOGLE_PROVIDER_ID] as const) : []),
  ...(env.GITHUB_ENABLED ? ([GITHUB_PROVIDER_ID] as const) : []),
  CREDENTIALS_PROVIDER_ID,
];

function buildProviders(
  authorize: (input: unknown) => Promise<unknown>
): Provider[] {
  const providers: Provider[] = [];

  if (env.GOOGLE_ENABLED) {
    providers.push(
      Google({
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  if (env.GITHUB_ENABLED) {
    providers.push(
      GitHub({
        clientId: env.GITHUB_CLIENT_ID!,
        clientSecret: env.GITHUB_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  providers.push(
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = CREDENTIALS_INPUT_SCHEMA.safeParse(raw);
        if (!parsed.success) return null;
        const user = (await authorize(parsed.data)) as {
          id: string;
          email: string | null;
          name: string | null;
          image: string | null;
        } | null;
        return user;
      },
    })
  );

  return providers;
}

/**
 * Build the auth config. `verifyCredentials` is injected so this module has no
 * static dependency on the service/Prisma layer — `proxy.ts` calls the
 * `buildAuthConfig()` factory with a no-op authorize (proxy never runs sign-in,
 * only checks JWT); `server.ts` calls it with the real service.
 */
export function buildAuthConfig(
  verifyCredentials: (input: unknown) => Promise<unknown>
): NextAuthConfig {
  return {
    providers: buildProviders(verifyCredentials),
    session: { strategy: "jwt" },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
    callbacks: {
      async session(params) {
        const session = params.session as {
          user: { id?: string; name?: string | null; email?: string | null; image?: string | null };
          expires: string;
        };
        const token = params.token as Record<string, unknown>;
        const userId = token.userId ?? token.sub;
        return {
          expires: session.expires,
          user: {
            ...session.user,
            id: typeof userId === "string" ? userId : session.user.id,
          },
        };
      },
      async jwt(params) {
        const token = params.token as Record<string, unknown>;
        const user = params.user as { id?: string } | undefined;
        if (user?.id) {
          token.userId = user.id;
        }
        return token;
      },
    },
  };
}

/**
 * Edge-safe config for the Proxy. Credentials never authenticates from the
 * proxy path — the proxy only inspects an already-issued JWT — so the
 * authorize function is a no-op.
 */
export const proxyAuthConfig: NextAuthConfig = buildAuthConfig(async () => null);
