
ALTER TABLE "review" ALTER COLUMN  "workTerm" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "review" ALTER COLUMN  "workYear" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "review" ALTER COLUMN  "overallRating" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "review" ALTER COLUMN  "cultureRating" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "review" ALTER COLUMN  "supervisorRating" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "review" ALTER COLUMN  "interviewRating" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "review" ALTER COLUMN  "interviewDifficulty" DROP NOT NULL;