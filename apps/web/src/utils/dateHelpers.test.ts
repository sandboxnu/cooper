import { describe, expect, test } from "vitest";
import { formatDate } from "./dateHelpers";

describe("dateHelpers", () => {
  describe("formatDate", () => {
    test("returns empty string for undefined", () => {
      expect(formatDate(undefined)).toBe("");
    });

    test("returns formatted date as dd mth yyyy", () => {
      expect(formatDate(new Date(2025, 0, 15))).toBe("15 Jan 2025");
      expect(formatDate(new Date(2024, 11, 1))).toBe("01 Dec 2024");
      expect(formatDate(new Date(2023, 5, 7))).toBe("07 Jun 2023");
    });

    test("pads single-digit day with zero", () => {
      expect(formatDate(new Date(2025, 2, 5))).toBe("05 Mar 2025");
    });
  });
});
