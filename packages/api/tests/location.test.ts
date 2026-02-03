import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Session } from "@cooper/auth";
import { auth } from "@cooper/auth";
import { asc, eq } from "@cooper/db";
import { db } from "@cooper/db/client";
import { Location } from "@cooper/db/schema";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";

const mockLocations = [
  { id: "loc-1", city: "Boston", state: "MA", country: "USA" },
  { id: "loc-2", city: "Cambridge", state: "MA", country: "USA" },
];

vi.mock("@cooper/db/client", () => ({
  db: {
    query: {
      Location: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve({ returning: [] })),
    })),
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: vi.fn(),
}));

describe("Location Router", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(db.query.Location.findMany).mockResolvedValue(mockLocations);
    vi.mocked(db.query.Location.findFirst).mockResolvedValue(mockLocations[0]!);
  });

  const session: Session = { user: { id: "1" }, expires: "1" };

  const getCaller = async () => {
    vi.mocked(auth).mockResolvedValue(session);
    const ctx = await createTRPCContext({
      session,
      headers: new Headers(),
    });
    return createCallerFactory(appRouter)(ctx);
  };

  test("list returns locations ordered by city", async () => {
    const caller = await getCaller();
    await caller.location.list();
    expect(db.query.Location.findMany).toHaveBeenCalledWith({
      orderBy: asc(Location.city),
    });
  });

  test("getById returns location by id", async () => {
    const caller = await getCaller();
    await caller.location.getById({ id: "loc-1" });
    expect(db.query.Location.findFirst).toHaveBeenCalledWith({
      where: eq(Location.id, "loc-1"),
    });
  });

  test("getByPrefix returns locations matching city prefix", async () => {
    const caller = await getCaller();
    await caller.location.getByPrefix({ prefix: "Bos" });
    expect(db.query.Location.findMany).toHaveBeenCalledWith({
      where: expect.any(Function),
      orderBy: asc(Location.city),
    });
  });

  test("create inserts location", async () => {
    const caller = await getCaller();
    const insertChain = {
      values: vi.fn().mockResolvedValue({ returning: [{ id: "new-loc" }] }),
    };
    vi.mocked(db.insert).mockReturnValue(insertChain as never);

    await caller.location.create({
      city: "Boston",
      state: "MA",
      country: "USA",
    });
    expect(db.insert).toHaveBeenCalledWith(Location);
    expect(insertChain.values).toHaveBeenCalledWith({
      city: "Boston",
      state: "MA",
      country: "USA",
    });
  });
});
