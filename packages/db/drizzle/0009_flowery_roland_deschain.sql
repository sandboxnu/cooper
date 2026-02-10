ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'DRAFT' NOT NULL;

UPDATE "review"
SET "status" = 'PUBLISHED' 
