import { beforeEach, describe, expect, test, vi } from "vitest";

import { Session } from "@cooper/auth";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { data } from "./mocks/reviews";

vi.mock("@cooper/db/client", () => ({
  db: {
    query: {
      Review: {
        findMany: async () => data,
      },
    },
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: () => ({}),
}));

describe("Review Router", async () => {
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

  test("list endpoint returns all reviews", async () => {
    const reviews = await caller.review.list({});
    expect(reviews).toEqual(data);
  });
});
