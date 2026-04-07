import { relations, sql } from "drizzle-orm";
import { pgTable, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Review } from "./reviews";

export const InterviewTypeSchema = pgEnum("interview_type", [
  "behavioral",
  "technical",
  "case_study",
  "portfolio_walkthrough",
  "online_assessment",
  "screening",
  "other",
]);

export const InterviewDifficultySchema = pgEnum("interview_difficulty", [
  "easy",
  "average",
  "hard",
]);

export const InterviewRound = pgTable("interview_round", {
  id: uuid("id").defaultRandom().primaryKey(),

  reviewId: uuid("review_id")
    .notNull()
    .references(() => Review.id, { onDelete: "cascade" }),

  interviewType: InterviewTypeSchema("interview_type"),
  interviewDifficulty: InterviewDifficultySchema("interview_difficulty"),

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
  "behavioral",
  "technical",
  "case_study",
  "portfolio_walkthrough",
  "online_assessment",
  "screening",
  "other",
]);
export const ZodInterviewDifficultySchema = z.enum(["easy", "average", "hard"]);

export const CreateInterviewRoundSchema = createInsertSchema(InterviewRound, {
  interviewType: ZodInterviewTypeSchema.optional().nullable(),
  interviewDifficulty: ZodInterviewDifficultySchema.optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
