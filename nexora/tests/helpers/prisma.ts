import type { PrismaClient } from "@prisma/client";
import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";

export const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

beforeEach(() => {
  mockReset(prismaMock);
});
