ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN IF NOT EXISTS "hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN IF NOT EXISTS "hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "hidden" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "hidden" ADD COLUMN IF NOT EXISTS "deactivatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "hidden" ADD COLUMN IF NOT EXISTS "deactivatedByAdminId" uuid;--> statement-breakpoint
ALTER TABLE "flagged" ADD COLUMN IF NOT EXISTS "deactivatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "flagged" ADD COLUMN IF NOT EXISTS "deactivatedByAdminId" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hidden" ADD CONSTRAINT "hidden_deactivatedByAdminId_user_id_fk" FOREIGN KEY ("deactivatedByAdminId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flagged" ADD CONSTRAINT "flagged_deactivatedByAdminId_user_id_fk" FOREIGN KEY ("deactivatedByAdminId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
