import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { CompaniesToLocations } from "./companiesToLocations";
import { Industry } from "./misc";
import { ProfilesToCompanies } from "./profilesToCompanies";
import { Review } from "./reviews";
import { Role } from "./roles";

export const Company = pgTable("company", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  industry: varchar("industry").notNull(),
  website: varchar("website"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdate(() => new Date()),
});

export type CompanyType = typeof Company.$inferSelect;

export const CompanyRelations = relations(Company, ({ many }) => ({
  roles: many(Role),
  reviews: many(Review),
  companies_to_locations: many(CompaniesToLocations),
  profiles_to_companies: many(ProfilesToCompanies),
}));

export const CreateCompanySchema = createInsertSchema(Company, {
  name: z.string(),
  description: z.string().optional(),
  industry: z.nativeEnum(Industry),
  website: z.string().optional(),
}).omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});
