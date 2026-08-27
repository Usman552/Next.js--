import "server-only";

import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";

import { prisma } from "@/lib/db";
import { err, ok, type Result } from "@/lib/result";
import { normalizeEmail, userRepo } from "@/services/users/user.repo";

const BCRYPT_COST = 10;

export type GetOrCreateUserInput = {
  providerId: string;
  providerAccountId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

export type CreateCredentialsUserInput = {
  email: string;
  name: string;
  password: string;
};

export type VerifyCredentialsInput = {
  email: string;
  password: string;
};

function needsProfileUpdate(
  existing: Pick<User, "email" | "name" | "image">,
  incoming: Pick<GetOrCreateUserInput, "email" | "name" | "image">
): boolean {
  return (
    (incoming.email !== undefined && existing.email !== incoming.email) ||
    (incoming.name !== undefined && existing.name !== incoming.name) ||
    (incoming.image !== undefined && existing.image !== incoming.image)
  );
}

async function ensureUser(input: GetOrCreateUserInput): Promise<User> {
  // Check for an existing account link first.
  const existing = await userRepo.findByProviderAccount(
    input.providerId,
    input.providerAccountId
  );
  if (existing) {
    if (needsProfileUpdate(existing.user, input)) {
      return userRepo.updateUserProfile(existing.user.id, {
        email: input.email ?? existing.user.email,
        name: input.name ?? existing.user.name,
        image: input.image ?? existing.user.image,
      });
    }
    return existing.user;
  }

  return prisma.$transaction(async (tx) => {
    // Same-email account linking: if a User with this email already exists
    // (e.g. signed up via Credentials or a different OAuth provider), link
    // the new Account to that User rather than creating a duplicate.
    let user: User | null = input.email
      ? await userRepo.findByEmail(input.email, tx)
      : null;

    if (!user) {
      user = await userRepo.createUser(
        {
          email: input.email ? normalizeEmail(input.email) : null,
          name: input.name ?? null,
          image: input.image ?? null,
        },
        tx
      );
    }

    await userRepo.createAccount(
      {
        userId: user.id,
        provider: input.providerId,
        providerAccountId: input.providerAccountId,
      },
      tx
    );
    return user;
  });
}

export const userService = {
  /**
   * Resolve or create the application User backing an OAuth identity. Used
   * from the `signIn` callback on first OAuth login.
   */
  async getOrCreateUser(input: GetOrCreateUserInput): Promise<Result<User>> {
    try {
      const user = await ensureUser(input);
      return ok(user);
    } catch (error) {
      console.error("[userService.getOrCreateUser] persistence error", error);
      return err({ code: "internal", message: "Something went wrong" });
    }
  },

  /**
   * Create a Credentials-provider User. Called by the sign-up Server Action.
   * Never persists plaintext — always bcrypt-hashes the password.
   */
  async createCredentialsUser(
    input: CreateCredentialsUserInput
  ): Promise<Result<User>> {
    try {
      const existing = await userRepo.findByEmail(input.email);
      if (existing) {
        return err({
          code: "conflict",
          message: "An account with this email already exists",
        });
      }
      const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
      const user = await userRepo.createUserWithPassword({
        email: input.email,
        name: input.name,
        passwordHash,
      });
      return ok(user);
    } catch (error) {
      console.error("[userService.createCredentialsUser] persistence error", error);
      return err({ code: "internal", message: "Something went wrong" });
    }
  },

  /**
   * Verify a submitted email + password against the bcrypt hash in
   * `User.password`. Returns the same "not_found" err whether the email is
   * missing, the password wrong, or the account is OAuth-only — never
   * reveals which case.
   */
  async verifyCredentials(input: VerifyCredentialsInput): Promise<Result<User>> {
    try {
      const user = await userRepo.findByEmail(input.email);
      const notFound = err({
        code: "not_found" as const,
        message: "Email or password is incorrect",
      });
      if (!user || !user.password) return notFound;

      const match = await bcrypt.compare(input.password, user.password);
      if (!match) return notFound;

      return ok(user);
    } catch (error) {
      console.error("[userService.verifyCredentials] persistence error", error);
      return err({ code: "internal", message: "Something went wrong" });
    }
  },
};
