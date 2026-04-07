DO $$ BEGIN
 CREATE TYPE "public"."interview_difficulty" AS ENUM('easy', 'average', 'hard');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."interview_type" AS ENUM('behavioral', 'technical', 'case_study', 'portfolio_walkthrough', 'online_assessment', 'screening', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review_round" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"interview_type" "interview_type" NOT NULL,
	"interview_difficulty" "interview_difficulty" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_round" ADD CONSTRAINT "review_round_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
INSERT INTO "review_round" ("id", "review_id", "interview_type", "interview_difficulty", "created_at")
SELECT
  gen_random_uuid(),
  "id",
  'other',
  CASE
    WHEN "interviewDifficulty" BETWEEN 1 AND 2 THEN 'easy'
    WHEN "interviewDifficulty" BETWEEN 3 AND 4 THEN 'average'
    WHEN "interviewDifficulty" = 5             THEN 'hard'
  END::"interview_difficulty",
  NOW()
FROM "review"
WHERE "interviewDifficulty" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "review" DROP COLUMN IF EXISTS "interviewRating";--> statement-breakpoint
ALTER TABLE "review" DROP COLUMN IF EXISTS "interviewDifficulty";--> statement-breakpoint
ALTER TABLE "review" DROP COLUMN IF EXISTS "interviewReview";