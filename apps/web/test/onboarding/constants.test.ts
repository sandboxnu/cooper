import { describe, expect, test } from "vitest";
import {
  industryOptions,
  majors,
  monthOptions,
} from "~/app/_components/onboarding/constants";

describe("onboarding constants", () => {
  describe("monthOptions", () => {
    test("has 12 months", () => {
      expect(monthOptions).toHaveLength(12);
    });

    test("includes January and December", () => {
      const labels = monthOptions.map((m) => m.label);
      expect(labels).toContain("January");
      expect(labels).toContain("December");
    });

    test("values are string numbers 1-12", () => {
      expect(monthOptions[0]).toEqual({ value: "1", label: "January" });
      expect(monthOptions[11]).toEqual({ value: "12", label: "December" });
    });
  });

  describe("industryOptions", () => {
    test("has multiple industries", () => {
      expect(industryOptions.length).toBeGreaterThan(10);
    });

    test("includes Technology and Healthcare", () => {
      const values = industryOptions.map((i) => i.value);
      expect(values).toContain("TECHNOLOGY");
      expect(values).toContain("HEALTHCARE");
    });

    test("each option has value and label", () => {
      industryOptions.forEach((opt) => {
        expect(opt).toHaveProperty("value");
        expect(opt).toHaveProperty("label");
        expect(typeof opt.value).toBe("string");
        expect(typeof opt.label).toBe("string");
      });
    });
  });

  describe("majors", () => {
    test("has multiple majors", () => {
      expect(majors.length).toBeGreaterThan(10);
    });

    test("is array of strings", () => {
      majors.forEach((m) => {
        expect(typeof m).toBe("string");
        expect(m.length).toBeGreaterThan(0);
      });
    });
  });
});
