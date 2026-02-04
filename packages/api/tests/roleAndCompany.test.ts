import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Mock } from "vitest";

import { auth } from "@cooper/auth";
import { db } from "@cooper/db/client";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";

const mockRole = {
  id: "role-1",
  title: "Engineer",
  description: "Build",
  companyId: "company-1",
  slug: "engineer",
  createdAt: new Date(),
  createdBy: "user-1",
};

const mockCompany = {
  id: "company-1",
  name: "Acme",
  slug: "acme",
  description: "Desc",
  industry: "TECHNOLOGY",
  website: "https://acme.com",
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock("@cooper/db/client", () => ({
  db: {
    query: {
      Role: {
        findMany: vi.fn(),
      },
      Company: {
        findMany: vi.fn(),
      },
      CompaniesToLocations: {
        findMany: vi.fn(),
      },
    },
    execute: vi.fn(),
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

describe("RoleAndCompany Router", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (auth as Mock).mockResolvedValue(null);
    vi.mocked(db.execute).mockResolvedValue({ rows: [] } as never);
    vi.mocked(db.query.Role.findMany).mockResolvedValue([]);
    vi.mocked(db.query.Company.findMany).mockResolvedValue([]);
    vi.mocked(db.query.CompaniesToLocations.findMany).mockResolvedValue([]);
  });

  const getCaller = async () => {
    const ctx = await createTRPCContext({
      session: null,
      headers: new Headers(),
    });
    return createCallerFactory(appRouter)(ctx);
  };

  test("list with sortBy rating uses execute for roles and companies", async () => {
    vi.mocked(db.execute)
      .mockResolvedValueOnce({
        rows: [{ ...mockRole, avg_rating: 4.5 }],
      } as never)
      .mockResolvedValueOnce({
        rows: [{ ...mockCompany, avg_rating: 4 }],
      } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);
    const caller = await getCaller();
    const result = await caller.roleAndCompany.list({
      sortBy: "rating",
      limit: 10,
      offset: 0,
    });
    expect(db.execute).toHaveBeenCalled();
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("totalCount");
    expect(result).toHaveProperty("totalRolesCount");
    expect(result).toHaveProperty("totalCompanyCount");
  });

  test("list with sortBy newest uses findMany for roles and companies", async () => {
    vi.mocked(db.execute)
      .mockResolvedValueOnce({ rows: [{ role_id: "role-1" }] } as never)
      .mockResolvedValueOnce({ rows: [{ company_id: "company-1" }] } as never);
    vi.mocked(db.query.Role.findMany).mockResolvedValue([mockRole as never]);
    vi.mocked(db.query.Company.findMany).mockResolvedValue([
      mockCompany as never,
    ]);
    vi.mocked(db.execute)
      .mockResolvedValueOnce({ rows: [{ role_id: "role-1" }] } as never)
      .mockResolvedValueOnce({ rows: [{ company_id: "company-1" }] } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "role-1", avg_hourly_pay: 25 }],
      } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "role-1", avg_rating: 4 }],
      } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "company-1", avg_hourly_pay: 25 }],
      } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "company-1", avg_rating: 4 }],
      } as never);
    const caller = await getCaller();
    const result = await caller.roleAndCompany.list({
      sortBy: "newest",
      limit: 10,
      offset: 0,
    });
    expect(db.query.Role.findMany).toHaveBeenCalled();
    expect(db.query.Company.findMany).toHaveBeenCalled();
    expect(result.items).toBeDefined();
  });

  test("list with type roles returns only roles", async () => {
    vi.mocked(db.execute)
      .mockResolvedValueOnce({ rows: [{ role_id: "role-1" }] } as never)
      .mockResolvedValueOnce({ rows: [{ company_id: "company-1" }] } as never);
    vi.mocked(db.query.Role.findMany).mockResolvedValue([
      { ...mockRole, companyId: "company-1" } as never,
    ]);
    vi.mocked(db.query.Company.findMany).mockResolvedValue([
      mockCompany as never,
    ]);
    vi.mocked(db.execute)
      .mockResolvedValueOnce({
        rows: [{ id: "role-1", avg_hourly_pay: 25 }],
      } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "role-1", avg_rating: 4 }],
      } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "company-1", avg_hourly_pay: 25 }],
      } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "company-1", avg_rating: 4 }],
      } as never);
    const caller = await getCaller();
    const result = await caller.roleAndCompany.list({
      type: "roles",
      limit: 10,
      offset: 0,
    });
    expect(result.items.every((i) => i.type === "role")).toBe(true);
  });

  test("list with filters applies industry and location", async () => {
    vi.mocked(db.execute)
      .mockResolvedValueOnce({ rows: [{ role_id: "role-1" }] } as never)
      .mockResolvedValueOnce({ rows: [{ company_id: "company-1" }] } as never);
    vi.mocked(db.query.Role.findMany).mockResolvedValue([
      { ...mockRole, companyId: "company-1" } as never,
    ]);
    vi.mocked(db.query.Company.findMany).mockResolvedValue([
      mockCompany as never,
    ]);
    vi.mocked(db.query.CompaniesToLocations.findMany).mockResolvedValue([
      { companyId: "company-1", locationId: "loc-1" },
    ] as never);
    vi.mocked(db.execute)
      .mockResolvedValueOnce({
        rows: [{ id: "role-1", avg_hourly_pay: 25 }],
      } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "role-1", avg_rating: 4 }],
      } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "company-1", avg_hourly_pay: 25 }],
      } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "company-1", avg_rating: 4 }],
      } as never);
    const caller = await getCaller();
    const result = await caller.roleAndCompany.list({
      filters: {
        industries: ["TECHNOLOGY"],
        locations: ["loc-1"],
      },
      limit: 10,
      offset: 0,
    });
    expect(result).toHaveProperty("items");
  });

  test("getPageNumber returns page for item", async () => {
    vi.mocked(db.execute)
      .mockResolvedValueOnce({ rows: [{ role_id: "role-1" }] } as never)
      .mockResolvedValueOnce({ rows: [{ company_id: "company-1" }] } as never);
    vi.mocked(db.query.Role.findMany).mockResolvedValue([
      { ...mockRole, companyId: "company-1" } as never,
    ]);
    vi.mocked(db.query.Company.findMany).mockResolvedValue([
      mockCompany as never,
    ]);
    vi.mocked(db.execute)
      .mockResolvedValueOnce({
        rows: [{ id: "role-1", avg_hourly_pay: 25 }],
      } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "role-1", avg_rating: 4 }],
      } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "company-1", avg_hourly_pay: 25 }],
      } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "company-1", avg_rating: 4 }],
      } as never);
    const caller = await getCaller();
    const result = await caller.roleAndCompany.getPageNumber({
      itemId: "role-1",
      itemType: "role",
      limit: 10,
    });
    expect(result).toHaveProperty("page");
    expect(result).toHaveProperty("found");
  });

  test("getPageNumber returns found false when item not in list", async () => {
    vi.mocked(db.execute).mockResolvedValue({ rows: [] } as never);
    vi.mocked(db.query.Role.findMany).mockResolvedValue([]);
    vi.mocked(db.query.Company.findMany).mockResolvedValue([]);
    const caller = await getCaller();
    const result = await caller.roleAndCompany.getPageNumber({
      itemId: "nonexistent",
      itemType: "role",
      limit: 10,
    });
    expect(result).toEqual({ page: 1, found: false });
  });
});
