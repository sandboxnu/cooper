import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Review } from "./reviews";
import { User } from "./users";

export const UsersToReviews = pgTable(
  "users_to_reviews",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => User.id),
    reviewId: uuid("reviewId")
      .notNull()
      .references(() => Review.id),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.userId, t.reviewId] }),
  }),
);

export const UsersToCompaniesRelations = relations(
  UsersToReviews,
  ({ one }) => ({
    user: one(User, {
      fields: [UsersToReviews.userId],
      references: [User.id],
    }),
    company: one(Review, {
      fields: [UsersToReviews.reviewId],
      references: [Review.id],
    }),
  }),
);

export const CreateUserToReviewSchema = createInsertSchema(UsersToReviews, {
  userId: z.string(),
  reviewId: z.string(),
});
