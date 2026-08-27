"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { ComponentProps } from "react";

/**
 * Thin re-export of Auth.js's `<SessionProvider>` so we can wrap the root
 * layout without importing `next-auth/react` from a Server Component tree.
 */
export function SessionProvider(
  props: ComponentProps<typeof NextAuthSessionProvider>
) {
  return <NextAuthSessionProvider {...props} />;
}
