import { describe, expect, test } from "vitest";
import {
  averageStarRating,
  listBenefits,
  mostCommonWorkEnviornment,
} from "./reviewsAggregationHelpers";

describe("reviewsAggregationHelpers", () => {
  describe("mostCommonWorkEnviornment", () => {
    test("returns In Person when INPERSON is most common", () => {
      const reviews = [
        { workEnvironment: "INPERSON" },
        { workEnvironment: "INPERSON" },
        { workEnvironment: "REMOTE" },
      ] as { workEnvironment: string }[];
      expect(mostCommonWorkEnviornment(reviews)).toBe("In Person");
    });

    test("returns Hybrid when HYBRID is most common", () => {
      const reviews = [
        { workEnvironment: "HYBRID" },
        { workEnvironment: "HYBRID" },
        { workEnvironment: "REMOTE" },
      ] as { workEnvironment: string }[];
      expect(mostCommonWorkEnviornment(reviews)).toBe("Hybrid");
    });

    test("returns Remote when REMOTE is most common", () => {
      const reviews = [
        { workEnvironment: "REMOTE" },
        { workEnvironment: "REMOTE" },
        { workEnvironment: "INPERSON" },
      ] as { workEnvironment: string }[];
      expect(mostCommonWorkEnviornment(reviews)).toBe("Remote");
    });

    test("ties: In Person wins over others", () => {
      const reviews = [
        { workEnvironment: "INPERSON" },
        { workEnvironment: "HYBRID" },
        { workEnvironment: "REMOTE" },
      ] as { workEnvironment: string }[];
      expect(mostCommonWorkEnviornment(reviews)).toBe("In Person");
    });
  });

  describe("averageStarRating", () => {
    test("returns average of overall ratings", () => {
      const reviews = [
        { overallRating: 4 },
        { overallRating: 5 },
        { overallRating: 3 },
      ] as { overallRating: number }[];
      expect(averageStarRating(reviews)).toBe(4);
    });

    test("handles decimal average", () => {
      const reviews = [{ overallRating: 4 }, { overallRating: 5 }] as {
        overallRating: number;
      }[];
      expect(averageStarRating(reviews)).toBe(4.5);
    });
  });

  describe("listBenefits", () => {
    test("returns empty array when no benefits", () => {
      const review = {
        pto: false,
        federalHolidays: false,
        freeLunch: false,
        travelBenefits: false,
        freeMerch: false,
        snackBar: false,
      } as never;
      expect(listBenefits(review)).toEqual([]);
    });

    test("returns labels for each benefit that is true", () => {
      const review = {
        pto: true,
        federalHolidays: true,
        freeLunch: false,
        travelBenefits: true,
        freeMerch: false,
        snackBar: true,
      } as never;
      const result = listBenefits(review);
      expect(result).toContain("Paid Time Off");
      expect(result).toContain("Federal Holidays Off");
      expect(result).toContain("Free Transporation");
      expect(result).toContain("Snack Bar");
      expect(result).not.toContain("Free Lunch");
      expect(result).not.toContain("Free Merch");
    });
  });
});
