import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Industry, RequestStatus } from "./misc";
import { Profile } from "./profiles";

export const CompanyRequest = pgTable("company_request", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  companyName: varchar("name").notNull(),
  companyDescription: text("description"),
  industry: varchar("industry").notNull(),
  location: varchar("location").notNull(),
  roleTitle: varchar("title").notNull(),
  roleDescription: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  status: varchar("status", {
    enum: ["PENDING", "APPROVED", "REJECTED"],
  })
    .notNull()
    .default("PENDING"),
});

export type CompanyRequestType = typeof CompanyRequest.$inferSelect;

export const RequestRelations = relations(CompanyRequest, ({ one }) => ({
  profile: one(Profile, {
    fields: [CompanyRequest.id],
    references: [Profile.userId],
  }),
}));

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
});
