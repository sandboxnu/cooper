import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Review } from "./reviews";
import { User } from "./users";

export const Profile = pgTable("profile", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  firstName: varchar("firstName").notNull(),
  lastName: varchar("lastName").notNull(),
  major: varchar("major").notNull(),
  minor: varchar("minor"),
  graduationYear: integer("graduationYear").notNull(),
  graduationMonth: integer("graduationMonth").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
  userId: varchar("userId").notNull().unique(),
});

export const ProfileRelations = relations(Profile, ({ one, many }) => ({
  user: one(User, {
    fields: [Profile.userId],
    references: [User.id],
  }),
  reviews: many(Review),
}));

const MAX_GRADUATION_LENGTH = 6;
const MONTH_LB = 1;
const MONTH_UB = 12;
const YEAR_LB = new Date().getFullYear();
const YEAR_UB = YEAR_LB + MAX_GRADUATION_LENGTH;

export const CreateProfileSchema = createInsertSchema(Profile, {
  firstName: z.string(),
  lastName: z.string(),
  major: z.string(),
  minor: z.string().optional(),
  graduationYear: z.number().min(YEAR_LB).max(YEAR_UB),
  graduationMonth: z.number().min(MONTH_LB).max(MONTH_UB),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
