CREATE TABLE IF NOT EXISTS "account" (
	"userId" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" varchar(255),
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"industry" varchar NOT NULL,
	"website" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companies_to_locations" (
	"companyId" uuid NOT NULL,
	"locationId" uuid NOT NULL,
	CONSTRAINT "companies_to_locations_companyId_locationId_pk" PRIMARY KEY("companyId","locationId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "company_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"industry" varchar NOT NULL,
	"website" varchar,
	"locationId" varchar,
	"title" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"status" varchar DEFAULT 'PENDING' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" varchar NOT NULL,
	"state" varchar,
	"country" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstName" varchar NOT NULL,
	"lastName" varchar NOT NULL,
	"major" varchar NOT NULL,
	"minor" varchar,
	"graduationYear" integer NOT NULL,
	"graduationMonth" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"userId" varchar NOT NULL,
	CONSTRAINT "profile_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workTerm" varchar NOT NULL,
	"workYear" integer NOT NULL,
	"overallRating" integer NOT NULL,
	"cultureRating" integer NOT NULL,
	"supervisorRating" integer NOT NULL,
	"interviewRating" integer NOT NULL,
	"interviewDifficulty" integer NOT NULL,
	"interviewReview" text,
	"reviewHeadline" varchar NOT NULL,
	"textReview" text NOT NULL,
	"locationId" varchar,
	"hourlyPay" numeric,
	"workEnvironment" varchar NOT NULL,
	"drugTest" boolean NOT NULL,
	"overtimeNormal" boolean NOT NULL,
	"pto" boolean NOT NULL,
	"federalHolidays" boolean NOT NULL,
	"freeLunch" boolean NOT NULL,
	"travelBenefits" boolean NOT NULL,
	"freeMerch" boolean NOT NULL,
	"otherBenefits" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"roleId" varchar NOT NULL,
	"profileId" varchar,
	"companyId" varchar NOT NULL
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"companyId" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp with time zone,
	"image" varchar(255)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companies_to_locations" ADD CONSTRAINT "companies_to_locations_companyId_company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companies_to_locations" ADD CONSTRAINT "companies_to_locations_locationId_location_id_fk" FOREIGN KEY ("locationId") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
