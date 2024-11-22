import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Session } from "@cooper/auth";
import type { ReviewType } from "@cooper/db/schema";
import { desc } from "@cooper/db";
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
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
});
