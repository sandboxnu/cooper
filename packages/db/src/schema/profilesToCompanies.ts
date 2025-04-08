import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Company } from "./companies";
import { Profile } from "./profiles";

export const ProfilesToCompanies = pgTable(
  "profiles_to_companies",
  {
    profileId: uuid("profileId")
      .notNull()
      .references(() => Profile.id),
    companyId: uuid("companyId")
      .notNull()
      .references(() => Company.id),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.profileId, t.companyId] }),
  }),
);

export const ProfilesToCompaniesRelations = relations(
  ProfilesToCompanies,
  ({ one }) => ({
    profile: one(Profile, {
      fields: [ProfilesToCompanies.profileId],
      references: [Profile.id],
    }),
    company: one(Company, {
      fields: [ProfilesToCompanies.companyId],
      references: [Company.id],
    }),
  }),
);

export const CreateProfileToCompanySchema = createInsertSchema(
  ProfilesToCompanies,
  {
    profileId: z.string(),
    companyId: z.string(),
  },
);
