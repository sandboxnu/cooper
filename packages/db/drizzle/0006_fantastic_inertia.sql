CREATE TABLE IF NOT EXISTS "location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" varchar NOT NULL,
	"state" varchar,
	"country" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company_request" ADD COLUMN "locationId" varchar;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "locationId" varchar;--> statement-breakpoint
ALTER TABLE "company_request" DROP COLUMN IF EXISTS "location";--> statement-breakpoint
ALTER TABLE "review" DROP COLUMN IF EXISTS "location";