import { describe, expect, it } from "vitest";

import "@/tests/helpers/prisma";
import { prismaMock } from "@/tests/helpers/prisma";
import { userRepo } from "@/services/users/user.repo";

describe("userRepo.findByProviderAccount", () => {
  it("calls prisma.account.findUnique with the composite provider key and includes the user", async () => {
    prismaMock.account.findUnique.mockResolvedValueOnce({
      id: "acct_1",
      userId: "user_1",
      provider: "google",
      providerAccountId: "sub-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      // vitest-mock-extended tolerates the `user` include field on the mock
      // return without it being in the schema type.
    } as never);

    await userRepo.findByProviderAccount("google", "sub-123");

    expect(prismaMock.account.findUnique).toHaveBeenCalledWith({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: "sub-123",
        },
      },
      include: { user: true },
    });
  });

  it("returns null when no account exists", async () => {
    prismaMock.account.findUnique.mockResolvedValueOnce(null);

    const result = await userRepo.findByProviderAccount("google", "unknown");

    expect(result).toBeNull();
  });
});
