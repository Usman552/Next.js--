/**
 * Local development seed. Safe to run multiple times (idempotent — every write
 * uses `upsert`). Extend per environment as your schema grows; do not add
 * production-only data here without an environment guard.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Intentionally empty in v1: authenticated users are created on first
  // Keycloak login by the auth layer, not by seed. Add domain fixtures here
  // when the schema gains organizations, projects, etc.
  const userCount = await prisma.user.count();
  console.log(`Seed complete. Users in database: ${userCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
