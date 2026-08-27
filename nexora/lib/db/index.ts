import "server-only";

import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/env";

// Singleton PrismaClient. In development we memoize on `globalThis` so HMR
// reloads reuse the same client (avoiding "too many clients" from a runaway
// connection count).
declare global {
  var __nexoraPrisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma: PrismaClient =
  globalThis.__nexoraPrisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalThis.__nexoraPrisma = prisma;
}
