import { describe, expect, test, vi } from "vitest";

import type { WorkEnvironmentType } from "@cooper/db/schema";

// Avoid loading the @cooper/ui barrel (pulls in .tsx components Vite can't
// transform here). stringHelpers only needs `cn` to join class strings.
vi.mock("@cooper/ui", () => ({
  cn: (...inputs: unknown[]) => inputs.flat().filter(Boolean).join(" "),
}));

import {
  abbreviatedWorkTerm,
  prettyDescription,
  prettyIndustry,
  prettyWorkEnviornment,
  truncateText,
} from "~/utils/stringHelpers";

describe("truncateText", () => {
  test("truncates and appends ellipsis when text is at/over the length", () => {
    expect(truncateText("hello world", 5)).toBe("hello ...");
  });

  test("returns the text unchanged when shorter than the length", () => {
    expect(truncateText("hi", 5)).toBe("hi");
  });

  test("returns falsy text as-is", () => {
    expect(truncateText("", 5)).toBe("");
  });
});

describe("abbreviatedWorkTerm", () => {
  test.each([
    ["SPRING", "Spr"],
    ["SUMMER", "Sum"],
    ["FALL", "Fall"],
  ])("maps %s to %s", (input, expected) => {
    expect(abbreviatedWorkTerm(input)).toBe(expected);
  });

  test("returns the input for unknown terms", () => {
    expect(abbreviatedWorkTerm("WINTER")).toBe("WINTER");
  });
});

describe("prettyWorkEnviornment", () => {
  test.each([
    ["HYBRID", "Hybrid"],
    ["INPERSON", "In-person"],
    ["REMOTE", "Remote"],
  ])("maps %s to %s", (input, expected) => {
    expect(prettyWorkEnviornment(input as WorkEnvironmentType)).toBe(expected);
  });
});

describe("prettyDescription", () => {
  test("returns empty string for nullish input", () => {
    expect(prettyDescription()).toBe("");
    expect(prettyDescription(null)).toBe("");
  });

  test("returns the description unchanged when under the limit", () => {
    expect(prettyDescription("short", 200)).toBe("short");
  });

  test("truncates and appends ellipsis when over the limit", () => {
    const long = "a".repeat(250);
    const result = prettyDescription(long);
    expect(result).toBe("a".repeat(200) + "...");
  });
});

describe("prettyIndustry", () => {
  test("returns 'Unknown Industry' when undefined", () => {
    expect(prettyIndustry()).toBe("Unknown Industry");
  });

  test("returns 'Unknown Industry' for unrecognized values", () => {
    expect(prettyIndustry("MADE_UP")).toBe("Unknown Industry");
  });

  const cases: [string, string][] = [
    ["TECHNOLOGY", "Technology"],
    ["HEALTHCARE", "Healthcare"],
    ["FINANCE", "Finance"],
    ["EDUCATION", "Education"],
    ["MANUFACTURING", "Manufacturing"],
    ["HOSPITALITY", "Hospitality"],
    ["RETAIL", "Retail"],
    ["TRANSPORTATION", "Transportation"],
    ["ENERGY", "Energy"],
    ["MEDIA", "Media"],
    ["AEROSPACE", "Aerospace"],
    ["TELECOMMUNICATIONS", "Telecommunications"],
    ["BIOTECHNOLOGY", "Biotechnology"],
    ["PHARMACEUTICAL", "Pharmaceutical"],
    ["CONSTRUCTION", "Construction"],
    ["REALESTATE", "Real Estate"],
    ["FASHIONANDBEAUTY", "Fashion & Beauty"],
    ["ENTERTAINMENT", "Entertainment"],
    ["GOVERNMENT", "Government"],
    ["NONPROFIT", "Nonprofit"],
    ["FOODANDBEVERAGE", "Food & Beverage"],
    ["GAMING", "Gaming"],
    ["SPORTS", "Sports"],
    ["MARKETING", "Marketing"],
    ["CONSULTING", "Consulting"],
    ["FITNESS", "Fitness"],
    ["ECOMMERCE", "E-commerce"],
    ["ENVIRONMENTAL", "Environmental"],
    ["ROBOTICS", "Robotics"],
    ["MUSIC", "Music"],
    ["INSURANCE", "Insurance"],
    ["DESIGN", "Design"],
    ["PUBLISHING", "Publishing"],
    ["ARCHITECTURE", "Architecture"],
    ["VETERINARY", "Veterinary"],
  ];

  test.each(cases)("maps %s to %s", (input, expected) => {
    expect(prettyIndustry(input)).toBe(expected);
  });
});
