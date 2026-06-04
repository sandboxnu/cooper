import { beforeEach, describe, expect, test, vi } from "vitest";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { chain, studentSession } from "./helpers";

const db = vi.hoisted(() => ({
  query: {
    Review: { findMany: vi.fn(), findFirst: vi.fn() },
    Company: { findMany: vi.fn() },
  },
  delete: vi.fn(),
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

describe("review router (read + aggregate endpoints)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getByRole queries published reviews for a role", async () => {
    db.query.Review.findMany.mockResolvedValue([{ id: "rev1" }]);
    const result = await (await caller()).review.getByRole({ id: "r1" });
    expect(result).toEqual([{ id: "rev1" }]);
  });

  test("getByCompany queries published reviews for a company", async () => {
    db.query.Review.findMany.mockResolvedValue([{ id: "rev1" }]);
    const result = await (await caller()).review.getByCompany({ id: "c1" });
    expect(result).toEqual([{ id: "rev1" }]);
  });

  test("getByProfile queries non-hidden reviews for a profile", async () => {
    db.query.Review.findMany.mockResolvedValue([{ id: "rev1" }]);
    const result = await (await caller()).review.getByProfile({ id: "p1" });
    expect(result).toEqual([{ id: "rev1" }]);
  });

  test("getById fetches a single review with relations", async () => {
    db.query.Review.findFirst.mockResolvedValue({ id: "rev1" });
    const result = await (await caller()).review.getById({ id: "rev1" });
    expect(result).toEqual({ id: "rev1" });
  });

  test("delete removes a review by id", async () => {
    const deleteChain = chain([{ id: "rev1" }]);
    db.delete.mockReturnValue(deleteChain);
    await (await caller()).review.delete("rev1");
    expect(db.delete).toHaveBeenCalledOnce();
    expect(deleteChain.where).toHaveBeenCalledOnce();
  });

  test("getPayDataGlobal computes average pay and a distribution", async () => {
    db.query.Review.findMany.mockResolvedValue([
      { hourlyPay: "20" },
      { hourlyPay: "30" },
      { hourlyPay: "0" }, // excluded — not > 0
    ]);
    const result = await (await caller()).review.getPayDataGlobal();
    expect(result.totalReviews).toBe(2);
    expect(result.averageHourlyPay).toBe(25);
    const bucket2030 = result.payDistribution.find((b) => b.label === "$20-30");
    expect(bucket2030?.count).toBe(1);
  });

  test("getPayDataByIndustry filters by the industry's companies", async () => {
    db.query.Company.findMany.mockResolvedValue([{ id: "c1" }]);
    db.query.Review.findMany.mockResolvedValue([{ hourlyPay: "40" }]);
    const result = await (
      await caller()
    ).review.getPayDataByIndustry({ industry: "TECHNOLOGY" });
    expect(result.totalReviews).toBe(1);
    expect(result.averageHourlyPay).toBe(40);
  });

  test("getInterviewDataGlobal reports the rounds mode and distribution", async () => {
    db.query.Review.findMany.mockResolvedValue([
      { interviewRounds: [{}, {}] },
      { interviewRounds: [{}, {}] },
      { interviewRounds: [{}, {}, {}] },
      { interviewRounds: [] }, // excluded — no rounds
    ]);
    const result = await (await caller()).review.getInterviewDataGlobal();
    expect(result.roundsMode).toBe(2);
    expect(result.roundsDistribution).toEqual([
      { rounds: 2, count: 2 },
      { rounds: 3, count: 1 },
    ]);
  });

  test("getInterviewDataByIndustry aggregates rounds across the industry", async () => {
    db.query.Company.findMany.mockResolvedValue([{ id: "c1" }]);
    db.query.Review.findMany.mockResolvedValue([
      { interviewRounds: [{}, {}] },
      { interviewRounds: [{}, {}] },
    ]);
    const result = await (
      await caller()
    ).review.getInterviewDataByIndustry({ industry: "TECHNOLOGY" });
    expect(result.roundsMode).toBe(2);
  });
});
