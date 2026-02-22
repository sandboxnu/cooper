DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'review' AND column_name = 'freeTransport'
  ) THEN
    ALTER TABLE "review" RENAME COLUMN "freeTransport" TO "travelBenefits";
  END IF;
END $$;
