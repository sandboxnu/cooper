import { describe, expect, test } from "vitest";
import { abbreviatedStateName, prettyLocationName } from "./locationHelpers";

describe("locationHelpers", () => {
  describe("prettyLocationName", () => {
    test("returns N/A for undefined location", () => {
      expect(prettyLocationName(undefined)).toBe("N/A");
    });

    test("returns city and abbreviated state when state present (no country)", () => {
      expect(
        prettyLocationName({
          city: "Boston",
          state: "Massachusetts",
          country: "USA",
        } as never),
      ).toBe("Boston, MA");
    });

    test("returns city, country when no state", () => {
      expect(
        prettyLocationName({
          city: "Toronto",
          state: undefined,
          country: "Canada",
        } as never),
      ).toBe("Toronto, Canada");
    });

    test("abbreviates full state name", () => {
      expect(
        prettyLocationName({
          city: "San Francisco",
          state: "California",
          country: "USA",
        } as never),
      ).toBe("San Francisco, CA");
    });
  });

  describe("abbreviatedStateName", () => {
    test("uppercases 2-letter state codes", () => {
      expect(abbreviatedStateName("ca")).toBe("CA");
      expect(abbreviatedStateName("ny")).toBe("NY");
    });

    test("converts full state names to abbreviations", () => {
      expect(abbreviatedStateName("California")).toBe("CA");
      expect(abbreviatedStateName("New York")).toBe("NY");
      expect(abbreviatedStateName("Texas")).toBe("TX");
      expect(abbreviatedStateName("Alabama")).toBe("AL");
      expect(abbreviatedStateName("District of Columbia")).toBe("DC");
      expect(abbreviatedStateName("New Hampshire")).toBe("NH");
      expect(abbreviatedStateName("West Virginia")).toBe("WV");
    });

    test("returns state unchanged when not in map", () => {
      expect(abbreviatedStateName("Unknown")).toBe("Unknown");
    });
  });
});
