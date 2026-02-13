import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Session } from "@cooper/auth";
import type { ReviewType } from "@cooper/db/schema";
import { and, eq, inArray } from "@cooper/db";
import { db } from "@cooper/db/client";
import { Company, Review } from "@cooper/db/schema";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { data } from "./mocks/review";

vi.mock("@cooper/db/client", () => ({
  db: {
    query: {
      Review: {
        findMany: vi.fn(),
      },
      Company: {
        findMany: vi.fn(),
      },
      CompaniesToLocations: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "1" },
    expires: "1",
  }),
}));

describe("Review Router", async () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(db.query.Review.findMany).mockResolvedValue(data as ReviewType[]);
  });

  const session: Session = {
    user: {
      id: "1",
    },
    expires: "1",
  };

  const ctx = await createTRPCContext({
    session,
    headers: new Headers(),
  });

  const caller = createCallerFactory(appRouter)(ctx);

  test("list endpoint returns all reviews", async () => {
    const reviews = await caller.review.list({});

    expect(reviews).toEqual(data);

    expect(db.query.Review.findMany).toHaveBeenCalledWith({
      orderBy: expect.anything(),
      where: undefined,
    });
  });

  test("list endpoint with cycle filter", async () => {
    await caller.review.list({
      options: {
        cycle: "SPRING",
      },
    });

    expect(db.query.Review.findMany).toHaveBeenCalledWith({
      orderBy: expect.anything(),
      where: and(eq(Review.workTerm, "SPRING")),
    });
  });

  test("list endpoint with term filter", async () => {
    await caller.review.list({
      options: {
        term: "REMOTE",
      },
    });

    expect(db.query.Review.findMany).toHaveBeenCalledWith({
      orderBy: expect.anything(),
      where: and(eq(Review.workEnvironment, "REMOTE")),
    });
  });

  test("list endpoint with cycle and term filter", async () => {
    await caller.review.list({
      options: {
        cycle: "SPRING",
        term: "REMOTE",
      },
    });

    expect(db.query.Review.findMany).toHaveBeenCalledWith({
      orderBy: expect.anything(),
      where: and(
        eq(Review.workTerm, "SPRING"),
        eq(Review.workEnvironment, "REMOTE"),
      ),
    });
  });

  test("getByRole endpoint returns reviews by role", async () => {
    const roleId = "role-123";
    await caller.review.getByRole({ id: roleId });

    expect(db.query.Review.findMany).toHaveBeenCalledWith({
      where: eq(Review.roleId, "role-123"),
    });
  });

  test("getByCompany endpoint returns reviews by company", async () => {
    const companyId = "company-123";
    await caller.review.getByCompany({ id: companyId });

    expect(db.query.Review.findMany).toHaveBeenCalledWith({
      where: eq(Review.companyId, "company-123"),
    });
  });

  test("getByProfile endpoint returns reviews by profile", async () => {
    const profileId = "profile-123";
    await caller.review.getByProfile({ id: profileId });

    expect(db.query.Review.findMany).toHaveBeenCalledWith({
      where: eq(Review.profileId, "profile-123"),
    });
  });

  test("get average by industry", async () => {
    vi.resetAllMocks();
    const mockHeaders = new Headers();
    const mockResponse = {
      headers: mockHeaders,
    } as unknown as Response;

    const ctxWithRes = await createTRPCContext({
      session,
      headers: new Headers(),
      res: mockResponse,
    });

    const callerWithRes = createCallerFactory(appRouter)(ctxWithRes);

    vi.mocked(db.query.Company.findMany).mockResolvedValue([
      {
        id: "1",
        industry: "Technology",
        name: "Company 1",
        description: "Description 1",
        website: "https://company1.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "company-1",
      },
      {
        id: "2",
        industry: "Manufacturing",
        name: "Company 2",
        description: "Description 2",
        website: "https://company2.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "company-2",
      },
      {
        id: "3",
        industry: "Technology",
        name: "Company 3",
        description: "Description 3",
        website: "https://company3.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "company-3",
      },
      {
        id: "4",
        industry: "Manufacturing",
        name: "Company 4",
        description: "Description 4",
        website: "https://company4.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "company-4",
      },
    ]);

    vi.mocked(db.query.Review.findMany).mockResolvedValue([
      {
        id: "1",
        companyId: "1",
        overallRating: 4,
        hourlyPay: "25",
        interviewDifficulty: 3,
        cultureRating: 5,
        supervisorRating: 4,
        interviewRating: 4,
        federalHolidays: true,
        drugTest: false,
        freeLunch: true,
        freeMerch: true,
        travelBenefits: false,
        snackBar: false,
        overtimeNormal: true,
        jobType: "Co-op",
        pto: true,
        workTerm: "SPRING",
        workYear: 2024,
        createdAt: new Date(),
        updatedAt: new Date(),
        workEnvironment: "REMOTE",
        interviewReview: "Good",
        reviewHeadline: "Good",
        textReview: "Good",
        locationId: "1",
        otherBenefits: "Good",
        roleId: "1",
        profileId: "1",
      },
      {
        id: "2",
        companyId: "3",
        overallRating: 2,
        hourlyPay: "15",
        interviewDifficulty: 2,
        cultureRating: 3,
        supervisorRating: 2,
        interviewRating: 3,
        federalHolidays: false,
        drugTest: true,
        jobType: "Co-op",
        freeLunch: false,
        freeMerch: true,
        travelBenefits: true,
        snackBar: false,
        overtimeNormal: false,
        pto: false,
        workTerm: "SPRING",
        workYear: 2024,
        createdAt: new Date(),
        updatedAt: new Date(),
        workEnvironment: "REMOTE",
        interviewReview: "Good",
        reviewHeadline: "Good",
        textReview: "Good",
        locationId: "1",
        otherBenefits: "Good",
        roleId: "1",
        profileId: "1",
      },
    ]);

    const result = await callerWithRes.review.getAverageByIndustry({
      industry: "Technology",
    });

    expect(db.query.Company.findMany).toHaveBeenCalledWith({
      where: eq(Company.industry, "Technology"),
    });

    const companies = await ctx.db.query.Company.findMany({
      where: eq(Company.industry, "Technology"),
    });

    const companyIds = companies.map((company) => company.id);

    expect(db.query.Review.findMany).toHaveBeenCalledWith({
      where: inArray(Review.companyId, companyIds),
    });

    expect(result).toEqual({
      averageOverallRating: 3,
      averageHourlyPay: 20,
      averageInterviewDifficulty: 2.5,
      averageCultureRating: 4,
      averageSupervisorRating: 3,
      averageInterviewRating: 3.5,
      federalHolidays: 0.5,
      drugTest: 0.5,
      freeLunch: 0.5,
      freeMerch: 1,
      travelBenefits: 0.5,
      overtimeNormal: 0.5,
      pto: 0.5,
      minPay: 15,
      maxPay: 25,
    });
  });

  const validCreateInput = {
    profileId: "user-1",
    roleId: "r1",
    companyId: "c1",
    workTerm: "SPRING" as const,
    workYear: 2024,
    overallRating: 4,
    cultureRating: 4,
    supervisorRating: 4,
    interviewRating: 4,
    interviewDifficulty: 3,
    textReview: "Good review text here",
    workEnvironment: "REMOTE" as const,
    drugTest: false,
    overtimeNormal: true,
    pto: true,
    federalHolidays: true,
    freeLunch: true,
    travelBenefits: false,
    freeMerch: true,
    snackBar: false,
  };

  test("list with search uses Fuse and returns filtered reviews", async () => {
    const reviewsWithHeadline = [
      {
        ...data[0],
        reviewHeadline: "Great experience",
        textReview: "Good",
        location: "Boston",
      },
      {
        ...data[1],
        reviewHeadline: "Average",
        textReview: "Okay",
        location: "NYC",
      },
    ];
    vi.mocked(db.query.Review.findMany).mockResolvedValue(
      reviewsWithHeadline as unknown as ReviewType[],
    );
    const result = await caller.review.list({ search: "Great" });
    expect(db.query.Review.findMany).toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
  });

  test("create throws when profileId falsy", async () => {
    await expect(
      caller.review.create({ ...validCreateInput, profileId: "" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  test("create throws when text contains profanity", async () => {
    vi.mocked(db.query.Review.findMany).mockResolvedValue([]);
    await expect(
      caller.review.create({ ...validCreateInput, textReview: "This is shit" }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  test("create throws when user has 5 or more reviews", async () => {
    vi.mocked(db.query.Review.findMany).mockResolvedValue(
      Array(5).fill(data[0]) as unknown as ReviewType[],
    );
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue([{ id: "new" }]),
    } as never);
    await expect(caller.review.create(validCreateInput)).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
  });

  test("create inserts review when valid", async () => {
    vi.mocked(db.query.Review.findMany).mockResolvedValue([]);
    vi.mocked(db.query.CompaniesToLocations.findFirst).mockResolvedValue(
      undefined,
    );
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue([{ id: "new-review" }]),
    } as never);
    const result = await caller.review.create(validCreateInput);
    expect(db.insert).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  test("delete deletes review by id", async () => {
    const where = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.delete).mockReturnValue({ where } as never);
    await caller.review.delete("review-123");
    expect(db.delete).toHaveBeenCalledWith(Review);
    expect(where).toHaveBeenCalledWith(eq(Review.id, "review-123"));
  });
});
