CREATE TABLE IF NOT EXISTS "company_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"industry" varchar NOT NULL,
	"location" varchar NOT NULL,
	"title" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"status" varchar DEFAULT 'PENDING' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"companyId" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"status" varchar DEFAULT 'PENDING' NOT NULL
);
