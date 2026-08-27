import { describe, expect, it } from "vitest";

import {
  err,
  isErr,
  isOk,
  ok,
  unwrap,
  type Result,
  type ServiceError,
} from "@/lib/result";

describe("lib/result", () => {
  it("ok(value) yields an ok Result with the value", () => {
    const result: Result<number> = ok(42);
    expect(result.ok).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBe(42);
    }
  });

  it("err(error) yields an err Result with the error", () => {
    const error: ServiceError = { code: "not_found", message: "missing" };
    const result: Result<number> = err(error);
    expect(result.ok).toBe(false);
    if (isErr(result)) {
      expect(result.error.code).toBe("not_found");
      expect(result.error.message).toBe("missing");
    }
  });

  it("isOk / isErr are mutually exclusive narrowing guards", () => {
    const good = ok("value");
    const bad = err({ code: "internal", message: "boom" });

    expect(isOk(good)).toBe(true);
    expect(isErr(good)).toBe(false);
    expect(isOk(bad)).toBe(false);
    expect(isErr(bad)).toBe(true);
  });

  it("unwrap returns the value for ok Results", () => {
    expect(unwrap(ok(7))).toBe(7);
  });

  it("unwrap throws for err Results and preserves the ServiceError", () => {
    const error: ServiceError = { code: "internal", message: "database down" };
    let caught: unknown;
    try {
      unwrap(err(error));
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toContain("internal");
    expect((caught as Error).message).toContain("database down");
  });

  it("ServiceError.code enumerates the allowed codes at the type level", () => {
    const codes: ServiceError["code"][] = [
      "not_found",
      "conflict",
      "validation",
      "internal",
    ];
    expect(codes.length).toBe(4);
  });
});
