import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Company } from "./companies";
import { RequestStatus } from "./misc";

export const RoleRequest = pgTable("role_request", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  roleTitle: varchar("title").notNull(),
  roleDescription: text("description"),
  companyId: varchar("companyId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
  status: varchar("status", {
    enum: ["PENDING", "APPROVED", "REJECTED"], // Explicitly list the enum values (?)
  })
    .notNull()
    .default("PENDING"),
});

export type CompanyRequestType = typeof RoleRequest.$inferSelect;

export const RoleRequestRelations = relations(RoleRequest, ({ one }) => ({
  company: one(Company, {
    fields: [RoleRequest.companyId],
    references: [Company.id],
  }),
}));

/*
What is the relationship between companyRequest/roleRequest/company/role
*/

// Zod validation schema for creating a role request
export const CreateCompanyRequestSchema = createInsertSchema(RoleRequest, {
  roleTitle: z.string(),
  roleDescription: z.string(),
  status: z.nativeEnum(RequestStatus),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
