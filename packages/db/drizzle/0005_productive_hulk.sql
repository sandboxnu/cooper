ALTER TABLE "profile" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "profile" ALTER COLUMN "updatedAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "snackBar" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN IF NOT EXISTS "jobType" varchar DEFAULT 'CO-OP';