import { describe, expect } from "vitest";

import { scenario } from "@/tests/helpers/bdd";
import { proxyAuthConfig } from "@/lib/auth/config";

type Ctx = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback?: (arg: any) => any;
  result?: Record<string, unknown>;
};

describe("Session callback strips upstream tokens", () => {
  scenario<Ctx>(
    "given a token with accessToken/refreshToken/idToken, the returned session must not contain them",
    {
      given: (ctx) => {
        ctx.callback = proxyAuthConfig.callbacks?.session;
      },
      when: async (ctx) => {
        const raw = await ctx.callback!({
          session: {
            user: {
              id: "user_1",
              name: "Priya",
              email: "priya@nexora.local",
              image: null,
            },
            expires: new Date(Date.now() + 60_000).toISOString(),
          } as never,
          token: {
            sub: "provider-sub-1",
            accessToken: "AT_SECRET",
            refreshToken: "RT_SECRET",
            idToken: "IT_SECRET",
          } as never,
        } as never);
        ctx.result = raw as unknown as Record<string, unknown>;
      },
      then: (ctx) => {
        const serialized = JSON.stringify(ctx.result);
        expect(serialized).not.toContain("AT_SECRET");
        expect(serialized).not.toContain("RT_SECRET");
        expect(serialized).not.toContain("IT_SECRET");
        expect(ctx.result).not.toHaveProperty("accessToken");
        expect(ctx.result).not.toHaveProperty("refreshToken");
        expect(ctx.result).not.toHaveProperty("idToken");
      },
    }
  );
});
