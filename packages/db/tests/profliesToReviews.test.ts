import { createTableRelationsHelpers } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, test } from "vitest";

import {
  CreateProfileToReviewSchema,
  ProfilesToReviews,
  ProfilesToReviewsRelations,
} from "../src/schema/profliesToReviews";

describe("ProfilesToReviews table", () => {
  test("defines the profileId and reviewId columns", () => {
    expect(ProfilesToReviews.profileId).toBeDefined();
    expect(ProfilesToReviews.reviewId).toBeDefined();
    expect(ProfilesToReviews.profileId.notNull).toBe(true);
    expect(ProfilesToReviews.reviewId.notNull).toBe(true);
  });

  test("uses a composite primary key over both columns", () => {
    const { primaryKeys } = getTableConfig(ProfilesToReviews);
    expect(primaryKeys).toHaveLength(1);
    const pkColumns = primaryKeys[0]?.columns.map((c) => c.name);
    expect(pkColumns).toEqual(["profileId", "reviewId"]);
  });

  test("declares foreign keys to the profiles and reviews tables", () => {
    const { foreignKeys } = getTableConfig(ProfilesToReviews);
    expect(foreignKeys).toHaveLength(2);
    const referencedTables = foreignKeys
      .map((fk) => getTableConfig(fk.reference().foreignTable).name)
      .sort();
    expect(referencedTables).toEqual(["profile", "review"]);
  });
});

describe("ProfilesToReviewsRelations", () => {
  test("maps profile and review relations to their tables", () => {
    const relations = ProfilesToReviewsRelations.config(
      createTableRelationsHelpers(ProfilesToReviews),
    );
    expect(Object.keys(relations).sort()).toEqual(["profile", "review"]);
    expect(getTableConfig(relations.profile.referencedTable).name).toBe(
      "profile",
    );
    expect(getTableConfig(relations.review.referencedTable).name).toBe(
      "review",
    );
  });
});

describe("CreateProfileToReviewSchema", () => {
  test("parses a valid profile/review pair", () => {
    const result = CreateProfileToReviewSchema.safeParse({
      profileId: "p1",
      reviewId: "rev1",
    });
    expect(result.success).toBe(true);
  });

  test("rejects a missing reviewId", () => {
    const result = CreateProfileToReviewSchema.safeParse({ profileId: "p1" });
    expect(result.success).toBe(false);
  });

  test("rejects non-string ids", () => {
    const result = CreateProfileToReviewSchema.safeParse({
      profileId: 1,
      reviewId: 2,
    });
    expect(result.success).toBe(false);
  });
});
