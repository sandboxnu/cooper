/* eslint-disable @typescript-eslint/no-unsafe-assignment -- vitest matchers like expect.anything() return `any` */
import { beforeEach, describe, expect, test, vi } from "vitest";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { chain, studentSession } from "./helpers";

const db = vi.hoisted(() => ({
  query: {
    Location: { findMany: vi.fn(), findFirst: vi.fn() },
  },
  insert: vi.fn(),
  select: vi.fn(),
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

describe("location router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("list returns all locations ordered by city", async () => {
    const rows = [{ id: "1", city: "Boston" }];
    db.query.Location.findMany.mockResolvedValue(rows);

    const result = await (await caller()).location.list();

    expect(result).toEqual(rows);
    expect(db.query.Location.findMany).toHaveBeenCalledWith({
      orderBy: expect.anything(),
    });
  });

  test("getById queries by the given id", async () => {
    const row = { id: "loc-1", city: "Boston" };
    db.query.Location.findFirst.mockResolvedValue(row);

    const result = await (await caller()).location.getById({ id: "loc-1" });

    expect(result).toEqual(row);
    expect(db.query.Location.findFirst).toHaveBeenCalledOnce();
  });

  test("getByPrefix passes a where predicate and city ordering", async () => {
    db.query.Location.findMany.mockResolvedValue([]);

    await (await caller()).location.getByPrefix({ prefix: "Bo" });

    expect(db.query.Location.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.any(Function),
        orderBy: expect.anything(),
      }),
    );
  });

  test("create inserts the provided location values", async () => {
    const insertChain = chain([{ id: "new" }]);
    db.insert.mockReturnValue(insertChain);

    const input = { city: "Boston", state: "MA", country: "USA" };
    await (await caller()).location.create(input);

    expect(db.insert).toHaveBeenCalledOnce();
    expect(insertChain.values).toHaveBeenCalledWith(input);
  });

  test("getByPopularity builds an aggregated, grouped query", async () => {
    const rows = [{ id: "1", city: "Boston", companyCount: 3 }];
    db.select.mockReturnValue(chain(rows));

    const result = await (
      await caller()
    ).location.getByPopularity({
      prefix: "Bo",
    });

    expect(result).toEqual(rows);
    expect(db.select).toHaveBeenCalledOnce();
  });
});
