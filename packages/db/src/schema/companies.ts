import { relations, sql } from "drizzle-orm";
import {
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Location } from "./locations";
import { Industry } from "./misc";
import { Review } from "./reviews";
import { Role } from "./roles";

export const Company = pgTable("company", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  description: text("description"),
  industry: varchar("industry").notNull(),
  location: varchar("location"),
  averageHourlyPay: decimal("averageHourlyPay"),
  averageOverallRating: decimal("averageOverallRating"),
  averageCultureRating: decimal("averageCultureRating"),
  averageSupervisorRating: decimal("averageSupervisorRating"),
  averageInterviewRating: decimal("averageInterviewRating"),
  averageInterviewDifficulty: decimal("averageInterviewDifficulty"),
  totalReviews: integer("totalReviews"),
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
  locations: many(Location),
}));

export const CreateCompanySchema = createInsertSchema(Company, {
  name: z.string(),
  description: z.string().optional(),
  industry: z.nativeEnum(Industry),
  location: z.string().optional,
  averageHourlyPay: z.string(),
  averageOverallRating: z.string(),
  averageCultureRating: z.string(),
  averageSupervisorRating: z.string(),
  averageInterviewRating: z.string(),
  averageInterviewDifficulty: z.string(),
  totalReviews: z.number(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
