import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";

import { mockSession } from "@/tests/helpers/session";

import { proxy } from "@/proxy";

function makeRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(`http://localhost:3000${pathname}`));
}

async function runProxy(pathname: string): Promise<Response | undefined> {
  const req = makeRequest(pathname);
  // Auth.js's `auth(fn)` returns a NextMiddleware-shaped `(req, event) => ...`
  // callable. Tests pass a minimal event stub.
  const result = await (proxy as unknown as (
    req: NextRequest,
    event?: unknown
  ) => Promise<Response | undefined>)(req, {});
  return result;
}

describe("proxy (protected route enforcement)", () => {
  beforeEach(() => {
    mockSession(null);
  });

  it("redirects unauthenticated /app/** to /auth/signin with callbackUrl preserved", async () => {
    mockSession(null);
    const res = await runProxy("/app/dashboard");
    expect(res).toBeDefined();
    expect(res!.status).toBe(307);
    const location = res!.headers.get("location");
    expect(location).toBeTruthy();
    const url = new URL(location!);
    expect(url.pathname).toBe("/auth/signin");
    expect(url.searchParams.get("callbackUrl")).toBe("/app/dashboard");
  });

  it("passes /app/** through when a session exists (returns undefined = NextResponse.next())", async () => {
    mockSession({
      user: {
        id: "user_1",
        name: "Test",
        email: "test@nexora.local",
        image: null,
      },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    const res = await runProxy("/app/dashboard");
    // Auth.js's `auth((req) => {...})` returns whatever the inner function
    // returns; if the inner function returns nothing, the request continues.
    expect(res === undefined || (res as Response).status === 200).toBe(true);
  });
});
