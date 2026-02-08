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
import { WorkEnvironment, WorkTerm , Status} from "./misc";
import { Profile } from "./profiles";
import { ProfilesToReviews } from "./profliesToReviews";
import { Role } from "./roles";

export const Review = pgTable("review", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  workTerm: varchar("workTerm").notNull(),
  workYear: integer("workYear").notNull(),
  overallRating: integer("overallRating").notNull(),
  cultureRating: integer("cultureRating").notNull(),
  supervisorRating: integer("supervisorRating").notNull(),
  interviewRating: integer("interviewRating").notNull(),
  interviewDifficulty: integer("interviewDifficulty").notNull(),
  interviewReview: text("interviewReview"),
  reviewHeadline: varchar("reviewHeadline").notNull(),
  textReview: text("textReview").notNull(),
  locationId: varchar("locationId"),
  hourlyPay: decimal("hourlyPay"),
  workEnvironment: varchar("workEnvironment").notNull(),
  drugTest: boolean("drugTest").notNull(),
  overtimeNormal: boolean("overtimeNormal").notNull(),
  pto: boolean("pto").notNull(),
  federalHolidays: boolean("federalHolidays").notNull(),
  freeLunch: boolean("freeLunch").notNull(),
  travelBenefits: boolean("travelBenefits").notNull(),
  freeMerch: boolean("freeMerch").notNull(),
  snackBar: boolean("snackBar").notNull().default(false),
  otherBenefits: text("otherBenefits"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
  roleId: varchar("roleId").notNull(),
  profileId: varchar("profileId"),
  companyId: varchar("companyId").notNull(),
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
  workTerm: z.nativeEnum(WorkTerm),
  workYear: z.number(),
  overallRating: z.number().min(1).max(5),
  cultureRating: z.number().min(1).max(5),
  supervisorRating: z.number().min(1).max(5),
  interviewRating: z.number().min(1).max(5).optional().default(0),
  interviewReview: z.string().optional(),
  reviewHeadline: z.string().optional().default(""),
  textReview: z.string(),
  locationId: z.string().optional(),
  hourlyPay: z.string().optional(),
  workEnvironment: z.nativeEnum(WorkEnvironment),
  drugTest: z.boolean(),
  overtimeNormal: z.boolean(),
  pto: z.boolean(),
  federalHolidays: z.boolean(),
  freeLunch: z.boolean(),
  travelBenefits: z.boolean(),
  snackBar: z.boolean(),
  freeMerch: z.boolean(),
  otherBenefits: z.string().nullish(),
  roleId: z.string(),
  profileId: z.string(),
  status: z.nativeEnum(Status)
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
