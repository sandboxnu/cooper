CREATE TABLE IF NOT EXISTS "report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reportText" text NOT NULL,
	"reason" varchar NOT NULL,
	"profileId" varchar NOT NULL,
	"companyId" varchar,
	"roleId" varchar,
	"reviewId" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
