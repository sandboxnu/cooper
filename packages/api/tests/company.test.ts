import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Session } from "@cooper/auth";
import type { CompanyType, ReviewType } from "@cooper/db/schema";
import { and, eq, inArray } from "@cooper/db";
import { db } from "@cooper/db/client";
import { Company, Review } from "@cooper/db/schema";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { data } from "./mocks/review";

const chain: any = {
  from: vi.fn(() => chain),
  innerJoin: vi.fn(() => chain),
  where: vi.fn(() => chain),
};

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
    },
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: vi.fn(),
}));

describe("Company Router", async () => {
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

  // test("list endpoint returns companies", async () => {
  //   const companies = await caller.company.list({});

  //   expect(companies).toEqual(data);

  //   expect(db.query.Company.findMany).toHaveBeenCalledWith({
  //     orderBy: expect.anything(),
  //     where: undefined,
  //   });
  // })

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
      where: eq(Review.companyId, companyId)
    });
  });
});
