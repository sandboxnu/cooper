import { beforeEach, describe, expect, test, vi } from "vitest";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { chain, studentSession } from "./helpers";

const db = vi.hoisted(() => ({
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

describe("companyToLocation router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("create inserts the join-table values", async () => {
    const insertChain = chain([{ companyId: "c1", locationId: "l1" }]);
    db.insert.mockReturnValue(insertChain);

    const input = { companyId: "c1", locationId: "l1" };
    await (await caller()).companyToLocation.create(input);

    expect(db.insert).toHaveBeenCalledOnce();
    expect(insertChain.values).toHaveBeenCalledWith(input);
  });

  test("getLocationsByCompanyId selects and joins by company id", async () => {
    const rows = [{ companies_to_locations: {}, location: { city: "Boston" } }];
    const selectChain = chain(rows);
    db.select.mockReturnValue(selectChain);

    const result = await (
      await caller()
    ).companyToLocation.getLocationsByCompanyId({ companyId: "c1" });

    expect(result).toEqual(rows);
    expect(db.select).toHaveBeenCalledOnce();
    expect(selectChain.leftJoin).toHaveBeenCalledOnce();
    expect(selectChain.where).toHaveBeenCalledOnce();
  });
});
