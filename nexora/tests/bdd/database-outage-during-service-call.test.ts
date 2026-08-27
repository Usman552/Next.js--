import { describe, expect, vi } from "vitest";

import "@/tests/helpers/prisma";
import { prismaMock } from "@/tests/helpers/prisma";
import { scenario } from "@/tests/helpers/bdd";
import { isErr } from "@/lib/result";
import { userService } from "@/services/users/user.service";

type Ctx = {
  result?: Awaited<ReturnType<typeof userService.getOrCreateUser>>;
  restoreLog?: () => void;
};

describe("Database outage handling", () => {
  scenario<Ctx>(
    "when Prisma throws, the service returns a typed err with a safe message and never leaks the raw error",
    {
      given: (ctx) => {
        prismaMock.account.findUnique.mockRejectedValueOnce(
          new Error("PANIC: connection refused by upstream Postgres cluster")
        );
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        ctx.restoreLog = () => spy.mockRestore();
      },
      when: async (ctx) => {
        ctx.result = await userService.getOrCreateUser({
          providerId: "keycloak",
          providerAccountId: "sub-boom",
          email: "boom@nexora.local",
          name: "Boom",
          image: null,
        });
      },
      then: (ctx) => {
        expect(isErr(ctx.result!)).toBe(true);
        if (isErr(ctx.result!)) {
          expect(ctx.result!.error.code).toBe("internal");
          expect(ctx.result!.error.message).toBe("Something went wrong");
          expect(ctx.result!.error.message).not.toContain("PANIC");
          expect(ctx.result!.error.message).not.toContain("connection refused");
        }
      },
      cleanup: (ctx) => {
        ctx.restoreLog?.();
      },
    }
  );
});
