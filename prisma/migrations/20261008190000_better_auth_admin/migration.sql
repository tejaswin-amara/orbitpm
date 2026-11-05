-- Better Auth admin + username fields
ALTER TABLE "user"
  ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user',
  ADD COLUMN "banned" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "banReason" TEXT,
  ADD COLUMN "banExpires" TIMESTAMP(3),
  ADD COLUMN "username" TEXT,
  ADD COLUMN "displayUsername" TEXT;

CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

ALTER TABLE "session"
  ADD COLUMN "impersonatedBy" TEXT;
