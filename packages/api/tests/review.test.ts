/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
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
    },
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: vi.fn(),
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
      },
      {
        id: "2",
        industry: "Manufacturing",
        name: "Company 2",
        description: "Description 2",
        website: "https://company2.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        industry: "Technology",
        name: "Company 3",
        description: "Description 3",
        website: "https://company3.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "4",
        industry: "Manufacturing",
        name: "Company 4",
        description: "Description 4",
        website: "https://company4.com",
        createdAt: new Date(),
        updatedAt: new Date(),
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
        freeTransport: false,
        overtimeNormal: true,
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
        freeLunch: false,
        freeMerch: true,
        freeTransport: true,
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
      freeTransportation: 0.5,
      overtimeNormal: 0.5,
      pto: 0.5,
      minPay: 15,
      maxPay: 25,
    });
  });
});
