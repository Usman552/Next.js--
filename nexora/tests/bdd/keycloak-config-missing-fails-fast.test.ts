import { afterEach, beforeEach, describe, expect, vi } from "vitest";

import { scenario } from "@/tests/helpers/bdd";

const ORIGINAL_ENV = process.env;

type Ctx = {
  logSpy?: ReturnType<typeof vi.spyOn>;
  errSpy?: ReturnType<typeof vi.spyOn>;
  caught?: unknown;
};

/**
 * Retained after the Keycloak → multi-provider pivot. The old test targeted
 * `KEYCLOAK_ISSUER`; that variable no longer exists. This scenario proves the
 * same fail-fast behaviour on `AUTH_URL` (a required variable in the new set).
 */
describe("Environment validation fails fast", () => {
  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      DATABASE_URL: "postgresql://x:y@localhost:5432/z",
      DIRECT_URL: "postgresql://x:y@localhost:5432/z",
      AUTH_SECRET: "0".repeat(40),
      NODE_ENV: "test",
    } as NodeJS.ProcessEnv;
    // Remove AUTH_URL from base — each scenario sets it explicitly.
    delete (process.env as Record<string, string | undefined>).AUTH_URL;
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  scenario<Ctx>(
    "when AUTH_URL is not a URL, importing lib/env throws and names the key without leaking the value",
    {
      given: (ctx) => {
        process.env.AUTH_URL = "definitely-not-a-secret-value";
        ctx.logSpy = vi
          .spyOn(console, "log")
          .mockImplementation(() => undefined);
        ctx.errSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => undefined);
      },
      when: async (ctx) => {
        vi.resetModules();
        try {
          await import("@/lib/env");
        } catch (error) {
          ctx.caught = error;
        }
      },
      then: (ctx) => {
        expect(ctx.caught).toBeInstanceOf(Error);
        const message = (ctx.caught as Error).message;
        expect(message).toContain("AUTH_URL");
        expect(message).not.toContain("definitely-not-a-secret-value");
        const logCalls = (ctx.logSpy!.mock.calls.flat() as unknown[])
          .map((v) => String(v))
          .join("\n");
        const errCalls = (ctx.errSpy!.mock.calls.flat() as unknown[])
          .map((v) => String(v))
          .join("\n");
        expect(logCalls).not.toContain("definitely-not-a-secret-value");
        expect(errCalls).not.toContain("definitely-not-a-secret-value");
      },
      cleanup: (ctx) => {
        ctx.logSpy?.mockRestore();
        ctx.errSpy?.mockRestore();
      },
    }
  );
});
