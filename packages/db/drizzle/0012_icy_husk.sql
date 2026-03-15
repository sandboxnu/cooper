CREATE TABLE IF NOT EXISTS "moderation_action" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entityType" varchar(32) NOT NULL,
	"entityId" uuid NOT NULL,
	"actionType" varchar(32) NOT NULL,
	"reason" varchar(255) NOT NULL,
	"note" text,
	"adminId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderation_action" ADD CONSTRAINT "moderation_action_adminId_user_id_fk" FOREIGN KEY ("adminId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
