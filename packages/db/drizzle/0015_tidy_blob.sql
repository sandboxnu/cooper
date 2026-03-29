ALTER TABLE "flagged" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "hidden" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;