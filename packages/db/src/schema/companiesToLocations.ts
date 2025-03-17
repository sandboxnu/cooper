import { relations } from "drizzle-orm";
import { pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Company } from "./companies";
import { Location } from "./locations";

export const CompaniesToLocations = pgTable(
  "companies_to_locations",
  {
    companyId: varchar("company_id")
      .notNull()
      .references(() => Company.id),
    locationId: varchar("location_id")
      .notNull()
      .references(() => Location.id),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.companyId, t.locationId] }),
  }),
);

export const CompaniesToLocationsRelations = relations(
  CompaniesToLocations,
  ({ one }) => ({
    company: one(Company, {
      fields: [CompaniesToLocations.companyId],
      references: [Company.id],
    }),
    location: one(Location, {
      fields: [CompaniesToLocations.locationId],
      references: [Location.id],
    }),
  }),
);

export const CreateCompanyToLocationSchema = createInsertSchema(
  CompaniesToLocations,
  {
    companyId: z.string(),
    locationId: z.string(),
  },
);
