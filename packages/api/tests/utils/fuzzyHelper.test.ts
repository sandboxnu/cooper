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

  test("returns empty array when no match", () => {
    const result = performFuseSearch(items, ["name", "role"], "ZZZ");
    expect(result).toEqual([]);
  });

  test("searches across multiple keys", () => {
    const result = performFuseSearch(items, ["name", "role"], "Designer");
    expect(result).toHaveLength(1);
    const first = result[0];
    if (!first) throw new Error("expected one result");
    expect(first.name).toBe("Bob");
  });
});
