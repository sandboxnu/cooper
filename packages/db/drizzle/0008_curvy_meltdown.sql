CREATE TABLE IF NOT EXISTS "companies_to_locations" (
	"company_id" varchar NOT NULL,
	"location_id" varchar NOT NULL,
	CONSTRAINT "companies_to_locations_company_id_location_id_pk" PRIMARY KEY("company_id","location_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companies_to_locations" ADD CONSTRAINT "companies_to_locations_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companies_to_locations" ADD CONSTRAINT "companies_to_locations_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "company" DROP COLUMN IF EXISTS "location";