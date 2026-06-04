import { describe, expect, test } from "vitest";

import { enumToPgEnum } from "../src/utils/enums";

describe("enumToPgEnum", () => {
  test("returns the enum values as a tuple", () => {
    enum Fruit {
      Apple = "APPLE",
      Banana = "BANANA",
    }
    expect(enumToPgEnum(Fruit)).toEqual(["APPLE", "BANANA"]);
  });

  test("works with a plain record of values", () => {
    expect(enumToPgEnum({ a: "ONE", b: "TWO", c: "THREE" })).toEqual([
      "ONE",
      "TWO",
      "THREE",
    ]);
  });
});
