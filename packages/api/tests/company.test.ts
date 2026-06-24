import { beforeEach, describe, expect, test, vi } from "vitest";

import { Status } from "@cooper/db/schema";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { chain, studentSession } from "./helpers";

const db = vi.hoisted(() => ({
  query: {
    Company: { findFirst: vi.fn(), findMany: vi.fn() },
    Review: { findMany: vi.fn() },
    Role: { findMany: vi.fn() },
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

describe("company router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getBySlug returns a non-hidden company by slug", async () => {
    const company = { id: "c1", slug: "acme", name: "Acme" };
    db.query.Company.findFirst.mockResolvedValue(company);

    const result = await (await caller()).company.getBySlug({ slug: "acme" });

    expect(result).toEqual(company);
    expect(db.query.Company.findFirst).toHaveBeenCalledOnce();
  });

  test("getById returns a non-hidden company by id", async () => {
    const company = { id: "c1", name: "Acme" };
    db.query.Company.findFirst.mockResolvedValue(company);

    const result = await (await caller()).company.getById({ id: "c1" });

    expect(result).toEqual(company);
  });

  test("getAverageById averages the published reviews", async () => {
    db.query.Review.findMany.mockResolvedValue([
      {
        status: Status.PUBLISHED,
        overallRating: 4,
        hourlyPay: "20",
        cultureRating: 5,
        supervisorRating: 3,
      },
      {
        status: Status.PUBLISHED,
        overallRating: 2,
        hourlyPay: "30",
        cultureRating: 3,
        supervisorRating: 5,
      },
    ]);

    const result = await (
      await caller()
    ).company.getAverageById({
      companyId: "c1",
    });

    expect(result).toEqual({
      averageOverallRating: 3,
      averageHourlyPay: 25,
      averageCultureRating: 4,
      averageSupervisorRating: 4,
    });
  });

  test("getAverageById returns zeros when there are no reviews", async () => {
    db.query.Review.findMany.mockResolvedValue([]);

    const result = await (
      await caller()
    ).company.getAverageById({
      companyId: "c1",
    });

    expect(result).toEqual({
      averageOverallRating: 0,
      averageHourlyPay: 0,
      averageCultureRating: 0,
      averageSupervisorRating: 0,
    });
  });

  test("createWithRole rejects profane company names", async () => {
    await expect(
      (await caller()).company.createWithRole({
        companyName: "Shit Company",
        description: "A perfectly fine description here",
        industry: "TECHNOLOGY",
        roleTitle: "Engineer",
        roleDescription: "A perfectly fine role description",
        createdBy: "profile-1",
      }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  test("createWithRole inserts a company and role and returns their ids", async () => {
    db.query.Company.findMany.mockResolvedValue([]);
    // Invoke the `where` callback so the role-slug scoping is exercised.
    db.query.Role.findMany.mockImplementation((args) => {
      args?.where?.({ companyId: "companyId" }, { eq: (a: unknown) => a });
      return Promise.resolve([]);
    });
    db.insert
      .mockReturnValueOnce(chain([{ id: "company-1" }]))
      .mockReturnValueOnce(chain([{ id: "role-1" }]));

    const result = await (
      await caller()
    ).company.createWithRole({
      companyName: "Acme Corp",
      description: "A perfectly fine description here",
      industry: "TECHNOLOGY",
      roleTitle: "Engineer",
      roleDescription: "A perfectly fine role description",
      createdBy: "profile-1",
    });

    expect(result).toEqual({ roleId: "role-1", companyId: "company-1" });
    expect(db.insert).toHaveBeenCalledTimes(2);
  });

  describe("list (rating/default sort)", () => {
    test("returns companies ordered by rating from the raw query", async () => {
      const rows = [
        { id: "c2", name: "Beta", description: "b", avg_rating: 5 },
        { id: "c1", name: "Acme", description: "a", avg_rating: 3 },
      ];
      db.execute.mockResolvedValue({ rows });

      const result = await (await caller()).company.list({});

      expect(db.execute).toHaveBeenCalledOnce();
      expect(result.map((c) => c.id)).toEqual(["c2", "c1"]);
    });

    test("applies industry and location filters", async () => {
      db.execute.mockResolvedValue({ rows: [{ id: "c1", name: "Acme" }] });

      const result = await (
        await caller()
      ).company.list({
        prefix: "Ac",
        options: { industry: "TECHNOLOGY", location: "loc-1" },
      });

      expect(db.execute).toHaveBeenCalledOnce();
      expect(result).toHaveLength(1);
    });

    test("adds a HAVING clause when showAll is false", async () => {
      db.execute.mockResolvedValue({ rows: [{ id: "c1", name: "Acme" }] });

      await (await caller()).company.list({ showAll: false });

      expect(db.execute).toHaveBeenCalledOnce();
    });

    test("respects the limit", async () => {
      db.execute.mockResolvedValue({
        rows: [
          { id: "c1", name: "A" },
          { id: "c2", name: "B" },
          { id: "c3", name: "C" },
        ],
      });

      const result = await (await caller()).company.list({ limit: 2 });

      expect(result).toHaveLength(2);
    });
  });

  describe("list (newest/oldest sort)", () => {
    test("queries companies via the ORM ordering branch", async () => {
      const companies = [
        { id: "c1", name: "Acme", description: "a" },
        { id: "c2", name: "Beta", description: "b" },
      ];
      db.query.Company.findMany.mockResolvedValue(companies);

      const result = await (await caller()).company.list({ sortBy: "newest" });

      expect(db.query.Company.findMany).toHaveBeenCalledOnce();
      expect(result).toEqual(companies);
    });

    test("applies industry and location conditions", async () => {
      db.query.Company.findMany.mockResolvedValue([{ id: "c1", name: "Acme" }]);

      await (
        await caller()
      ).company.list({
        sortBy: "oldest",
        prefix: "Ac",
        options: { industry: "TECHNOLOGY", location: "loc-1" },
      });

      expect(db.query.Company.findMany).toHaveBeenCalledOnce();
    });

    test("keeps only companies with reviews when showAll is false", async () => {
      db.query.Company.findMany.mockResolvedValue([
        { id: "c1", name: "Acme" },
        { id: "c2", name: "Beta" },
      ]);
      db.execute.mockResolvedValue({ rows: [{ company_id: "c1" }] });

      const result = await (
        await caller()
      ).company.list({
        sortBy: "newest",
        showAll: false,
      });

      expect(db.execute).toHaveBeenCalledOnce();
      expect(result.map((c) => c.id)).toEqual(["c1"]);
    });
  });

  describe("create", () => {
    test("generates a unique slug and defaults the website", async () => {
      db.query.Company.findMany.mockResolvedValue([{ slug: "acme" }]);
      db.insert.mockReturnValue(chain([{ id: "c1", slug: "acme-1" }]));

      const result = await (
        await caller()
      ).company.create({
        name: "Acme",
        description: "A description",
        industry: "TECHNOLOGY",
      });

      expect(db.insert).toHaveBeenCalledOnce();
      expect(result).toEqual([{ id: "c1", slug: "acme-1" }]);
    });
  });

  describe("createWithRole validation", () => {
    const validInput = {
      companyName: "Acme Corp",
      description: "A perfectly fine description here",
      industry: "TECHNOLOGY",
      roleTitle: "Engineer",
      roleDescription: "A perfectly fine role description",
      createdBy: "profile-1",
    };

    test("rejects a profane description", async () => {
      await expect(
        (await caller()).company.createWithRole({
          ...validInput,
          description: "This shit is broken and unusable",
        }),
      ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    });

    test("rejects a profane role title", async () => {
      await expect(
        (await caller()).company.createWithRole({
          ...validInput,
          roleTitle: "Shit Engineer",
        }),
      ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    });

    test("rejects a profane role description", async () => {
      await expect(
        (await caller()).company.createWithRole({
          ...validInput,
          roleDescription: "You will shovel shit all day every day",
        }),
      ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    });

    test("throws when the company insert returns no id", async () => {
      db.query.Company.findMany.mockResolvedValue([]);
      db.insert.mockReturnValueOnce(chain([]));

      await expect(
        (await caller()).company.createWithRole(validInput),
      ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    });

    test("throws when the role insert returns no id", async () => {
      db.query.Company.findMany.mockResolvedValue([]);
      db.query.Role.findMany.mockResolvedValue([]);
      db.insert
        .mockReturnValueOnce(chain([{ id: "company-1" }]))
        .mockReturnValueOnce(chain([]));

      await expect(
        (await caller()).company.createWithRole(validInput),
      ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    });
  });
});
