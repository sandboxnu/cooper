import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Company } from "./companies";

export const Location = pgTable("location", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  city: varchar("city").notNull(),
  state: varchar("state"),
  country: varchar("country").notNull(),
});

export const LocationReviews = relations(Location, ({ many }) => ({
    companies: many(Company),
}));

export const CreateLocationSchema = createInsertSchema(Location, {
  city: z.string(),
  state: z.string(),
  country: z.string(),
}).omit({
  id: true,
});
