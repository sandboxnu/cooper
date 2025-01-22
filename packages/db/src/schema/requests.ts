import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Industry, RequestStatus } from "./misc";

export const CompanyRequest = pgTable("company_request", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  companyName: varchar("name").notNull(),
  companyDescription: text("description"),
  industry: varchar("industry").notNull(),
  location: varchar("location").notNull(),
  roleTitle: varchar("title").notNull(),
  roleDescription: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
  status: varchar("status", {
    enum: ["PENDING", "APPROVED", "REJECTED"], // Explicitly list the enum values
  })
    .notNull()
    .default("PENDING"),
});

export type CompanyRequestType = typeof CompanyRequest.$inferSelect;

// export const RequestRelations = relations(Role, ({ one }) => ({
//   company: one(Company, {
//     fields: [Role.companyId],
//     references: [Company.id],
//   }),
//   roles: one(Role),
// }));

// Zod validation schema for creating a company request
export const CreateCompanyRequestSchema = createInsertSchema(CompanyRequest, {
  companyName: z.string(),
  companyDescription: z.string().optional(),
  industry: z.nativeEnum(Industry),
  location: z.string(),
  roleTitle: z.string(),
  roleDescription: z.string(),
  status: z.nativeEnum(RequestStatus),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
// Example TypeScript type for the Company Request
