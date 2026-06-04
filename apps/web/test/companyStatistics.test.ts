import { describe, expect, test, vi } from "vitest";

import type { ReviewType } from "@cooper/db/schema";

// companyStatistics -> stringHelpers -> @cooper/ui; stub the barrel so the
// untransformable .tsx components aren't pulled into the test graph.
vi.mock("@cooper/ui", () => ({
  cn: (...inputs: unknown[]) => inputs.flat().filter(Boolean).join(" "),
}));

import {
  calculateJobTypes,
  calculatePay,
  calculatePayRange,
  calculateWorkModels,
} from "~/utils/companyStatistics";

const review = (overrides: Partial<ReviewType> = {}): ReviewType =>
  ({
    workEnvironment: "REMOTE",
    jobType: "CO_OP",
    hourlyPay: "20",
    ...overrides,
  }) as ReviewType;

describe("calculateWorkModels", () => {
  test("returns empty array when given no reviews", () => {
    expect(calculateWorkModels()).toEqual([]);
  });

  test("computes count and percentage per unique work model", () => {
    const result = calculateWorkModels([
      review({ workEnvironment: "REMOTE" }),
      review({ workEnvironment: "REMOTE" }),
      review({ workEnvironment: "HYBRID" }),
      review({ workEnvironment: "INPERSON" }),
    ]);
    expect(result).toContainEqual({ name: "Remote", percentage: 50, count: 2 });
    expect(result).toContainEqual({ name: "Hybrid", percentage: 25, count: 1 });
    expect(result).toContainEqual({
      name: "In-person",
      percentage: 25,
      count: 1,
    });
  });
});

describe("calculateJobTypes", () => {
  test("returns empty array when given no reviews", () => {
    expect(calculateJobTypes()).toEqual([]);
  });

  test("camel-cases the job type names and computes percentages", () => {
    const result = calculateJobTypes([
      review({ jobType: "coop" }),
      review({ jobType: "coop" }),
      review({ jobType: "internship" }),
    ]);
    expect(result).toContainEqual({ name: "Coop", percentage: 67, count: 2 });
    expect(result).toContainEqual({
      name: "Internship",
      percentage: 33,
      count: 1,
    });
  });
});

describe("calculatePay", () => {
  test("returns empty array when no reviews have valid pay", () => {
    expect(
      calculatePay([review({ hourlyPay: "" }), review({ hourlyPay: null })]),
    ).toEqual([]);
  });

  test("groups reviews by pay value", () => {
    const result = calculatePay([
      review({ hourlyPay: "20" }),
      review({ hourlyPay: "20" }),
      review({ hourlyPay: "30" }),
    ]);
    expect(result).toContainEqual({ pay: "20", percentage: 67, count: 2 });
    expect(result).toContainEqual({ pay: "30", percentage: 33, count: 1 });
  });
});

describe("calculatePayRange", () => {
  test("returns a zero range when there is no valid pay", () => {
    expect(calculatePayRange([review({ hourlyPay: "0" })])).toEqual([
      { min: 0, max: 0 },
    ]);
  });

  test("returns a single 'Pay' bucket when all pays are equal", () => {
    expect(
      calculatePayRange([
        review({ hourlyPay: "25" }),
        review({ hourlyPay: "25" }),
      ]),
    ).toEqual([{ label: "Pay", min: 25, max: 25 }]);
  });

  test("splits into Low/Mid buckets for two unique pays", () => {
    const result = calculatePayRange([
      review({ hourlyPay: "10" }),
      review({ hourlyPay: "20" }),
    ]);
    expect(result).toEqual([
      { label: "Low", min: 10, max: 15 },
      { label: "Mid", min: 16, max: 20 },
    ]);
  });

  test("splits into Low/Mid/High buckets for three or more unique pays", () => {
    const result = calculatePayRange([
      review({ hourlyPay: "10" }),
      review({ hourlyPay: "20" }),
      review({ hourlyPay: "40" }),
    ]);
    expect(result).toHaveLength(3);
    expect(result[0]?.label).toBe("Low");
    expect(result[1]?.label).toBe("Mid");
    expect(result[2]?.label).toBe("High");
    expect(result[0]?.min).toBe(10);
    expect(result[2]?.max).toBe(40);
  });
});
