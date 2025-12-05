import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Company } from "./companies";
import { ProfilesToRoles } from "./profilesToRoles";
import { Review } from "./reviews";
import { User } from "./users";

export const Role = pgTable("role", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull(),
  description: text("description"),
  companyId: varchar("companyId").notNull(),
  jobType: varchar("jobType", {
    enum: ["CO-OP", "INTERNSHIP"], // Explicitly list the enum values
  }).default("CO-OP"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
  createdBy: varchar("createdBy").notNull(),
});

export type RoleType = typeof Role.$inferSelect;

export const RoleRelations = relations(Role, ({ one, many }) => ({
  company: one(Company, {
    fields: [Role.companyId],
    references: [Company.id],
  }),
  reviews: many(Review),
  profiles_to_roles: many(ProfilesToRoles),
  createdBy: one(User, {
    fields: [Role.createdBy],
    references: [User.id],
  }),
}));

export const CreateRoleSchema = createInsertSchema(Role, {
  title: z.string(),
  description: z.string(),
  companyId: z.string(),
  jobType: z.enum(["CO-OP", "INTERNSHIP"]),
  createdBy: z.string(),
}).omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});
