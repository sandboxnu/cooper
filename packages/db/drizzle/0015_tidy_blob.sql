ALTER TABLE "flagged" ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "hidden" ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true NOT NULL;