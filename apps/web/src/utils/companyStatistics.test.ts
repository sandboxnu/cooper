import { describe, expect, test } from "vitest";
import {
  calculatePay,
  calculatePayRange,
  calculateWorkModels,
} from "./companyStatistics";
import { ReviewType } from "@cooper/db/schema";

describe("companyStatistics", () => {
  const mockReviews = [
    {
      workEnvironment: "REMOTE",
      hourlyPay: "25",
    },
    {
      workEnvironment: "REMOTE",
      hourlyPay: "25",
    },
    {
      workEnvironment: "HYBRID",
      hourlyPay: "30",
    },
    {
      workEnvironment: "INPERSON",
      hourlyPay: "20",
    },
  ] as ReviewType[];

  describe("calculateWorkModels", () => {
    test("returns empty array for no reviews", () => {
      expect(calculateWorkModels([])).toEqual([]);
    });

    test("returns unique work models with count and percentage", () => {
      const result = calculateWorkModels(mockReviews);
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({
        name: "Remote",
        percentage: 50,
        count: 2,
      });
      expect(result).toContainEqual({
        name: "Hybrid",
        percentage: 25,
        count: 1,
      });
      expect(result).toContainEqual({
        name: "Inperson",
        percentage: 25,
        count: 1,
      });
    });

    test("title-cases model names", () => {
      const result = calculateWorkModels([
        { workEnvironment: "REMOTE" } as never,
      ]);
      expect(result[0]?.name).toBe("Remote");
    });
  });

  describe("calculatePay", () => {
    test("returns empty array for no reviews", () => {
      expect(calculatePay([])).toEqual([]);
    });

    test("returns pay breakdown with count and percentage", () => {
      const result = calculatePay(mockReviews);
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({
        pay: "25",
        percentage: 50,
        count: 2,
      });
      expect(result).toContainEqual({
        pay: "30",
        percentage: 25,
        count: 1,
      });
      expect(result).toContainEqual({
        pay: "20",
        percentage: 25,
        count: 1,
      });
    });

    test("treats null hourlyPay as 0", () => {
      const result = calculatePay([
        { hourlyPay: null } as never,
        { hourlyPay: "10" } as never,
      ]);
      expect(result).toContainEqual({
        pay: "0",
        percentage: 50,
        count: 1,
      });
    });
  });

  describe("calculatePayRange", () => {
    test("returns single range with min/max 0 for no reviews", () => {
      expect(calculatePayRange([])).toEqual([{ min: 0, max: 0 }]);
    });

    test("splits into Low/Mid/High when 3+ unique pay values", () => {
      const reviews = [
        { hourlyPay: "10" },
        { hourlyPay: "20" },
        { hourlyPay: "30" },
      ] as ReviewType[];
      const result = calculatePayRange(reviews);
      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({ label: "Low", min: 10 });
      expect(result[1]).toMatchObject({ label: "Mid" });
      expect(result[2]).toMatchObject({ label: "High", max: 30 });
    });

    test("returns Low and Mid ranges when fewer than 3 unique pays", () => {
      const reviews = [
        { hourlyPay: "15" },
        { hourlyPay: "25" },
      ] as ReviewType[];
      const result = calculatePayRange(reviews);
      expect(result).toHaveLength(2);
      expect(result[0]?.label).toBe("Low");
      expect(result[1]?.label).toBe("Mid");
    });
  });
});
