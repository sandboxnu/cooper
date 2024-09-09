CREATE TABLE IF NOT EXISTS "company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"industry" varchar(35) NOT NULL,
	"location" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
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
	"workTerm" varchar(3) NOT NULL,
	"workYear" integer NOT NULL,
	"overallRating" integer NOT NULL,
	"cultureRating" integer NOT NULL,
	"supervisorRating" integer NOT NULL,
	"interviewRating" integer NOT NULL,
	"interviewDifficulty" integer NOT NULL,
	"interviewReview" text,
	"reviewHeadline" varchar NOT NULL,
	"textReview" text NOT NULL,
	"location" varchar,
	"hourlyPay" numeric,
	"workEnvironment" varchar(3) NOT NULL,
	"drugTest" boolean NOT NULL,
	"overtimeNormal" boolean NOT NULL,
	"pto" boolean NOT NULL,
	"federalHolidays" boolean NOT NULL,
	"freeLunch" boolean NOT NULL,
	"freeTransport" boolean NOT NULL,
	"freeMerch" boolean NOT NULL,
	"otherBenefits" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"roleId" varchar NOT NULL,
	"profileId" varchar,
	"companyId" varchar NOT NULL
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
