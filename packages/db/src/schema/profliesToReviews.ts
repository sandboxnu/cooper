import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Profile } from "./profiles";
import { Review } from "./reviews";

export const ProfilesToReviews = pgTable(
  "profiles_to_reviews",
  {
    profileId: uuid("profileId")
      .notNull()
      .references(() => Profile.id),
    reviewId: uuid("reviewId")
      .notNull()
      .references(() => Review.id),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.profileId, t.reviewId] }),
  }),
);

export const ProfilesToReviewsRelations = relations(
  ProfilesToReviews,
  ({ one }) => ({
    profile: one(Profile, {
      fields: [ProfilesToReviews.profileId],
      references: [Profile.id],
    }),
    review: one(Review, {
      fields: [ProfilesToReviews.reviewId],
      references: [Review.id],
    }),
  }),
);

export const CreateProfileToReviewSchema = createInsertSchema(
  ProfilesToReviews,
  {
    profileId: z.string(),
    reviewId: z.string(),
  },
);
