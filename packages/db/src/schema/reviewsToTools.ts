import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Review } from "./reviews";
import { Tool } from "./tools";

export const ReviewsToTools = pgTable(
  "reviews_to_tools",
  {
    reviewId: uuid("reviewId")
      .notNull()
      .references(() => Review.id, { onDelete: "cascade" }),
    toolId: uuid("toolId")
      .notNull()
      .references(() => Tool.id, { onDelete: "cascade" }),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.reviewId, t.toolId] }),
  }),
);

export type ReviewsToToolsType = typeof ReviewsToTools.$inferSelect;

export const ReviewsToToolsRelations = relations(ReviewsToTools, ({ one }) => ({
  review: one(Review, {
    fields: [ReviewsToTools.reviewId],
    references: [Review.id],
  }),
  tool: one(Tool, {
    fields: [ReviewsToTools.toolId],
    references: [Tool.id],
  }),
}));

export const CreateReviewToToolSchema = createInsertSchema(ReviewsToTools, {
  reviewId: z.string(),
  toolId: z.string(),
});
