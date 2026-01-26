import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Review } from "./reviews";

export const ReviewRound = pgTable("review_round", {
  id: uuid("id").defaultRandom().primaryKey(),

  reviewId: uuid("review_id")
    .notNull()
    .references(() => Review.id, { onDelete: "cascade" }),

  interviewType: varchar("interview_type").notNull(),
  interviewDifficulty: varchar("interview_difficulty").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
});

export type ReviewRoundType = typeof ReviewRound.$inferSelect;

export const ReviewRoundRelations = relations(ReviewRound, ({ one }) => ({
  review: one(Review, {
    fields: [ReviewRound.reviewId],
    references: [Review.id],
  }),
}));

export const CreateReviewRoundSchema = createInsertSchema(ReviewRound, {
  interviewType: z.string(),
  interviewDifficulty: z.string(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
