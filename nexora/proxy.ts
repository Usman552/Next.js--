import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";

/**
 * Protected-route enforcement. Runs before every request to `/app/**` and
 * redirects unauthenticated visitors to /auth/signin, preserving the original
 * destination as `callbackUrl` so post-login returns the user there.
 *
 * File name is `proxy.ts` (not `middleware.ts`) per Next.js 16's rename.
 *
 * NOTE: this pulls `@/lib/auth/server`, which transitively imports the Prisma
 * client. Next.js's build tree-shaking keeps the proxy bundle manageable, and
 * the sign-in Server Action / OAuth callback stays on the full server route.
 * If bundle size ever becomes a concern, split the proxy's NextAuth() from the
 * server one (see `lib/auth/config.ts` — `proxyAuthConfig` is already Edge-
 * safe).
 */
export const proxy = auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
  return undefined;
});

export const config = {
  matcher: ["/app/:path*"],
};
