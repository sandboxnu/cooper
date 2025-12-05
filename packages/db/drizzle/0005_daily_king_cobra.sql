ALTER TABLE "review" RENAME COLUMN "freeTransport" TO "travelBenefits";--> statement-breakpoint
ALTER TABLE "profile" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "profile" ALTER COLUMN "updatedAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "snackBar" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "employeeLounge" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "jobType" varchar DEFAULT 'CO-OP' NOT NULL;