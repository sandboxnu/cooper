import { beforeEach, describe, expect, test, vi } from "vitest";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { studentSession } from "./helpers";

const db = vi.hoisted(() => ({
  query: {
    Role: { findMany: vi.fn() },
    Company: { findMany: vi.fn() },
  },
  execute: vi.fn(),
}));

vi.mock("@cooper/db/client", () => ({ db }));
vi.mock("@cooper/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

async function caller() {
  const ctx = await createTRPCContext({
    session: studentSession,
    headers: new Headers(),
  });
  return createCallerFactory(appRouter)(ctx);
}

const baseInput = {
  itemType: "role" as const,
  sortBy: "default" as const,
  type: "all" as const,
  limit: 10,
};

describe("roleAndCompany.getPageNumber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns found:false when the item is not in the list", async () => {
    // No roles/companies with reviews.
    db.execute.mockResolvedValue({ rows: [] });
    db.query.Role.findMany.mockResolvedValue([]);
    db.query.Company.findMany.mockResolvedValue([]);

    const result = await (
      await caller()
    ).roleAndCompany.getPageNumber({
      ...baseInput,
      itemId: "missing",
    });

    expect(result).toEqual({ page: 1, found: false });
  });

  test("returns the 1-indexed page when the item is found", async () => {
    db.execute
      .mockResolvedValueOnce({ rows: [{ role_id: "r1" }] }) // roles with reviews
      .mockResolvedValueOnce({ rows: [{ company_id: "c1" }] }); // companies with reviews
    db.query.Role.findMany.mockResolvedValue([
      { id: "r1", companyId: "c1", title: "SWE", description: "" },
    ]);
    db.query.Company.findMany.mockResolvedValue([
      { id: "c1", name: "Acme", description: "" },
    ]);

    const result = await (
      await caller()
    ).roleAndCompany.getPageNumber({
      ...baseInput,
      itemId: "r1",
    });

    expect(result).toEqual({ page: 1, found: true });
  });
});
