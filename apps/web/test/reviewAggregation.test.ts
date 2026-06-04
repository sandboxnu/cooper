import { describe, expect, test } from "vitest";

import type { ReviewType } from "@cooper/db/schema";

import { calculateRatings } from "~/utils/reviewCountByStars";
import {
  averageStarRating,
  listBenefits,
  mostCommonWorkEnviornment,
} from "~/utils/reviewsAggregationHelpers";

const review = (overrides: Partial<ReviewType> = {}): ReviewType =>
  ({
    overallRating: 5,
    workEnvironment: "REMOTE",
    pto: false,
    federalHolidays: false,
    freeLunch: false,
    travelBenefits: false,
    freeMerch: false,
    snackBar: false,
    ...overrides,
  }) as ReviewType;

describe("calculateRatings", () => {
  test("returns 0% for every star bucket when there are no reviews", () => {
    expect(calculateRatings([])).toEqual([
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ]);
  });

  test("defaults to empty array when called with no args", () => {
    expect(calculateRatings()).toHaveLength(5);
  });

  test("computes the percentage distribution across stars", () => {
    const reviews = [
      review({ overallRating: 5 }),
      review({ overallRating: 5 }),
      review({ overallRating: 4 }),
      review({ overallRating: 1 }),
    ];
    expect(calculateRatings(reviews)).toEqual([
      { stars: 5, percentage: 50 },
      { stars: 4, percentage: 25 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 25 },
    ]);
  });
});

describe("mostCommonWorkEnviornment", () => {
  test("returns In Person when in-person ties or leads", () => {
    expect(
      mostCommonWorkEnviornment([
        review({ workEnvironment: "INPERSON" }),
        review({ workEnvironment: "REMOTE" }),
      ]),
    ).toBe("In Person");
  });

  test("returns Hybrid when hybrid leads", () => {
    expect(
      mostCommonWorkEnviornment([
        review({ workEnvironment: "HYBRID" }),
        review({ workEnvironment: "HYBRID" }),
        review({ workEnvironment: "INPERSON" }),
      ]),
    ).toBe("Hybrid");
  });

  test("returns Remote when remote leads", () => {
    expect(
      mostCommonWorkEnviornment([
        review({ workEnvironment: "REMOTE" }),
        review({ workEnvironment: "REMOTE" }),
        review({ workEnvironment: "HYBRID" }),
      ]),
    ).toBe("Remote");
  });
});

describe("averageStarRating", () => {
  test("averages the overall ratings", () => {
    expect(
      averageStarRating([
        review({ overallRating: 4 }),
        review({ overallRating: 2 }),
      ]),
    ).toBe(3);
  });

  test("treats null ratings as 0", () => {
    expect(
      averageStarRating([
        review({ overallRating: null }),
        review({ overallRating: 4 }),
      ]),
    ).toBe(2);
  });
});

describe("listBenefits", () => {
  test("returns no benefits when none are set", () => {
    expect(listBenefits(review())).toEqual([]);
  });

  test("lists every enabled benefit", () => {
    expect(
      listBenefits(
        review({
          pto: true,
          federalHolidays: true,
          freeLunch: true,
          travelBenefits: true,
          freeMerch: true,
          snackBar: true,
        }),
      ),
    ).toEqual([
      "Paid Time Off",
      "Federal Holidays Off",
      "Free Lunch",
      "Free Transporation",
      "Free Merch",
      "Snack Bar",
    ]);
  });
});
