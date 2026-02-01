import { describe, expect, test } from "vitest";
import { calculateRatings } from "./reviewCountByStars";

describe("reviewCountByStars", () => {
  describe("calculateRatings", () => {
    test("returns zeros for empty reviews", () => {
      const result = calculateRatings([]);
      expect(result).toHaveLength(5);
      result.forEach((r) => {
        expect(r.percentage).toBe(0);
        expect([1, 2, 3, 4, 5]).toContain(r.stars);
      });
    });

    test("returns stars 1-5 with percentage", () => {
      const reviews = [
        { overallRating: 5 },
        { overallRating: 5 },
        { overallRating: 4 },
        { overallRating: 3 },
      ] as { overallRating: number }[];
      const result = calculateRatings(reviews);
      expect(result).toHaveLength(5);
      const five = result.find((r) => r.stars === 5);
      const four = result.find((r) => r.stars === 4);
      const three = result.find((r) => r.stars === 3);
      expect(five?.percentage).toBe(50);
      expect(four?.percentage).toBe(25);
      expect(three?.percentage).toBe(25);
    });
  });
});
