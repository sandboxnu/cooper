import { describe, expect, test } from "vitest";
import { createSlug, generateUniqueSlug } from "../../src/utils/slugHelpers";

describe("createSlug", () => {
  test("converts to lowercase", () => {
    expect(createSlug("Hello World")).toBe("hello-world");
  });

  test("replaces spaces with hyphens", () => {
    expect(createSlug("foo bar baz")).toBe("foo-bar-baz");
  });

  test("removes special characters", () => {
    expect(createSlug("Test & Company!")).toBe("test-company");
  });

  test("collapses multiple hyphens", () => {
    expect(createSlug("foo---bar")).toBe("foo-bar");
  });

  test("handles empty string", () => {
    expect(createSlug("")).toBe("");
  });

  test("preserves numbers", () => {
    expect(createSlug("Company 123")).toBe("company-123");
  });
});

describe("generateUniqueSlug", () => {
  test("returns base slug when not in existing slugs", () => {
    expect(generateUniqueSlug("hello", [])).toBe("hello");
    expect(generateUniqueSlug("hello", ["other"])).toBe("hello");
  });

  test("appends -2 when base slug exists", () => {
    expect(generateUniqueSlug("hello", ["hello"])).toBe("hello-2");
  });

  test("increments counter when multiple collisions", () => {
    expect(generateUniqueSlug("hello", ["hello", "hello-2"])).toBe("hello-3");
  });

  test("finds first available slot", () => {
    expect(generateUniqueSlug("test", ["test", "test-2", "test-3"])).toBe(
      "test-4",
    );
  });
});
