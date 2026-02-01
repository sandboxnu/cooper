import { describe, expect, test } from "vitest";
import {
  abbreviatedWorkTerm,
  prettyDescription,
  prettyIndustry,
  prettyWorkEnviornment,
  truncateText,
} from "./stringHelpers";

describe("stringHelpers", () => {
  describe("truncateText", () => {
    test("returns text unchanged when shorter than length", () => {
      expect(truncateText("hi", 10)).toBe("hi");
    });

    test("returns text with ellipsis when at or over length", () => {
      const result = truncateText("hello world", 5);
      expect(result).toContain("hello");
      expect(result).toContain("...");
    });
  });

  describe("abbreviatedWorkTerm", () => {
    test("abbreviates SPRING, SUMMER, FALL", () => {
      expect(abbreviatedWorkTerm("SPRING")).toBe("Spr");
      expect(abbreviatedWorkTerm("SUMMER")).toBe("Sum");
      expect(abbreviatedWorkTerm("FALL")).toBe("Fall");
    });

    test("returns other terms unchanged", () => {
      expect(abbreviatedWorkTerm("WINTER")).toBe("WINTER");
    });
  });

  describe("prettyWorkEnviornment", () => {
    test("formats work environment labels", () => {
      expect(prettyWorkEnviornment("HYBRID")).toBe("Hybrid");
      expect(prettyWorkEnviornment("INPERSON")).toBe("In-person");
      expect(prettyWorkEnviornment("REMOTE")).toBe("Remote");
    });
  });

  describe("prettyDescription", () => {
    test("returns empty string for undefined or null", () => {
      expect(prettyDescription(undefined)).toBe("");
      expect(prettyDescription(null)).toBe("");
    });

    test("returns description when under max length", () => {
      const short = "Short text";
      expect(prettyDescription(short)).toBe(short);
    });

    test("truncates and appends ... when over max length", () => {
      const long = "a".repeat(250);
      const result = prettyDescription(long, 200);
      expect(result).toHaveLength(203);
      expect(result.endsWith("...")).toBe(true);
    });

    test("uses default max length 200", () => {
      const long = "a".repeat(250);
      expect(prettyDescription(long).length).toBe(203);
    });
  });

  describe("prettyIndustry", () => {
    test("returns Unknown Industry for undefined or empty", () => {
      expect(prettyIndustry(undefined)).toBe("Unknown Industry");
      expect(prettyIndustry("")).toBe("Unknown Industry");
    });

    test("formats known industry codes", () => {
      expect(prettyIndustry("TECHNOLOGY")).toBe("Technology");
      expect(prettyIndustry("HEALTHCARE")).toBe("Healthcare");
      expect(prettyIndustry("FINANCE")).toBe("Finance");
      expect(prettyIndustry("REALESTATE")).toBe("Real Estate");
      expect(prettyIndustry("FASHIONANDBEAUTY")).toBe("Fashion & Beauty");
      expect(prettyIndustry("FOODANDBEVERAGE")).toBe("Food & Beverage");
    });

    test("returns Unknown Industry for unknown code", () => {
      expect(prettyIndustry("UNKNOWN")).toBe("Unknown Industry");
    });
  });
});
