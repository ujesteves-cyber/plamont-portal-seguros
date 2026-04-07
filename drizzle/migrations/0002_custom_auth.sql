-- Remove clerk_id constraint and column, add password_hash
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_clerk_id_unique";
ALTER TABLE "users" DROP COLUMN IF EXISTS "clerk_id";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" varchar(255);
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE ("email");
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_approved" boolean NOT NULL DEFAULT false;
