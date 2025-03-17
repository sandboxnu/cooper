CREATE TABLE IF NOT EXISTS "location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" varchar NOT NULL,
	"state" varchar,
	"country" varchar NOT NULL
);
--> statement-breakpoint
-- ALTER TABLE "company_request" RENAME COLUMN "location" TO "locationId" IF EXISTS "location";--> statement-breakpoint
-- ALTER TABLE "review" RENAME COLUMN "location" TO "locationId" IF EXISTS "location";--> statement-breakpoint
ALTER TABLE "company_request" ALTER COLUMN "locationId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "company" DROP COLUMN IF EXISTS "location";