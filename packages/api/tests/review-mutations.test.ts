import { beforeEach, describe, expect, test, vi } from "vitest";

import { Status } from "@cooper/db/schema";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { chain, studentSession } from "./helpers";

const db = vi.hoisted(() => ({
  query: {
    Review: { findMany: vi.fn(), findFirst: vi.fn() },
    Company: { findMany: vi.fn() },
    CompaniesToLocations: { findFirst: vi.fn() },
  },
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  select: vi.fn(),
}));

vi.mock("@cooper/db/client", () => ({ db }));
vi.mock("@cooper/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

async function caller(res?: Response) {
  const ctx = await createTRPCContext({
    session: studentSession,
    headers: new Headers(),
    res,
  });
  return createCallerFactory(appRouter)(ctx);
}

const baseReviewInput = {
  profileId: "p1",
  status: Status.PUBLISHED,
  companyId: "c1",
  locationId: "l1",
  roleId: "r1",
  textReview: "A perfectly clean review",
  workTerm: "SPRING" as const,
  workYear: 2024,
  overallRating: 4,
  cultureRating: 4,
  supervisorRating: 4,
  hourlyPay: "25",
};

describe("review router mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("list applies fuzzy search over the fetched reviews", async () => {
    db.query.Review.findMany.mockResolvedValue([
      { id: "1", reviewHeadline: "Amazing internship", textReview: "" },
      { id: "2", reviewHeadline: "Terrible time", textReview: "" },
    ]);

    const result = await (await caller()).review.list({ search: "Amazing" });

    expect(result).toEqual([
      { id: "1", reviewHeadline: "Amazing internship", textReview: "" },
    ]);
  });

  test("create rejects when there is no profileId", async () => {
    await expect(
      (await caller()).review.create({
        ...baseReviewInput,
        profileId: "",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  test("create rejects profane review text", async () => {
    await expect(
      (await caller()).review.create({
        ...baseReviewInput,
        textReview: "this is shit",
      }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  test("create rejects a 6th published review", async () => {
    db.query.Review.findMany.mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        status: Status.PUBLISHED,
        workTerm: "FALL",
        workYear: 2020,
      })),
    );

    await expect(
      (await caller()).review.create(baseReviewInput as never),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  test("create rejects a 3rd review in the same cycle", async () => {
    db.query.Review.findMany.mockResolvedValue([
      { id: "a", status: Status.DRAFT, workTerm: "SPRING", workYear: 2024 },
      { id: "b", status: Status.DRAFT, workTerm: "SPRING", workYear: 2024 },
    ]);

    await expect(
      (await caller()).review.create(baseReviewInput as never),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  test("create inserts the review, rounds, location link and a new tool", async () => {
    db.query.Review.findMany.mockResolvedValue([]);
    db.query.CompaniesToLocations.findFirst.mockResolvedValue(undefined);
    db.insert.mockReturnValue(chain([{ id: "rev1" }]));
    // First lookup misses (tool absent), second hits after insert.
    db.select
      .mockReturnValueOnce(chain([]))
      .mockReturnValueOnce(chain([{ id: "t1" }]));

    await (
      await caller()
    ).review.create({
      ...baseReviewInput,
      interviewRounds: [
        { interviewType: "technical", interviewDifficulty: "hard" },
        { interviewType: null, interviewDifficulty: null }, // skipped
      ],
      toolNames: ["React", "   "], // blank entry is skipped
    } as never);

    // location link + review + interview rounds + tool + reviewsToTools
    expect(db.insert).toHaveBeenCalled();
    expect(db.select).toHaveBeenCalledTimes(2);
  });

  test("create reuses an existing CompaniesToLocations link", async () => {
    db.query.Review.findMany.mockResolvedValue([]);
    db.query.CompaniesToLocations.findFirst.mockResolvedValue({ id: "ctl1" });
    db.insert.mockReturnValue(chain([{ id: "rev1" }]));

    await (
      await caller()
    ).review.create({
      ...baseReviewInput,
      interviewRounds: [],
      toolNames: [],
    });

    expect(db.query.CompaniesToLocations.findFirst).toHaveBeenCalledOnce();
  });

  test("saveDraft rejects a duplicate draft", async () => {
    db.query.Review.findFirst.mockResolvedValue({ id: "dup" });

    await expect(
      (await caller()).review.saveDraft(baseReviewInput as never),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  test("saveDraft inserts a new draft and returns its id", async () => {
    db.query.Review.findFirst.mockResolvedValue(undefined);
    db.insert.mockReturnValue(chain([{ id: "draft1" }]));
    // Tool missing on first lookup, present after it is inserted.
    db.select
      .mockReturnValueOnce(chain([]))
      .mockReturnValueOnce(chain([{ id: "t1" }]));

    const result = await (
      await caller()
    ).review.saveDraft({
      ...baseReviewInput,
      interviewRounds: [
        { interviewType: "behavioral", interviewDifficulty: "easy" },
      ],
      toolNames: ["Figma"],
    } as never);

    expect(result).toEqual({ id: "draft1" });
  });

  test("saveDraft rejects when there is no profileId", async () => {
    await expect(
      (await caller()).review.saveDraft({
        ...baseReviewInput,
        profileId: "",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  test("update clears prior rounds/tools and re-inserts them", async () => {
    db.delete.mockReturnValue(chain([]));
    db.update.mockReturnValue(chain([]));
    db.insert.mockReturnValue(chain([{ id: "rev1" }]));
    db.select
      .mockReturnValueOnce(chain([])) // tool missing
      .mockReturnValueOnce(chain([{ id: "t1" }])); // found after insert

    await (
      await caller()
    ).review.update({
      ...baseReviewInput,
      id: "rev1",
      interviewRounds: [
        { interviewType: "screening", interviewDifficulty: "average" },
      ],
      toolNames: ["Python"],
    } as never);

    expect(db.delete).toHaveBeenCalledTimes(2);
    expect(db.update).toHaveBeenCalledOnce();
  });

  test("getInterviewDataByIndustry sets cache headers when a Response exists", async () => {
    const res = { headers: new Headers() } as Response;
    db.query.Company.findMany.mockResolvedValue([{ id: "c1" }]);
    db.query.Review.findMany.mockResolvedValue([{ interviewRounds: [{}, {}] }]);

    await (
      await caller(res)
    ).review.getInterviewDataByIndustry({
      industry: "TECHNOLOGY",
    });

    expect(res.headers.get("Cache-Control")).toContain("max-age=28800");
  });

  test("getInterviewDataGlobal sets cache headers when a Response exists", async () => {
    const res = { headers: new Headers() } as Response;
    db.query.Review.findMany.mockResolvedValue([{ interviewRounds: [{}] }]);

    await (await caller(res)).review.getInterviewDataGlobal();

    expect(res.headers.get("Cache-Control")).toContain("max-age=28800");
  });

  test("getPayDataGlobal sets cache headers when a Response exists", async () => {
    const res = { headers: new Headers() } as Response;
    db.query.Review.findMany.mockResolvedValue([{ hourlyPay: "20" }]);

    await (await caller(res)).review.getPayDataGlobal();

    expect(res.headers.get("Cache-Control")).toContain("max-age=28800");
  });

  test("getPayDataByIndustry sets cache headers when a Response exists", async () => {
    const res = { headers: new Headers() } as Response;
    db.query.Company.findMany.mockResolvedValue([{ id: "c1" }]);
    db.query.Review.findMany.mockResolvedValue([{ hourlyPay: "20" }]);

    await (
      await caller(res)
    ).review.getPayDataByIndustry({
      industry: "TECHNOLOGY",
    });

    expect(res.headers.get("Cache-Control")).toContain("max-age=28800");
  });

  test("getAverageByIndustry sets cache headers when a Response exists", async () => {
    const res = { headers: new Headers() } as Response;
    db.query.Company.findMany.mockResolvedValue([{ id: "c1" }]);
    db.query.Review.findMany.mockResolvedValue([]);

    await (
      await caller(res)
    ).review.getAverageByIndustry({
      industry: "TECHNOLOGY",
    });

    expect(res.headers.get("Cache-Control")).toContain("max-age=28800");
  });
});
