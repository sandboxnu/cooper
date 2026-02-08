ALTER TABLE "review" ADD COLUMN "jobType" varchar DEFAULT 'CO-OP' NOT NULL;--> statement-breakpoint
ALTER TABLE "role" DROP COLUMN IF EXISTS "jobType";