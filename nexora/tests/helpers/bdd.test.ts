import { describe, expect } from "vitest";

import { scenario } from "./bdd";

describe("scenario() helper", () => {
  scenario<{ subject?: number; result?: number }>("runs given → when → then in order", {
    given: (ctx) => {
      ctx.subject = 2;
    },
    when: (ctx) => {
      ctx.result = (ctx.subject ?? 0) * 3;
    },
    then: (ctx) => {
      expect(ctx.result).toBe(6);
    },
  });

  scenario("supports an async when block", {
    when: async () => {
      await Promise.resolve();
    },
    then: () => {
      expect(true).toBe(true);
    },
  });
});
