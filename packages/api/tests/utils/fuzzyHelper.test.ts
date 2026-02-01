import { describe, expect, test } from "vitest";
import { performFuseSearch } from "../../src/utils/fuzzyHelper";

describe("performFuseSearch", () => {
  const items = [
    { id: "1", name: "Alice", role: "Engineer" },
    { id: "2", name: "Bob", role: "Designer" },
    { id: "3", name: "Charlie", role: "Engineer" },
  ];

  test("returns all elements when searchQuery is undefined", () => {
    const result = performFuseSearch(items, ["name", "role"], undefined);
    expect(result).toEqual(items);
    expect(result).toHaveLength(3);
  });

  test("returns all elements when searchQuery is empty string", () => {
    const result = performFuseSearch(items, ["name", "role"], "");
    expect(result).toEqual(items);
  });

  test("returns matching elements when searchQuery matches", () => {
    const result = performFuseSearch(items, ["name"], "Alice");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: "1", name: "Alice", role: "Engineer" });
  });

  test("returns multiple matches when searchQuery matches multiple", () => {
    const result = performFuseSearch(items, ["role"], "Engineer");
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toEqual(["Alice", "Charlie"]);
  });

  test("returns empty array when no match", () => {
    const result = performFuseSearch(items, ["name", "role"], "ZZZ");
    expect(result).toEqual([]);
  });

  test("searches across multiple keys", () => {
    const result = performFuseSearch(items, ["name", "role"], "Designer");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Bob");
  });
});
