import { relations } from "drizzle-orm";
import { pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

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
