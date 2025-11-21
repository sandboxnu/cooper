-- Add slug columns as nullable first to allow backfilling
ALTER TABLE "company" ADD COLUMN "slug" varchar;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "slug" varchar;--> statement-breakpoint

-- Backfill company slugs from names
UPDATE "company" 
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE "slug" IS NULL;--> statement-breakpoint

-- Backfill role slugs from titles (no uniqueness needed - multiple companies can have same role)
UPDATE "role" 
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE "slug" IS NULL;--> statement-breakpoint

-- Handle duplicate company slugs by appending numbers
WITH numbered_companies AS (
  SELECT 
    id,
    slug,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY "createdAt") as rn
  FROM "company"
)
UPDATE "company" c
SET "slug" = nc.slug || '-' || nc.rn
FROM numbered_companies nc
WHERE c.id = nc.id AND nc.rn > 1;--> statement-breakpoint

-- Now make the columns NOT NULL and add unique constraint only for company
ALTER TABLE "company" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_slug_unique" UNIQUE("slug");