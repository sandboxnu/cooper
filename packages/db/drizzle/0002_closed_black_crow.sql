CREATE TABLE IF NOT EXISTS "profiles_to_companies" (
	"profileId" uuid NOT NULL,
	"companyId" uuid NOT NULL,
	CONSTRAINT "profiles_to_companies_profileId_companyId_pk" PRIMARY KEY("profileId","companyId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles_to_roles" (
	"profileId" uuid NOT NULL,
	"roleId" uuid NOT NULL,
	CONSTRAINT "profiles_to_roles_profileId_roleId_pk" PRIMARY KEY("profileId","roleId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles_to_reviews" (
	"profileId" uuid NOT NULL,
	"reviewId" uuid NOT NULL,
	CONSTRAINT "profiles_to_reviews_profileId_reviewId_pk" PRIMARY KEY("profileId","reviewId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles_to_companies" ADD CONSTRAINT "profiles_to_companies_profileId_profile_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles_to_companies" ADD CONSTRAINT "profiles_to_companies_companyId_company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles_to_roles" ADD CONSTRAINT "profiles_to_roles_profileId_profile_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles_to_roles" ADD CONSTRAINT "profiles_to_roles_roleId_role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."role"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles_to_reviews" ADD CONSTRAINT "profiles_to_reviews_profileId_profile_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles_to_reviews" ADD CONSTRAINT "profiles_to_reviews_reviewId_review_id_fk" FOREIGN KEY ("reviewId") REFERENCES "public"."review"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
