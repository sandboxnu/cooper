CREATE TABLE IF NOT EXISTS "reviews_to_tools" (
	"reviewId" uuid NOT NULL,
	"toolId" uuid NOT NULL,
	CONSTRAINT "reviews_to_tools_reviewId_toolId_pk" PRIMARY KEY("reviewId","toolId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tool" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "tool_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "jobLength" integer;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "workHours" integer;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "accessibleByTransportation" boolean;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "teamOutings" boolean;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "coffeeChats" boolean;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "constructiveFeedback" boolean;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "onboarding" boolean;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "workStructure" boolean;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "careerGrowth" boolean;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews_to_tools" ADD CONSTRAINT "reviews_to_tools_reviewId_review_id_fk" FOREIGN KEY ("reviewId") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews_to_tools" ADD CONSTRAINT "reviews_to_tools_toolId_tool_id_fk" FOREIGN KEY ("toolId") REFERENCES "public"."tool"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
