import "server-only";

import type { Account, Prisma, User } from "@prisma/client";

import { prisma } from "@/lib/db";

/** Normalize an email for case-insensitive lookup. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Any PrismaClient-like object: the singleton or a transaction client. Keeps
 * repo methods composable inside `prisma.$transaction`.
 */
type TxClient = Pick<typeof prisma, "user" | "account" | "session">;

export type AccountWithUser = Account & { user: User };

export const userRepo = {
  findByProviderAccount(
    provider: string,
    providerAccountId: string,
    tx: TxClient = prisma
  ): Promise<AccountWithUser | null> {
    return tx.account.findUnique({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
      include: { user: true },
    }) as Promise<AccountWithUser | null>;
  },

  createUser(data: Prisma.UserCreateInput, tx: TxClient = prisma): Promise<User> {
    return tx.user.create({ data });
  },

  createAccount(
    data: Prisma.AccountUncheckedCreateInput,
    tx: TxClient = prisma
  ): Promise<Account> {
    return tx.account.create({ data });
  },

  updateUserProfile(
    userId: string,
    patch: { email?: string | null; name?: string | null; image?: string | null },
    tx: TxClient = prisma
  ): Promise<User> {
    return tx.user.update({ where: { id: userId }, data: patch });
  },

  findByEmail(email: string, tx: TxClient = prisma): Promise<User | null> {
    return tx.user.findUnique({ where: { email: normalizeEmail(email) } });
  },

  createUserWithPassword(
    data: { email: string; name: string; passwordHash: string },
    tx: TxClient = prisma
  ): Promise<User> {
    return tx.user.create({
      data: {
        email: normalizeEmail(data.email),
        name: data.name,
        password: data.passwordHash,
      },
    });
  },
};
