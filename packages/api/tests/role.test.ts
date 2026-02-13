import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Mock } from "vitest";

import type { Session } from "@cooper/auth";
import { auth } from "@cooper/auth";
import { eq } from "@cooper/db";
import { db } from "@cooper/db/client";
import { Role } from "@cooper/db/schema";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";

const mockRole = {
  id: "role-1",
  title: "Engineer",
  description: "Build things",
  companyId: "company-1",
  slug: "engineer",
  jobType: "CO-OP" as const,
  createdAt: new Date(),
  updatedAt: null as Date | null,
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
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      Company: {
        findFirst: vi.fn(),
      },
      Review: {
        findMany: vi.fn(),
      },
    },
    execute: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "user-1" },
    expires: "1",
  }),
}));

describe("Role Router", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (auth as Mock).mockResolvedValue({
      user: { id: "user-1" },
      expires: "1",
    });
    vi.mocked(db.query.Role.findFirst).mockResolvedValue(mockRole);
    vi.mocked(db.query.Role.findMany).mockResolvedValue([mockRole]);
    vi.mocked(db.query.Company.findFirst).mockResolvedValue(mockCompany);
    vi.mocked(db.query.Review.findMany).mockResolvedValue([]);
    vi.mocked(db.execute).mockResolvedValue({ rows: [] } as never);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockRole]),
      }),
    } as never);
  });

  const session: Session = { user: { id: "user-1" }, expires: "1" };

  const getCaller = async () => {
    const ctx = await createTRPCContext({
      session,
      headers: new Headers(),
    });
    return createCallerFactory(appRouter)(ctx);
  };

  test("getById returns role by id", async () => {
    const caller = await getCaller();
    await caller.role.getById({ id: "role-1" });
    expect(db.query.Role.findFirst).toHaveBeenCalledWith({
      where: eq(Role.id, "role-1"),
    });
  });

  test("getByCompanySlugAndRoleSlug returns role with company info", async () => {
    const caller = await getCaller();
    vi.mocked(db.query.Company.findFirst).mockResolvedValue(mockCompany);
    vi.mocked(db.query.Role.findFirst).mockResolvedValue(mockRole);
    const result = await caller.role.getByCompanySlugAndRoleSlug({
      companySlug: "acme",
      roleSlug: "engineer",
    });
    expect(result).toEqual({
      ...mockRole,
      companyName: "Acme",
      companySlug: "acme",
    });
  });

  test("getByCompanySlugAndRoleSlug returns null when company not found", async () => {
    const caller = await getCaller();
    vi.mocked(db.query.Company.findFirst).mockResolvedValue(undefined);
    const result = await caller.role.getByCompanySlugAndRoleSlug({
      companySlug: "nonexistent",
      roleSlug: "engineer",
    });
    expect(result).toBeNull();
  });

  test("getManyByIds returns roles", async () => {
    const caller = await getCaller();
    await caller.role.getManyByIds({ ids: ["role-1", "role-2"] });
    expect(db.query.Role.findMany).toHaveBeenCalledWith({
      where: expect.any(Function),
    });
  });

  test("getByCompany with onlyWithReviews uses execute", async () => {
    const caller = await getCaller();
    vi.mocked(db.execute).mockResolvedValue({
      rows: [{ role_id: "role-1" }],
    } as never);
    vi.mocked(db.query.Role.findMany).mockResolvedValue([mockRole]);
    await caller.role.getByCompany({
      companyId: "company-1",
      onlyWithReviews: true,
    });
    expect(db.execute).toHaveBeenCalled();
  });

  test("getByCompany without onlyWithReviews uses findMany", async () => {
    const caller = await getCaller();
    await caller.role.getByCompany({ companyId: "company-1" });
    expect(db.query.Role.findMany).toHaveBeenCalledWith({
      where: eq(Role.companyId, "company-1"),
    });
  });

  test("create inserts role with slug", async () => {
    const caller = await getCaller();
    vi.mocked(db.query.Role.findMany).mockResolvedValue([]);
    const result = await caller.role.create({
      title: "Engineer",
      description: "Build things",
      companyId: "company-1",
      createdBy: "user-1",
    });
    expect(db.insert).toHaveBeenCalledWith(Role);
    expect(result).toBeDefined();
  });

  test("create throws on profane title", async () => {
    const caller = await getCaller();
    await expect(
      caller.role.create({
        title: "shit",
        description: "Build things",
        companyId: "company-1",
        createdBy: "user-1",
      }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  test("getByCreatedBy returns roles", async () => {
    const caller = await getCaller();
    await caller.role.getByCreatedBy({ createdBy: "user-1" });
    expect(db.query.Role.findMany).toHaveBeenCalledWith({
      where: eq(Role.createdBy, "user-1"),
    });
  });

  test("getAverageById returns averages", async () => {
    const caller = await getCaller();
    vi.mocked(db.query.Review.findMany).mockResolvedValue([
      {
        id: "r1",
        roleId: "role-1",
        overallRating: 4,
        hourlyPay: "25",
        interviewDifficulty: 3,
        cultureRating: 4,
        supervisorRating: 4,
        interviewRating: 4,
        federalHolidays: true,
        drugTest: false,
        freeLunch: true,
        freeMerch: true,
        travelBenefits: false,
        snackBar: false,
        overtimeNormal: true,
        pto: true,
        workTerm: "SPRING",
        workYear: 2024,
        createdAt: new Date(),
        updatedAt: new Date(),
        workEnvironment: "REMOTE",
        interviewReview: "",
        reviewHeadline: "",
        textReview: "",
        locationId: null,
        otherBenefits: null,
        companyId: "c1",
        profileId: "p1",
      },
    ] as never);
    const result = await caller.role.getAverageById({ roleId: "role-1" });
    expect(result).toHaveProperty("averageOverallRating", 4);
    expect(result).toHaveProperty("averageHourlyPay");
  });
});
