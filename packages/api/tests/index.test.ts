import { describe, expect, test, vi } from "vitest";

vi.mock("@cooper/db/client", () => ({ db: {} }));
vi.mock("@cooper/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

import { appRouter } from "../src/root";

describe("appRouter wiring", () => {
  test("exposes every expected sub-router", () => {
    expect(Object.keys(appRouter)).toEqual(
      expect.arrayContaining([
        "admin",
        "auth",
        "company",
        "role",
        "profile",
        "report",
        "review",
        "location",
        "companyToLocation",
        "roleAndCompany",
        "tool",
        "user",
      ]),
    );
  });
});
