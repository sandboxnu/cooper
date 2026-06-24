import { describe, expect, test } from "vitest";

import { createSlug, generateUniqueSlug } from "../src/utils/slugHelpers";

describe("createSlug", () => {
  test("lower-cases and hyphenates spaces", () => {
    expect(createSlug("Draft Kings")).toBe("draft-kings");
  });

  test("strips special characters", () => {
    expect(createSlug("Ben & Jerry's!")).toBe("ben-jerrys");
  });

  test("collapses repeated spaces and hyphens", () => {
    expect(createSlug("Foo   Bar---Baz")).toBe("foo-bar-baz");
  });

  test("keeps existing hyphens", () => {
    expect(createSlug("co-op")).toBe("co-op");
  });
});

describe("generateUniqueSlug", () => {
  test("returns the base slug when it is not taken", () => {
    expect(generateUniqueSlug("acme", ["other"])).toBe("acme");
  });

  test("appends 2 when the base slug is taken", () => {
    expect(generateUniqueSlug("acme", ["acme"])).toBe("acme-2");
  });

  test("increments until it finds a free slug", () => {
    expect(generateUniqueSlug("acme", ["acme", "acme-2", "acme-3"])).toBe(
      "acme-4",
    );
  });
});
