import { beforeEach, describe, expect, test, vi } from "vitest";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { studentSession } from "./helpers";

const db = vi.hoisted(() => ({
  query: {
    Role: { findFirst: vi.fn(), findMany: vi.fn() },
    Company: { findFirst: vi.fn(), findMany: vi.fn() },
    Review: { findMany: vi.fn() },
  },
  execute: vi.fn(),
}));

vi.mock("@cooper/db/client", () => ({ db }));
vi.mock("@cooper/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

async function callList(input: Record<string, unknown>) {
  const ctx = await createTRPCContext({
    session: studentSession,
    headers: new Headers(),
  });
  return createCallerFactory(appRouter)(ctx).role.list(input);
}

describe("role router additional coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("list returns empty when no roles have reviews", async () => {
    db.execute.mockResolvedValue({ rows: [] });
    db.query.Company.findMany.mockResolvedValue([]);

    const result = await callList({});

    expect(result).toEqual({ roles: [], totalCount: 0 });
  });

  test("list joins roles with their companies and paginates", async () => {
    db.execute.mockResolvedValue({
      rows: [{ role_id: "r1" }, { role_id: "r2" }],
    });
    db.query.Role.findMany.mockResolvedValue([
      {
        id: "r1",
        companyId: "c1",
        title: "Software Engineer",
        description: "",
      },
      { id: "r2", companyId: "c2", title: "Data Analyst", description: "" },
    ]);
    db.query.Company.findMany.mockResolvedValue([{ id: "c1", name: "Acme" }]);

    const result = await callList({ limit: 1, offset: 0 });

    expect(result.totalCount).toBe(2);
    expect(result.roles).toHaveLength(1);
    expect(result.roles[0]).toMatchObject({ companyName: "Acme" });
  });

  test("list with sortBy rating uses the avg-rating query", async () => {
    db.execute.mockResolvedValue({
      rows: [{ id: "r1", companyId: "c1", title: "SWE", avg_rating: 5 }],
    });
    db.query.Company.findMany.mockResolvedValue([{ id: "c1", name: "Acme" }]);

    const ctx = await createTRPCContext({
      session: studentSession,
      headers: new Headers(),
    });
    const result = await createCallerFactory(appRouter)(ctx).role.list({
      sortBy: "rating",
    } as never);

    expect(result.totalCount).toBe(1);
    expect(db.execute).toHaveBeenCalledOnce();
  });

  test("create rejects a profane description", async () => {
    await expect(
      callerCreate({
        title: "Software Engineer",
        description: "this shit role",
        companyId: "c1",
        createdBy: "p1",
      }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  test("getByCompany returns all non-hidden roles by default", async () => {
    db.query.Role.findMany.mockResolvedValue([{ id: "r1" }]);

    const ctx = await createTRPCContext({
      session: studentSession,
      headers: new Headers(),
    });
    const result = await createCallerFactory(appRouter)(ctx).role.getByCompany({
      companyId: "c1",
    });

    expect(result).toEqual([{ id: "r1" }]);
  });

  test("getByCompany with onlyWithReviews returns [] when none have reviews", async () => {
    db.execute.mockResolvedValue({ rows: [] });

    const ctx = await createTRPCContext({
      session: studentSession,
      headers: new Headers(),
    });
    const result = await createCallerFactory(appRouter)(ctx).role.getByCompany({
      companyId: "c1",
      onlyWithReviews: true,
    });

    expect(result).toEqual([]);
  });

  test("getByCompany with onlyWithReviews queries roles that have reviews", async () => {
    db.execute.mockResolvedValue({ rows: [{ role_id: "r1" }] });
    db.query.Role.findMany.mockResolvedValue([{ id: "r1" }]);

    const ctx = await createTRPCContext({
      session: studentSession,
      headers: new Headers(),
    });
    const result = await createCallerFactory(appRouter)(ctx).role.getByCompany({
      companyId: "c1",
      onlyWithReviews: true,
    });

    expect(result).toEqual([{ id: "r1" }]);
  });

  test("getByCreatedBy queries non-hidden roles for a profile", async () => {
    db.query.Role.findMany.mockResolvedValue([{ id: "r1" }]);

    const ctx = await createTRPCContext({
      session: studentSession,
      headers: new Headers(),
    });
    const result = await createCallerFactory(appRouter)(
      ctx,
    ).role.getByCreatedBy({ createdBy: "p1" });

    expect(result).toEqual([{ id: "r1" }]);
  });

  test("getInterviewDataById aggregates round counts, types and difficulty", async () => {
    db.query.Review.findMany.mockResolvedValue([
      {
        id: "rev1",
        companyId: "c1",
        interviewRounds: [
          { interviewType: "technical", interviewDifficulty: "hard" },
          { interviewType: "behavioral", interviewDifficulty: "easy" },
        ],
      },
      {
        id: "rev2",
        companyId: "c1",
        interviewRounds: [
          { interviewType: "technical", interviewDifficulty: "hard" },
        ],
      },
      { id: "rev3", companyId: "c1", interviewRounds: [] }, // excluded
    ]);
    db.query.Company.findFirst.mockResolvedValue({ industry: "TECHNOLOGY" });

    const ctx = await createTRPCContext({
      session: studentSession,
      headers: new Headers(),
    });
    const result = await createCallerFactory(appRouter)(
      ctx,
    ).role.getInterviewDataById({ roleId: "r1" });

    expect(result.totalReviewsWithRounds).toBe(2);
    expect(result.industryName).toBe("TECHNOLOGY");
    expect(result.overallDominantDifficulty).toBe("hard");
    const technical = result.types.find((t) => t.type === "technical");
    expect(technical?.reviewCount).toBe(2);
    expect(technical?.dominantDifficulty).toBe("hard");
  });

  test("getInterviewDataById returns nulls when there are no reviews", async () => {
    db.query.Review.findMany.mockResolvedValue([]);

    const ctx = await createTRPCContext({
      session: studentSession,
      headers: new Headers(),
    });
    const result = await createCallerFactory(appRouter)(
      ctx,
    ).role.getInterviewDataById({ roleId: "r1" });

    expect(result.totalReviewsWithRounds).toBe(0);
    expect(result.roundsMode).toBeNull();
    expect(result.industryName).toBeNull();
    expect(result.overallDominantDifficulty).toBeNull();
  });

  test("getAverageById reports a two-way work environment tie", async () => {
    db.query.Review.findMany.mockResolvedValue([
      { workEnvironment: "REMOTE", reviewsToTools: [] },
      { workEnvironment: "HYBRID", reviewsToTools: [] },
    ]);

    const ctx = await createTRPCContext({
      session: studentSession,
      headers: new Headers(),
    });
    const result = await createCallerFactory(appRouter)(
      ctx,
    ).role.getAverageById({ roleId: "r1" });

    expect(result.workEnvironmentMode).toBe("Remote and Hybrid");
  });

  test("getAverageById reports a three-way tie and alert breakdown", async () => {
    db.query.Review.findMany.mockResolvedValue([
      { workEnvironment: "REMOTE", reviewsToTools: [] },
      { workEnvironment: "HYBRID", reviewsToTools: [] },
      { workEnvironment: "INPERSON", reviewsToTools: [] },
    ]);

    const ctx = await createTRPCContext({
      session: studentSession,
      headers: new Headers(),
    });
    const result = await createCallerFactory(appRouter)(
      ctx,
    ).role.getAverageById({ roleId: "r1" });

    expect(result.workEnvironmentMode).toBe("Remote, Hybrid, and In-Person");
    expect(result.workEnvironmentAlerts).toEqual([]);
  });

  test("getAverageById surfaces minority work environments as alerts", async () => {
    db.query.Review.findMany.mockResolvedValue([
      { workEnvironment: "REMOTE", reviewsToTools: [] },
      { workEnvironment: "REMOTE", reviewsToTools: [] },
      { workEnvironment: "HYBRID", reviewsToTools: [] },
    ]);

    const ctx = await createTRPCContext({
      session: studentSession,
      headers: new Headers(),
    });
    const result = await createCallerFactory(appRouter)(
      ctx,
    ).role.getAverageById({ roleId: "r1" });

    expect(result.workEnvironmentMode).toBe("Remote");
    expect(result.workEnvironmentAlerts).toEqual(["One reported Hybrid"]);
  });
});

async function callerCreate(input: Record<string, unknown>) {
  const ctx = await createTRPCContext({
    session: studentSession,
    headers: new Headers(),
  });
  return createCallerFactory(appRouter)(ctx).role.create(input as never);
}
