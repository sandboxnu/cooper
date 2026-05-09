CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_provider_providerAccountId_pk";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "scope" SET DATA TYPE text;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
    AND table_name = 'user'
    AND column_name = 'emailVerified'
    AND data_type <> 'boolean'
  ) THEN
    ALTER TABLE "user" ALTER COLUMN "emailVerified" SET DATA TYPE boolean USING "emailVerified" IS NOT NULL;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "emailVerified" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "id" text;--> statement-breakpoint
UPDATE "account" SET "id" = gen_random_uuid()::text WHERE "id" IS NULL;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "account" ADD PRIMARY KEY ("id");
EXCEPTION WHEN others THEN NULL;
END $$;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accountId" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "providerId" text;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
    AND table_name = 'account'
    AND column_name = 'providerAccountId'
  ) THEN
    UPDATE "account" SET "accountId" = "providerAccountId", "providerId" = "provider" WHERE "accountId" IS NULL;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "accountId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "providerId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accessToken" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refreshToken" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "idToken" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "password" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey";--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "id" text;--> statement-breakpoint
UPDATE "session" SET "id" = gen_random_uuid()::text WHERE "id" IS NULL;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "session" ADD PRIMARY KEY ("id");
EXCEPTION WHEN others THEN NULL;
END $$;--> statement-breakpoint
DELETE FROM "session";--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "token" text NOT NULL DEFAULT '';--> statement-breakpoint
UPDATE "session" SET "token" = gen_random_uuid()::text WHERE "token" = '';--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "token" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "expiresAt" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "ipAddress" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "userAgent" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "type";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "provider";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "providerAccountId";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "refresh_token";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "access_token";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "expires_at";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "token_type";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "id_token";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "session_state";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "sessionToken";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "expires";--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "session" ADD CONSTRAINT "session_token_unique" UNIQUE("token");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
END $$; -- test
