import { relations, sql } from "drizzle-orm";
import {
  boolean,
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
import { Location } from "./locations";
import { JobType, WorkEnvironment, WorkTerm, Status } from "./misc";
import { Profile } from "./profiles";
import { ProfilesToReviews } from "./profliesToReviews";
import { Role } from "./roles";

export const Review = pgTable("review", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  workTerm: varchar("workTerm"),
  workYear: integer("workYear"),
  overallRating: integer("overallRating"),
  cultureRating: integer("cultureRating"),
  supervisorRating: integer("supervisorRating"),
  interviewRating: integer("interviewRating"),
  interviewDifficulty: integer("interviewDifficulty"),
  interviewReview: text("interviewReview"),
  reviewHeadline: varchar("reviewHeadline"),
  textReview: text("textReview"),
  locationId: varchar("locationId"),
  jobType: varchar("jobType").default("Co-op"),
  hourlyPay: decimal("hourlyPay"),
  workEnvironment: varchar("workEnvironment"),
  drugTest: boolean("drugTest"),
  overtimeNormal: boolean("overtimeNormal"),
  pto: boolean("pto"),
  federalHolidays: boolean("federalHolidays"),
  freeLunch: boolean("freeLunch"),
  travelBenefits: boolean("travelBenefits"),
  freeMerch: boolean("freeMerch"),
  snackBar: boolean("snackBar").default(false),
  otherBenefits: text("otherBenefits"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
  roleId: varchar("roleId"),
  profileId: varchar("profileId"),
  companyId: varchar("companyId"),
  status: varchar("status").notNull().default(Status.DRAFT),
});

export type ReviewType = typeof Review.$inferSelect;

export const ReviewRelations = relations(Review, ({ one, many }) => ({
  role: one(Role, {
    fields: [Review.roleId],
    references: [Role.id],
  }),
  profile: one(Profile, {
    fields: [Review.profileId],
    references: [Profile.id],
  }),
  company: one(Company, {
    fields: [Review.companyId],
    references: [Company.id],
  }),
  location: one(Location, {
    fields: [Review.locationId],
    references: [Location.id],
  }),
  profiles_to_reviews: many(ProfilesToReviews),
}));

export const CreateReviewSchema = createInsertSchema(Review, {
  workTerm: z.nativeEnum(WorkTerm).nullish(),
  workYear: z.number().nullish(),
  overallRating: z.number().min(1).max(5).nullish(),
  cultureRating: z.number().min(1).max(5).nullish(),
  supervisorRating: z.number().min(1).max(5).nullish(),
  interviewRating: z.number().min(1).max(5).optional().default(0).nullish(),
  interviewReview: z.string().optional().nullish(),
  reviewHeadline: z.string().optional().default("").nullish(),
  textReview: z.string().nullish(),
  locationId: z.string().optional().nullish(),
  jobType: z.nativeEnum(JobType).nullish(),
  hourlyPay: z.string().optional().nullish(),
  workEnvironment: z.nativeEnum(WorkEnvironment).nullish(),
  drugTest: z.boolean().nullish(),
  overtimeNormal: z.boolean().nullish(),
  pto: z.boolean().nullish(),
  federalHolidays: z.boolean().nullish(),
  freeLunch: z.boolean().nullish(),
  travelBenefits: z.boolean().nullish(),
  snackBar: z.boolean().nullish(),
  freeMerch: z.boolean().nullish(),
  otherBenefits: z.string().nullish(),
  roleId: z.string().nullish(),
  profileId: z.string(),
  status: z.nativeEnum(Status),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
