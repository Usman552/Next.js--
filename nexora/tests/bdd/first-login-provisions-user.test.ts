import { describe, expect } from "vitest";

import "@/tests/helpers/prisma";
import { prismaMock } from "@/tests/helpers/prisma";
import { scenario } from "@/tests/helpers/bdd";
import { isOk } from "@/lib/result";
import { userService } from "@/services/users/user.service";

type Ctx = {
  input?: Parameters<typeof userService.getOrCreateUser>[0];
  result?: Awaited<ReturnType<typeof userService.getOrCreateUser>>;
};

describe("First-login user provisioning", () => {
  scenario<Ctx>(
    "no matching Account → getOrCreateUser creates User + Account inside a transaction",
    {
      given: (ctx) => {
        prismaMock.account.findUnique.mockResolvedValueOnce(null);
        prismaMock.$transaction.mockImplementationOnce(async (fn: unknown) =>
          (fn as (tx: typeof prismaMock) => Promise<unknown>)(prismaMock)
        );
        prismaMock.user.create.mockResolvedValueOnce({
          id: "user_new_from_bdd",
          email: "priya@nexora.local",
          name: "Priya",
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as never);
        prismaMock.user.findUnique.mockResolvedValueOnce(null);
        prismaMock.account.create.mockResolvedValueOnce({
          id: "acct_new",
          userId: "user_new_from_bdd",
          provider: "google",
          providerAccountId: "sub-priya",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as never);
        ctx.input = {
          providerId: "google",
          providerAccountId: "sub-priya",
          email: "priya@nexora.local",
          name: "Priya",
          image: null,
        };
      },
      when: async (ctx) => {
        ctx.result = await userService.getOrCreateUser(ctx.input!);
      },
      then: (ctx) => {
        expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
        expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
        expect(prismaMock.account.create).toHaveBeenCalledTimes(1);
        expect(isOk(ctx.result!)).toBe(true);
        if (isOk(ctx.result!)) {
          expect(ctx.result!.value.id).toBe("user_new_from_bdd");
        }
      },
    }
  );
});
