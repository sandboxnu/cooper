/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Session } from "@cooper/auth";
import type { ReviewType } from "@cooper/db/schema";
import { and, desc, eq } from "@cooper/db";
import { db } from "@cooper/db/client";
import { Review } from "@cooper/db/schema";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { data } from "./mocks/review";

vi.mock("@cooper/db/client", () => ({
  db: {
    query: {
      Review: {
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
      orderBy: desc(Review.id),
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
});
