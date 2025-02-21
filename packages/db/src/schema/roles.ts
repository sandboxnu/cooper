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

import { Company } from "./companies";
import { Review } from "./reviews";

export const Role = pgTable("role", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("description"),
  companyId: varchar("companyId").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  averageHourlyPay: decimal("averageHourlyPay"),
  averageOverallRating: decimal("averageOverallRating"),
  averageCultureRating: decimal("averageCultureRating"),
  averageSupervisorRating: decimal("averageSupervisorRating"),
  averageInterviewRating: decimal("averageInterviewRating"),
  averageInterviewDifficulty: decimal("averageInterviewDifficulty"),
  totalReviews: integer("totalReviews"),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
});

export type RoleType = typeof Role.$inferSelect;

export const RoleRelations = relations(Role, ({ one, many }) => ({
  company: one(Company, {
    fields: [Role.companyId],
    references: [Company.id],
  }),
  reviews: many(Review),
}));

export const CreateRoleSchema = createInsertSchema(Role, {
  title: z.string(),
  description: z.string(),
  companyId: z.string(),
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
