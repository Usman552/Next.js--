import { describe, expect, it } from "vitest";

import {
  CREDENTIALS_PROVIDER_ID,
  proxyAuthConfig,
} from "@/lib/auth/config";

type AnyProvider = Record<string, unknown> | ((...args: unknown[]) => Record<string, unknown>);

function providerId(p: AnyProvider): string | undefined {
  const resolved = typeof p === "function" ? p() : p;
  return typeof resolved.id === "string" ? (resolved.id as string) : undefined;
}

describe("lib/auth/config", () => {
  it("always registers the Credentials provider", () => {
    expect(Array.isArray(proxyAuthConfig.providers)).toBe(true);
    const ids = (proxyAuthConfig.providers as unknown as AnyProvider[]).map(providerId);
    expect(ids).toContain(CREDENTIALS_PROVIDER_ID);
  });

  it("does not register Google/GitHub in the test env (their env vars are unset by default)", () => {
    const ids = (proxyAuthConfig.providers as unknown as AnyProvider[]).map(providerId);
    expect(ids).not.toContain("google");
    expect(ids).not.toContain("github");
  });

  it("uses the JWT session strategy", () => {
    expect(proxyAuthConfig.session?.strategy).toBe("jwt");
  });

  it('routes sign-in to "/auth/signin" and errors to "/auth/error"', () => {
    expect(proxyAuthConfig.pages?.signIn).toBe("/auth/signin");
    expect(proxyAuthConfig.pages?.error).toBe("/auth/error");
  });

  it("strips accessToken / refreshToken / idToken in the session callback", async () => {
    const callback = proxyAuthConfig.callbacks?.session;
    expect(typeof callback).toBe("function");

    const raw = await callback!({
      session: {
        user: {
          id: "user_1",
          name: "Test",
          email: "test@nexora.local",
          image: null,
        },
        expires: new Date().toISOString(),
      } as never,
      token: {
        userId: "user_1",
        accessToken: "secret-access-token",
        refreshToken: "secret-refresh-token",
        idToken: "secret-id-token",
        sub: "provider-sub-123",
      } as never,
    } as never);

    const flat = JSON.stringify(raw);
    expect(flat).not.toContain("secret-access-token");
    expect(flat).not.toContain("secret-refresh-token");
    expect(flat).not.toContain("secret-id-token");
    expect(raw).not.toHaveProperty("accessToken");
    expect(raw).not.toHaveProperty("refreshToken");
    expect(raw).not.toHaveProperty("idToken");
  });

  it("session callback exposes user.id from the token", async () => {
    const callback = proxyAuthConfig.callbacks?.session;
    const result = await callback!({
      session: {
        user: {
          id: "will-be-overwritten",
          name: "Test",
          email: "test@nexora.local",
          image: null,
        },
        expires: new Date().toISOString(),
      } as never,
      token: { userId: "user_from_token" } as never,
    } as never);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result as any).user.id).toBe("user_from_token");
  });
});
