import { describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

import "@/tests/helpers/prisma";
import { prismaMock } from "@/tests/helpers/prisma";
import { isErr, isOk } from "@/lib/result";
import { userService } from "@/services/users/user.service";

type UserRow = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function makeUser(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: "user_1",
    email: "person@nexora.local",
    name: "Test Person",
    image: null,
    password: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("userService.getOrCreateUser (OAuth)", () => {
  it("creates a User + Account inside a transaction on first login", async () => {
    prismaMock.account.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.findUnique.mockResolvedValueOnce(null); // no same-email link

    const created = makeUser({ id: "user_new" });
    prismaMock.$transaction.mockImplementationOnce(async (fn: unknown) =>
      (fn as (tx: typeof prismaMock) => Promise<unknown>)(prismaMock)
    );
    prismaMock.user.create.mockResolvedValueOnce(created as never);
    prismaMock.account.create.mockResolvedValueOnce({
      id: "acct_new",
      userId: "user_new",
      provider: "google",
      providerAccountId: "sub-new",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const result = await userService.getOrCreateUser({
      providerId: "google",
      providerAccountId: "sub-new",
      email: "person@nexora.local",
      name: "Test Person",
      image: null,
    });

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.account.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.account.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          provider: "google",
          providerAccountId: "sub-new",
        }),
      })
    );
    if (isOk(result)) {
      expect(result.value.id).toBe("user_new");
    } else {
      throw new Error(`expected ok, got err(${result.error.code})`);
    }
  });

  it("links to an existing User by email when no Account exists (cross-provider linkage)", async () => {
    const existing = makeUser({ id: "user_existing" });
    prismaMock.account.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.findUnique.mockResolvedValueOnce(existing as never);
    prismaMock.$transaction.mockImplementationOnce(async (fn: unknown) =>
      (fn as (tx: typeof prismaMock) => Promise<unknown>)(prismaMock)
    );
    prismaMock.account.create.mockResolvedValueOnce({
      id: "acct_link",
      userId: existing.id,
      provider: "github",
      providerAccountId: "gh-321",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const result = await userService.getOrCreateUser({
      providerId: "github",
      providerAccountId: "gh-321",
      email: existing.email,
      name: existing.name,
      image: existing.image,
    });

    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.account.create).toHaveBeenCalledTimes(1);
    if (isOk(result)) {
      expect(result.value.id).toBe(existing.id);
    } else {
      throw new Error(`expected ok, got err(${result.error.code})`);
    }
  });

  it("returns the existing user on subsequent login without creating duplicates", async () => {
    const existing = makeUser();
    prismaMock.account.findUnique.mockResolvedValueOnce({
      id: "acct_1",
      userId: existing.id,
      provider: "google",
      providerAccountId: "sub-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: existing,
    } as never);

    const result = await userService.getOrCreateUser({
      providerId: "google",
      providerAccountId: "sub-123",
      email: existing.email,
      name: existing.name,
      image: existing.image,
    });

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.account.create).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    if (isOk(result)) {
      expect(result.value.id).toBe(existing.id);
    } else {
      throw new Error(`expected ok, got err(${result.error.code})`);
    }
  });

  it('returns err({ code: "internal" }) with a safe message when Prisma throws', async () => {
    prismaMock.account.findUnique.mockRejectedValueOnce(
      new Error("PANIC: connection refused by upstream Postgres cluster")
    );
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await userService.getOrCreateUser({
      providerId: "google",
      providerAccountId: "sub-boom",
      email: "boom@nexora.local",
      name: "Boom",
      image: null,
    });

    if (isErr(result)) {
      expect(result.error.code).toBe("internal");
      expect(result.error.message).toBe("Something went wrong");
      expect(result.error.message).not.toContain("PANIC");
      expect(result.error.message).not.toContain("connection refused");
    } else {
      throw new Error("expected err, got ok");
    }
    consoleSpy.mockRestore();
  });
});

describe("userService.createCredentialsUser", () => {
  it("bcrypt-hashes the password and inserts a User row", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    const created = makeUser({
      id: "user_cred_1",
      email: "signup@nexora.local",
      name: "Sign Up User",
      password: "$2b$10$hash",
    });
    prismaMock.user.create.mockResolvedValueOnce(created as never);

    const result = await userService.createCredentialsUser({
      email: "SignUp@Nexora.Local",
      name: "Sign Up User",
      password: "StrongP4ssword",
    });

    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    const call = prismaMock.user.create.mock.calls[0][0] as {
      data: { email: string; password: string; name: string };
    };
    // Email normalized to lowercase.
    expect(call.data.email).toBe("signup@nexora.local");
    // Password is a bcrypt hash, NOT plaintext.
    expect(call.data.password).not.toBe("StrongP4ssword");
    expect(call.data.password).toMatch(/^\$2[aby]\$/);
    // The hash actually verifies the original plaintext.
    expect(await bcrypt.compare("StrongP4ssword", call.data.password)).toBe(true);
    if (isOk(result)) {
      expect(result.value.email).toBe("signup@nexora.local");
    } else {
      throw new Error(`expected ok, got err(${result.error.code})`);
    }
  });

  it('returns err({ code: "conflict" }) when the email is already registered', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(
      makeUser({ email: "taken@nexora.local" }) as never
    );

    const result = await userService.createCredentialsUser({
      email: "taken@nexora.local",
      name: "Someone",
      password: "AnotherP4ss",
    });

    expect(prismaMock.user.create).not.toHaveBeenCalled();
    if (isErr(result)) {
      expect(result.error.code).toBe("conflict");
    } else {
      throw new Error("expected err");
    }
  });
});

describe("userService.verifyCredentials", () => {
  it("returns ok with the User when the password matches", async () => {
    const password = "CorrectHorseBattery42";
    const passwordHash = await bcrypt.hash(password, 4); // low cost for test speed
    const user = makeUser({
      id: "user_login",
      email: "login@nexora.local",
      password: passwordHash,
    });
    prismaMock.user.findUnique.mockResolvedValueOnce(user as never);

    const result = await userService.verifyCredentials({
      email: "LOGIN@nexora.local", // case-insensitive
      password,
    });

    if (isOk(result)) {
      expect(result.value.id).toBe("user_login");
    } else {
      throw new Error(`expected ok, got err(${result.error.code})`);
    }
  });

  it('returns err({ code: "not_found" }) with a generic message when the password is wrong', async () => {
    const user = makeUser({
      email: "login@nexora.local",
      password: await bcrypt.hash("actual-password", 4),
    });
    prismaMock.user.findUnique.mockResolvedValueOnce(user as never);

    const result = await userService.verifyCredentials({
      email: "login@nexora.local",
      password: "wrong-password",
    });

    if (isErr(result)) {
      expect(result.error.code).toBe("not_found");
      expect(result.error.message).toBe("Email or password is incorrect");
    } else {
      throw new Error("expected err");
    }
  });

  it('returns the same generic "not_found" when the email does not exist (no user-enumeration leak)', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const result = await userService.verifyCredentials({
      email: "nobody@nexora.local",
      password: "irrelevant",
    });

    if (isErr(result)) {
      expect(result.error.code).toBe("not_found");
      expect(result.error.message).toBe("Email or password is incorrect");
    } else {
      throw new Error("expected err");
    }
  });

  it('returns the same generic "not_found" for an OAuth-only account (password field is null)', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(
      makeUser({ email: "oauth-only@nexora.local", password: null }) as never
    );

    const result = await userService.verifyCredentials({
      email: "oauth-only@nexora.local",
      password: "anything",
    });

    if (isErr(result)) {
      expect(result.error.code).toBe("not_found");
      expect(result.error.message).toBe("Email or password is incorrect");
    } else {
      throw new Error("expected err");
    }
  });
});
