-- AlterTable: add optional bcrypt-hashed password for Credentials-provider users.
-- OAuth-only users have password = NULL.
ALTER TABLE "users" ADD COLUMN "password" TEXT;
