import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = process.env;

const VALID_ENV = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/nexora",
  DIRECT_URL: "postgresql://user:pass@localhost:5432/nexora",
  AUTH_SECRET: "at-least-32-chars-long-random-secret-string-please",
  AUTH_URL: "http://localhost:3000",
  NODE_ENV: "test",
} as const;

async function importFresh() {
  vi.resetModules();
  return await import("@/lib/env");
}

beforeEach(() => {
  process.env = { ...VALID_ENV } as NodeJS.ProcessEnv;
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe("lib/env", () => {
  it("returns a typed env object when every required variable is set", async () => {
    const { env } = await importFresh();

    expect(env.DATABASE_URL).toBe(VALID_ENV.DATABASE_URL);
    expect(env.AUTH_SECRET).toBe(VALID_ENV.AUTH_SECRET);
    expect(env.AUTH_URL).toBe(VALID_ENV.AUTH_URL);
    expect(env.NODE_ENV).toBe("test");
    expect(env.GOOGLE_ENABLED).toBe(false);
    expect(env.GITHUB_ENABLED).toBe(false);
    expect(env.AUTH_LOGOUT_FEDERATED).toBe(false);
  });

  it("throws when DATABASE_URL is missing and names the key without logging the value", async () => {
    delete (process.env as Record<string, string | undefined>).DATABASE_URL;
    await expect(importFresh()).rejects.toThrow(/DATABASE_URL/);
  });

  it("throws when AUTH_URL is not a URL", async () => {
    process.env.AUTH_URL = "not-a-url";
    await expect(importFresh()).rejects.toThrow(/AUTH_URL/);
  });

  it("throws when AUTH_SECRET is shorter than 32 characters", async () => {
    process.env.AUTH_SECRET = "too-short";
    await expect(importFresh()).rejects.toThrow(/AUTH_SECRET/);
  });

  it("defaults DIRECT_URL to DATABASE_URL when unset", async () => {
    delete (process.env as Record<string, string | undefined>).DIRECT_URL;
    const { env } = await importFresh();
    expect(env.DIRECT_URL).toBe(VALID_ENV.DATABASE_URL);
  });

  it("marks GOOGLE_ENABLED when both id + secret are set, hides otherwise", async () => {
    process.env.GOOGLE_CLIENT_ID = "gid";
    process.env.GOOGLE_CLIENT_SECRET = "gsec";
    const enabled = await importFresh();
    expect(enabled.env.GOOGLE_ENABLED).toBe(true);

    delete (process.env as Record<string, string | undefined>).GOOGLE_CLIENT_ID;
    delete (process.env as Record<string, string | undefined>).GOOGLE_CLIENT_SECRET;
    const disabled = await importFresh();
    expect(disabled.env.GOOGLE_ENABLED).toBe(false);
  });

  it("marks GITHUB_ENABLED when both id + secret are set", async () => {
    process.env.GITHUB_CLIENT_ID = "ghid";
    process.env.GITHUB_CLIENT_SECRET = "ghsec";
    const { env } = await importFresh();
    expect(env.GITHUB_ENABLED).toBe(true);
  });

  it("rejects when only one half of an OAuth pair is set", async () => {
    process.env.GOOGLE_CLIENT_ID = "gid";
    // no GOOGLE_CLIENT_SECRET
    await expect(importFresh()).rejects.toThrow(/GOOGLE_CLIENT_/);
  });

  it("does not include the offending value in the thrown message", async () => {
    process.env.AUTH_URL = "secret-value-that-must-not-leak";
    let caughtMessage = "";
    try {
      await importFresh();
    } catch (error) {
      caughtMessage = (error as Error).message;
    }
    expect(caughtMessage).toContain("AUTH_URL");
    expect(caughtMessage).not.toContain("secret-value-that-must-not-leak");
  });
});
