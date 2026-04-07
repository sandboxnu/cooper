ALTER TABLE "review_round" RENAME TO "interview_round";--> statement-breakpoint
ALTER TABLE "interview_round" DROP CONSTRAINT "review_round_review_id_review_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_round" ADD CONSTRAINT "interview_round_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
