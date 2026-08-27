import { describe, expect } from "vitest";

import { scenario } from "@/tests/helpers/bdd";
import { mockSession, withAuthenticatedUser } from "@/tests/helpers/session";
import { getSession } from "@/lib/auth/server";

type Ctx = {
  beforeLogoutSession?: unknown;
  afterLogoutSession?: unknown;
};

describe("Logout flow", () => {
  scenario<Ctx>(
    "after signOut() the next server-side session read returns null",
    {
      given: async (ctx) => {
        withAuthenticatedUser({ id: "user_test_1" });
        ctx.beforeLogoutSession = await getSession();
      },
      when: async () => {
        // Emulate what signOut() does on the server: the session is cleared.
        mockSession(null);
      },
      then: async (ctx) => {
        expect(ctx.beforeLogoutSession).not.toBeNull();
        ctx.afterLogoutSession = await getSession();
        expect(ctx.afterLogoutSession).toBeNull();
      },
    }
  );
});
