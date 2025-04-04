import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { CompaniesToLocations } from "./companiesToLocations";
import { Review } from "./reviews";

export const Location = pgTable("location", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  city: varchar("city").notNull(),
  state: varchar("state"),
  country: varchar("country").notNull(),
});

export type LocationType = typeof Location.$inferSelect;

export const LocationRelations = relations(Location, ({ many }) => ({
  companies_to_locations: many(CompaniesToLocations),
  reviews: many(Review),
}));

export const CreateLocationSchema = createInsertSchema(Location, {
  city: z.string(),
  state: z.string(),
  country: z.string(),
}).omit({
  id: true,
});
