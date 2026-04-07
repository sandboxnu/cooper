import { relations, sql } from "drizzle-orm";
import { pgTable, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Review } from "./reviews";

export const InterviewTypeSchema = pgEnum("interview_type", [
  "phone",
  "onsite",
  "virtual",
  "hr",
]);

export const InterviewDifficultySchema = pgEnum("interview_difficulty", [
  "Great",
  "Hard",
  "Medium",
  "Easy",
]);

export const InterviewRound = pgTable("review_round", {
  id: uuid("id").defaultRandom().primaryKey(),

  reviewId: uuid("review_id")
    .notNull()
    .references(() => Review.id, { onDelete: "cascade" }),

  interviewType: InterviewTypeSchema("interview_type").notNull(),
  interviewDifficulty: InterviewDifficultySchema(
    "interview_difficulty",
  ).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
});

export type InterviewRoundType = typeof InterviewRound.$inferSelect;

export const InterviewRoundRelations = relations(InterviewRound, ({ one }) => ({
  review: one(Review, {
    fields: [InterviewRound.reviewId],
    references: [Review.id],
  }),
}));

export const ZodInterviewTypeSchema = z.enum([
  "phone",
  "onsite",
  "virtual",
  "hr",
]);
export const ZodInterviewDifficultySchema = z.enum([
  "Great",
  "Hard",
  "Medium",
  "Easy",
]);

export const CreateInterviewRoundSchema = createInsertSchema(InterviewRound, {
  interviewType: ZodInterviewTypeSchema,
  interviewDifficulty: ZodInterviewDifficultySchema,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
