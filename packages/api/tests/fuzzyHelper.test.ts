import { describe, expect, test } from "vitest";

import { performFuseSearch } from "../src/utils/fuzzyHelper";

interface Item {
  name: string;
}

const items: Item[] = [
  { name: "Draft Kings" },
  { name: "Klaviyo" },
  { name: "Hubspot" },
];

describe("performFuseSearch", () => {
  test("returns the original list when no query is provided", () => {
    expect(performFuseSearch(items, ["name"], undefined)).toBe(items);
  });

  test("returns the original list for an empty query", () => {
    expect(performFuseSearch(items, ["name"], "")).toBe(items);
  });

  test("returns fuzzy matches for a query", () => {
    const result = performFuseSearch(items, ["name"], "klaviyo");
    expect(result[0]?.name).toBe("Klaviyo");
  });

  test("matches approximately (typo tolerant)", () => {
    const result = performFuseSearch(items, ["name"], "hubspt");
    expect(result.some((i) => i.name === "Hubspot")).toBe(true);
  });
});
