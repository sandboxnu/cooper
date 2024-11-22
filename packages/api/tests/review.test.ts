import { describe, expect, test, vi } from "vitest";

vi.mock("@cooper/db/client", () => ({
  db: {
    query: {
      Review: {
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: vi.fn(),
}));

describe("Review Router", () => {
  test("this should pass", () => {
    expect(true).toBe(true);
  });
});
