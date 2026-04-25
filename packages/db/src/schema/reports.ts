import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Company } from "./companies";
import { ReportReason } from "./misc";
import { Profile } from "./profiles";
import { Review } from "./reviews";
import { Role } from "./roles";

export const Report = pgTable("report", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  reportText: text("reportText").notNull(),
  reason: varchar("reason").notNull(),
  profileId: varchar("profileId").notNull(),
  companyId: varchar("companyId"),
  roleId: varchar("roleId"),
  reviewId: varchar("reviewId"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
});

export type ReportType = typeof Report.$inferSelect;

export const ReportRelations = relations(Report, ({ one }) => ({
  profile: one(Profile, {
    fields: [Report.profileId],
    references: [Profile.id],
  }),
  role: one(Role, {
    fields: [Report.roleId],
    references: [Role.id],
  }),
  company: one(Company, {
    fields: [Report.companyId],
    references: [Company.id],
  }),
  review: one(Review, {
    fields: [Report.reviewId],
    references: [Review.id],
  }),
}));

const _baseReportSchema = createInsertSchema(Report, {
  reportText: () => z.string().min(1),
  reason: () => z.nativeEnum(ReportReason),
  profileId: () => z.string(),
  roleId: () => z.string().optional(),
  companyId: () => z.string().optional(),
  reviewId: () => z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateReportSchema = _baseReportSchema.refine(
  (data: z.infer<typeof _baseReportSchema>) =>
    [data.roleId, data.companyId, data.reviewId].filter(Boolean).length === 1,
  { message: "Exactly one of roleId, companyId, or reviewId must be set" },
);
