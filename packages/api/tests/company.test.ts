import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Session } from "@cooper/auth";
import { auth } from "@cooper/auth";
import type { CompanyType, ReviewType } from "@cooper/db/schema";
import { and, eq, inArray } from "@cooper/db";
import { db } from "@cooper/db/client";
import { Company, Review, Role } from "@cooper/db/schema";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { data } from "./mocks/review";

const chain: any = {
  from: vi.fn(() => chain),
  innerJoin: vi.fn(() => chain),
  where: vi.fn(() => chain),
};

const mockCompanyRows = [
  {
    id: "c1",
    name: "Acme",
    slug: "acme",
    description: "Desc",
    industry: "TECHNOLOGY",
    website: "https://acme.com",
    createdAt: new Date(),
    updatedAt: new Date(),
    avg_rating: 4.5,
  },
];

vi.mock("@cooper/db/client", () => ({
  db: {
    select: vi.fn(() => chain),
    execute: vi.fn(),
    query: {
      Review: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      Company: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      Role: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "1" },
    expires: "1",
  }),
}));

describe("Company Router", async () => {
  const session: Session = {
    user: {
      id: "1",
    },
    expires: "1",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(auth).mockResolvedValue(session);
    vi.mocked(db.query.Review.findMany).mockResolvedValue(data as ReviewType[]);
    vi.mocked(db.execute).mockResolvedValue({ rows: mockCompanyRows } as never);
    vi.mocked(db.query.Company.findMany).mockResolvedValue(
      mockCompanyRows as unknown as CompanyType[],
    );
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "new-id" }]),
      }),
    } as never);
  });

  const ctx = await createTRPCContext({
    session,
    headers: new Headers(),
  });

  const caller = createCallerFactory(appRouter)(ctx);

  test("list with sortBy rating uses execute and returns companies", async () => {
    const result = await caller.company.list({ sortBy: "rating" });
    expect(db.execute).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test("list with sortBy newest uses findMany", async () => {
    await caller.company.list({ sortBy: "newest" });
    expect(db.query.Company.findMany).toHaveBeenCalledWith({
      orderBy: expect.anything(),
      where: expect.anything(),
    });
  });

  test("list with options industry and location uses execute when sortBy rating", async () => {
    await caller.company.list({
      sortBy: "rating",
      options: { industry: "TECHNOLOGY", location: "loc-1" },
    });
    expect(db.execute).toHaveBeenCalled();
  });

  test("getBySlug returns company by slug", async () => {
    vi.mocked(db.query.Company.findFirst).mockResolvedValue(
      mockCompanyRows[0] as unknown as CompanyType,
    );
    await caller.company.getBySlug({ slug: "acme" });
    expect(db.query.Company.findFirst).toHaveBeenCalledWith({
      where: eq(Company.slug, "acme"),
    });
  });

  test("create inserts company with unique slug", async () => {
    vi.mocked(db.query.Company.findMany).mockResolvedValue([]);
    const result = await caller.company.create({
      name: "NewCo",
      description: "A new company",
      industry: "TECHNOLOGY",
    });
    expect(db.insert).toHaveBeenCalledWith(Company);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test("createWithRole creates company and role and returns roleId", async () => {
    const insertCompanyReturn = {
      returning: vi.fn().mockResolvedValue([{ id: "company-1" }]),
    };
    const insertRoleReturn = {
      returning: vi.fn().mockResolvedValue([{ id: "role-1" }]),
    };
    vi.mocked(db.insert)
      .mockReturnValueOnce({
        values: vi.fn().mockReturnValue(insertCompanyReturn),
      } as never)
      .mockReturnValueOnce({
        values: vi.fn().mockReturnValue(insertRoleReturn),
      } as never);
    vi.mocked(db.query.Company.findMany).mockResolvedValue([]);
    vi.mocked(db.query.Role.findMany).mockResolvedValue([]);

    const result = await caller.company.createWithRole({
      companyName: "Clean Co",
      description: "A clean company description here",
      industry: "TECHNOLOGY",
      roleTitle: "Engineer",
      roleDescription: "You build things and write code here",
      createdBy: "user-1",
    });
    expect(result).toBe("role-1");
    expect(db.insert).toHaveBeenCalledTimes(2);
  });

  test("createWithRole throws on profane company name", async () => {
    await expect(
      caller.company.createWithRole({
        companyName: "shit",
        description: "A clean company description here",
        industry: "TECHNOLOGY",
        roleTitle: "Engineer",
        roleDescription: "You build things and write code here",
        createdBy: "user-1",
      }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  test("getById endpoint returns company by id", async () => {
    const companyId = "123";
    await caller.company.getById({ id: companyId });

    expect(db.query.Company.findFirst).toHaveBeenCalledWith({
      where: eq(Company.id, "123"),
    });
  });

  // test("getLocationsById endpoint returns locations by company id", async () => {
  //   const companyId = "123";
  //   await caller.company.getLocationsById({ id: companyId });

  //   expect(db.query.Company.findFirst).toHaveBeenCalledWith({
  //     where: eq(Company.id, "123"),
  //   });
  // })

  test("getAverageById endpoint returns average ratings by company id", async () => {
    const companyId = "123";
    await caller.company.getAverageById({ companyId });

    expect(db.query.Review.findMany).toHaveBeenCalledWith({
      where: eq(Review.companyId, companyId),
    });
  });
});
