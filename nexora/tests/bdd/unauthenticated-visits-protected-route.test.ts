import { NextRequest } from "next/server";
import { describe, expect } from "vitest";

import { scenario } from "@/tests/helpers/bdd";
import { mockSession } from "@/tests/helpers/session";
import { proxy } from "@/proxy";

type Ctx = {
  request?: NextRequest;
  response?: Response;
};

describe("Protected route enforcement", () => {
  scenario<Ctx>(
    "unauthenticated visitor requesting /app/dashboard is redirected to sign-in with callbackUrl preserved",
    {
      given: (ctx) => {
        mockSession(null);
        ctx.request = new NextRequest(
          new URL("http://localhost:3000/app/dashboard")
        );
      },
      when: async (ctx) => {
        ctx.response = await (proxy as unknown as (
          req: NextRequest,
          event?: unknown
        ) => Promise<Response>)(ctx.request!, {});
      },
      then: (ctx) => {
        expect(ctx.response).toBeDefined();
        expect(ctx.response!.status).toBe(307);
        const location = ctx.response!.headers.get("location");
        expect(location).toBeTruthy();
        const url = new URL(location!);
        expect(url.pathname).toBe("/auth/signin");
        expect(url.searchParams.get("callbackUrl")).toBe("/app/dashboard");
      },
    }
  );
});
