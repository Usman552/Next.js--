import { NextRequest } from "next/server";
import { describe, expect } from "vitest";

import { scenario } from "@/tests/helpers/bdd";
import { withAuthenticatedUser } from "@/tests/helpers/session";
import { proxy } from "@/proxy";

type Ctx = {
  request?: NextRequest;
  response?: Response | undefined;
};

describe("Protected route enforcement", () => {
  scenario<Ctx>(
    "authenticated visitor requesting /app/dashboard is allowed through",
    {
      given: (ctx) => {
        withAuthenticatedUser({ id: "user_test_1", name: "Priya" });
        ctx.request = new NextRequest(
          new URL("http://localhost:3000/app/dashboard")
        );
      },
      when: async (ctx) => {
        ctx.response = await (proxy as unknown as (
          req: NextRequest,
          event?: unknown
        ) => Promise<Response | undefined>)(ctx.request!, {});
      },
      then: (ctx) => {
        // The inner middleware returns `undefined` → NextResponse.next(). Either
        // undefined or a 2xx pass-through is acceptable.
        expect(
          ctx.response === undefined ||
            ((ctx.response as Response).status >= 200 &&
              (ctx.response as Response).status < 300)
        ).toBe(true);
      },
    }
  );
});
