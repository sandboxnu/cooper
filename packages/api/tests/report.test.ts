import { beforeEach, describe, expect, test, vi } from "vitest";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { chain, studentSession } from "./helpers";

const db = vi.hoisted(() => ({
  query: { Profile: { findFirst: vi.fn() } },
  insert: vi.fn(),
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

const baseInput = {
  entityType: "review" as const,
  entityId: "rev-1",
  reason: "SPAM",
  reportText: "This is spam",
};

describe("report router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("throws when the user has no profile", async () => {
    db.query.Profile.findFirst.mockResolvedValue(undefined);

    await expect(
      (await caller()).report.create(baseInput),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    expect(db.insert).not.toHaveBeenCalled();
  });

  test("creates a review report tied to the user's profile", async () => {
    db.query.Profile.findFirst.mockResolvedValue({ id: "profile-1" });
    const insertChain = chain([{ id: "report-1" }]);
    db.insert.mockReturnValue(insertChain);

    await (await caller()).report.create(baseInput);

    expect(insertChain.values).toHaveBeenCalledWith({
      profileId: "profile-1",
      reason: "SPAM",
      reportText: "This is spam",
      reviewId: "rev-1",
    });
  });

  test("maps the entity type to the matching id column", async () => {
    db.query.Profile.findFirst.mockResolvedValue({ id: "profile-1" });
    const insertChain = chain([{ id: "report-1" }]);
    db.insert.mockReturnValue(insertChain);

    await (
      await caller()
    ).report.create({
      ...baseInput,
      entityType: "company",
      entityId: "comp-1",
    });

    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: "comp-1" }),
    );
  });
});
