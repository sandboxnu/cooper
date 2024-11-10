import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";

import { Session } from "@cooper/auth";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";

vi.mock("@cooper/db/client", () => ({
  db: {
    query: {
      Review: {
        findMany: async () => [],
      },
    },
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: () => ({}),
}));

describe("Review", async () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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

  test("list reviews", async () => {
    const reviews = await caller.review.list({});
    expect(reviews).toEqual([]);
  });
});
