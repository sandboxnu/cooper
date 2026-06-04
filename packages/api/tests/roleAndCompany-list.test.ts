import { beforeEach, describe, expect, test, vi } from "vitest";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { studentSession } from "./helpers";

const db = vi.hoisted(() => ({
  query: {
    Role: { findMany: vi.fn() },
    Company: { findMany: vi.fn() },
    Review: { findMany: vi.fn() },
    CompaniesToLocations: { findMany: vi.fn() },
  },
  execute: vi.fn(),
}));

vi.mock("@cooper/db/client", () => ({ db }));
vi.mock("@cooper/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

async function list(input: Record<string, unknown>) {
  const ctx = await createTRPCContext({
    session: studentSession,
    headers: new Headers(),
  });
  return createCallerFactory(appRouter)(ctx).roleAndCompany.list(input);
}

const role = {
  id: "r1",
  companyId: "c1",
  title: "Software Engineer",
  description: "Build things",
};
const company = {
  id: "c1",
  name: "Acme",
  industry: "TECHNOLOGY",
  description: "A company",
  hidden: false,
};

/**
 * The default (non-rating) list path issues, in order:
 *   1. execute -> roles-with-reviews
 *   2. Role.findMany
 *   3. Company.findMany
 *   4. execute -> companies-with-reviews
 *   then up to 5 aggregate `execute` queries per roles/companies block.
 * We seed the first two `execute` calls explicitly and let the rest return
 * aggregate rows that populate the avg/rating/work-model maps.
 */
function seedDefaultPath() {
  db.query.Role.findMany.mockResolvedValue([role]);
  db.query.Company.findMany.mockResolvedValue([company]);
  db.execute
    .mockResolvedValueOnce({ rows: [{ role_id: "r1" }] })
    .mockResolvedValueOnce({ rows: [{ company_id: "c1" }] })
    .mockResolvedValue({
      rows: [
        {
          id: "r1",
          avg_hourly_pay: 25,
          avg_rating: 4,
          avg_culture_rating: 4,
          overtime_percent: 0.6,
          work_models: ["REMOTE", null],
        },
        {
          id: "c1",
          avg_hourly_pay: 30,
          avg_rating: 5,
          avg_culture_rating: 5,
          overtime_percent: 0.7,
          work_models: ["REMOTE"],
        },
      ],
    });
}

describe("roleAndCompany.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns roles and companies with counts", async () => {
    seedDefaultPath();

    const result = await list({});

    expect(result.totalCount).toBe(2);
    expect(result.totalRolesCount).toBe(1);
    expect(result.totalCompanyCount).toBe(1);
    const roleItem = result.items.find((i) => i.type === "role");
    expect(roleItem).toMatchObject({ companyName: "Acme" });
  });

  test("type=roles returns only roles", async () => {
    seedDefaultPath();

    const result = await list({ type: "roles" });

    expect(result.items.every((i) => i.type === "role")).toBe(true);
  });

  test("type=companies returns only companies", async () => {
    seedDefaultPath();

    const result = await list({ type: "companies" });

    expect(result.items.every((i) => i.type === "company")).toBe(true);
  });

  test("search reorders the combined list and still filters", async () => {
    seedDefaultPath();

    const result = await list({ search: "Acme" });

    expect(result.items.some((i) => i.type === "company")).toBe(true);
  });

  test("rating sort uses the aggregate ranking queries", async () => {
    db.execute
      .mockResolvedValueOnce({
        rows: [{ id: "r1", companyId: "c1", title: "SWE", avg_rating: 5 }],
      }) // roles-with-ratings
      .mockResolvedValueOnce({
        rows: [{ id: "c1", name: "Acme", avg_rating: 5 }],
      }) // companies-with-ratings
      .mockResolvedValue({ rows: [] });

    const result = await list({ sortBy: "rating" });

    expect(result.totalCount).toBe(2);
  });

  test("industry filter keeps matching items and drops the rest", async () => {
    seedDefaultPath();

    const result = await list({ filters: { industries: ["TECHNOLOGY"] } });

    expect(result.totalCompanyCount).toBe(1);

    db.execute.mockReset();
    seedDefaultPath();
    const none = await list({ filters: { industries: ["FINANCE"] } });
    expect(none.totalCount).toBe(0);
  });

  test("pay, ratings, overtime, culture and work-model filters run together", async () => {
    seedDefaultPath();

    const result = await list({
      filters: {
        minPay: 10,
        maxPay: 100,
        ratings: ["4"],
        companyCulture: ["3", "4"],
        overtimeWork: true,
        workModels: ["REMOTE"],
      },
    });

    expect(result.items.some((i) => i.type === "role")).toBe(true);
  });

  test("location filter consults the CompaniesToLocations map", async () => {
    seedDefaultPath();
    db.query.CompaniesToLocations.findMany.mockResolvedValue([
      { companyId: "c1", locationId: "l1" },
    ]);

    const result = await list({ filters: { locations: ["l1"] } });

    expect(db.query.CompaniesToLocations.findMany).toHaveBeenCalledOnce();
    expect(result.totalCount).toBeGreaterThan(0);
  });

  test("job-type filter consults review job types", async () => {
    seedDefaultPath();
    db.query.Review.findMany.mockResolvedValue([
      { companyId: "c1", roleId: "r1", jobType: "Co-op" },
    ]);

    const result = await list({ filters: { jobTypes: ["CO-OP"] } });

    expect(db.query.Review.findMany).toHaveBeenCalledOnce();
    expect(result.items.some((i) => i.type === "role")).toBe(true);
  });
});

describe("roleAndCompany.getPageNumber (rating sort)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("locates an item when sorting by rating", async () => {
    db.execute
      .mockResolvedValueOnce({
        rows: [{ id: "r1", companyId: "c1", title: "SWE", avg_rating: 5 }],
      })
      .mockResolvedValueOnce({
        rows: [{ id: "c1", name: "Acme", avg_rating: 5 }],
      });

    const ctx = await createTRPCContext({
      session: studentSession,
      headers: new Headers(),
    });
    const result = await createCallerFactory(appRouter)(
      ctx,
    ).roleAndCompany.getPageNumber({
      itemId: "r1",
      itemType: "role",
      sortBy: "rating",
      type: "all",
      limit: 10,
    });

    expect(result).toEqual({ page: 1, found: true });
  });
});
