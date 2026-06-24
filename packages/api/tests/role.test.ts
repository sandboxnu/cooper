import { beforeEach, describe, expect, test, vi } from "vitest";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { chain, studentSession } from "./helpers";

const db = vi.hoisted(() => ({
  query: {
    Role: { findFirst: vi.fn(), findMany: vi.fn() },
    Company: { findFirst: vi.fn(), findMany: vi.fn() },
    Review: { findMany: vi.fn() },
  },
  insert: vi.fn(),
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

describe("role router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getById returns a role by id", async () => {
    db.query.Role.findFirst.mockResolvedValue({ id: "r1", title: "SWE" });
    const result = await (await caller()).role.getById({ id: "r1" });
    expect(result).toEqual({ id: "r1", title: "SWE" });
  });

  test("getByIdWithCompany returns null when the role is missing", async () => {
    db.query.Role.findFirst.mockResolvedValue(undefined);
    const result = await (await caller()).role.getByIdWithCompany({ id: "r1" });
    expect(result).toBeNull();
  });

  test("getByIdWithCompany merges company name and slug", async () => {
    db.query.Role.findFirst.mockResolvedValue({
      id: "r1",
      title: "SWE",
      companyId: "c1",
    });
    db.query.Company.findFirst.mockResolvedValue({
      name: "Acme",
      slug: "acme",
    });
    const result = await (await caller()).role.getByIdWithCompany({ id: "r1" });
    expect(result).toMatchObject({
      id: "r1",
      type: "role",
      companyName: "Acme",
      companySlug: "acme",
    });
  });

  test("getByCompanySlugAndRoleSlug returns null when the company is missing", async () => {
    db.query.Company.findFirst.mockResolvedValue(undefined);
    const result = await (
      await caller()
    ).role.getByCompanySlugAndRoleSlug({
      companySlug: "acme",
      roleSlug: "swe",
    });
    expect(result).toBeNull();
  });

  test("getByCompanySlugAndRoleSlug returns the role with company info", async () => {
    db.query.Company.findFirst.mockResolvedValue({
      id: "c1",
      name: "Acme",
      slug: "acme",
    });
    db.query.Role.findFirst.mockResolvedValue({ id: "r1", title: "SWE" });
    const result = await (
      await caller()
    ).role.getByCompanySlugAndRoleSlug({
      companySlug: "acme",
      roleSlug: "swe",
    });
    expect(result).toMatchObject({
      id: "r1",
      companyName: "Acme",
      companySlug: "acme",
    });
  });

  test("getManyByIds queries the requested ids", async () => {
    db.query.Role.findMany.mockResolvedValue([{ id: "r1" }, { id: "r2" }]);
    const result = await (
      await caller()
    ).role.getManyByIds({
      ids: ["r1", "r2"],
    });
    expect(result).toHaveLength(2);
  });

  test("create rejects profane titles", async () => {
    await expect(
      (await caller()).role.create({
        title: "Shit Engineer",
        description: "A normal role description",
        companyId: "c1",
        createdBy: "p1",
      }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  test("create inserts a slugged role when the input is clean", async () => {
    db.query.Role.findMany.mockResolvedValue([]);
    const insertChain = chain([{ id: "r1" }]);
    db.insert.mockReturnValue(insertChain);

    await (
      await caller()
    ).role.create({
      title: "Software Engineer",
      description: "A normal role description",
      companyId: "c1",
      createdBy: "p1",
    });

    expect(db.insert).toHaveBeenCalledOnce();
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ slug: expect.any(String) }),
    );
  });

  test("getAverageById returns zeros for a role with no reviews", async () => {
    db.query.Review.findMany.mockResolvedValue([]);
    const result = await (await caller()).role.getAverageById({ roleId: "r1" });
    expect(result.totalReviews).toBe(0);
    expect(result.averageOverallRating).toBe(0);
    expect(result.tools).toEqual([]);
    expect(result.workEnvironmentMode).toBeNull();
  });

  test("getAverageById aggregates ratings, percentages, and work model", async () => {
    db.query.Review.findMany.mockResolvedValue([
      {
        overallRating: 4,
        hourlyPay: "20",
        cultureRating: 5,
        supervisorRating: 4,
        federalHolidays: true,
        pto: true,
        workEnvironment: "REMOTE",
        jobLength: 4,
        workHours: 40,
        overtimeNormal: true,
        reviewsToTools: [{ tool: { name: "React" } }],
      },
      {
        overallRating: 2,
        hourlyPay: "30",
        cultureRating: 3,
        supervisorRating: 2,
        federalHolidays: false,
        pto: true,
        workEnvironment: "REMOTE",
        jobLength: 6,
        workHours: 35,
        overtimeNormal: false,
        reviewsToTools: [{ tool: { name: "Figma" } }],
      },
    ]);

    const result = await (await caller()).role.getAverageById({ roleId: "r1" });

    expect(result.totalReviews).toBe(2);
    expect(result.averageOverallRating).toBe(3);
    expect(result.averageHourlyPay).toBe(25);
    expect(result.pto).toBe(1);
    expect(result.federalHolidays).toBe(0.5);
    expect(result.minPay).toBe(20);
    expect(result.maxPay).toBe(30);
    expect(result.workEnvironmentMode).toBe("Remote");
    expect(result.jobLengthMin).toBe(4);
    expect(result.jobLengthMax).toBe(6);
    expect(result.tools.sort()).toEqual(["Figma", "React"]);
  });
});
