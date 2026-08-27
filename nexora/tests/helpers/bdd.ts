import { it } from "vitest";

type Ctx = Record<string, unknown>;

type ScenarioHooks<C extends Ctx = Ctx> = {
  given?: (ctx: C) => void | Promise<void>;
  when: (ctx: C) => void | Promise<void>;
  then: (ctx: C) => void | Promise<void>;
  cleanup?: (ctx: C) => void | Promise<void>;
};

export function scenario<C extends Ctx = Ctx>(
  title: string,
  hooks: ScenarioHooks<C>
): void {
  it(`Scenario: ${title}`, async () => {
    const ctx = {} as C;
    try {
      if (hooks.given) await hooks.given(ctx);
      await hooks.when(ctx);
      await hooks.then(ctx);
    } finally {
      if (hooks.cleanup) await hooks.cleanup(ctx);
    }
  });
}
