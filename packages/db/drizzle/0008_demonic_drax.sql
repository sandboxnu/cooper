ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "jobType" varchar DEFAULT 'Co-op' NOT NULL;--> statement-breakpoint
ALTER TABLE "role" DROP COLUMN IF EXISTS "jobType";