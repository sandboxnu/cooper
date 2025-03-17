import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { CompaniesToLocations } from "./companiesToLocations";
import { Industry } from "./misc";
import { Review } from "./reviews";
import { Role } from "./roles";

export const Company = pgTable("company", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  description: text("description"),
  industry: varchar("industry").notNull(),
  website: varchar("website"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
});

export type CompanyType = typeof Company.$inferSelect;

export const CompanyRelations = relations(Company, ({ many }) => ({
  roles: many(Role),
  reviews: many(Review),
  CompaniesToLocations: many(CompaniesToLocations),
}));

export const CreateCompanySchema = createInsertSchema(Company, {
  name: z.string(),
  description: z.string().optional(),
  industry: z.nativeEnum(Industry),
  website: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
