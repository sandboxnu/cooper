import { beforeEach, describe, expect, test, vi } from "vitest";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { chain, studentSession } from "./helpers";

const db = vi.hoisted(() => ({
  query: { Profile: { findMany: vi.fn(), findFirst: vi.fn() } },
  insert: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
  select: vi.fn(),
  execute: vi.fn(),
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

describe("profile router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("list returns all profiles", async () => {
    db.query.Profile.findMany.mockResolvedValue([{ id: "p1" }]);
    const result = await (await caller()).profile.list();
    expect(result).toEqual([{ id: "p1" }]);
  });

  test("getById fetches a single profile", async () => {
    db.query.Profile.findFirst.mockResolvedValue({ id: "p1" });
    const result = await (await caller()).profile.getById({ id: "p1" });
    expect(result).toEqual({ id: "p1" });
  });

  test("getCurrentUser looks up the profile for the session user", async () => {
    db.query.Profile.findFirst.mockResolvedValue({
      id: "p1",
      userId: "user-1",
    });
    const result = await (await caller()).profile.getCurrentUser();
    expect(result).toEqual({ id: "p1", userId: "user-1" });
    expect(db.query.Profile.findFirst).toHaveBeenCalledOnce();
  });

  test("delete removes the profile by id", async () => {
    const deleteChain = chain([{ id: "p1" }]);
    db.delete.mockReturnValue(deleteChain);
    await (await caller()).profile.delete("p1");
    expect(db.delete).toHaveBeenCalledOnce();
    expect(deleteChain.where).toHaveBeenCalledOnce();
  });

  test("favoriteRole inserts a profile/role pair", async () => {
    const insertChain = chain([{}]);
    db.insert.mockReturnValue(insertChain);
    await (
      await caller()
    ).profile.favoriteRole({
      profileId: "p1",
      roleId: "r1",
    });
    expect(insertChain.values).toHaveBeenCalledWith({
      profileId: "p1",
      roleId: "r1",
    });
  });

  test("unfavoriteRole deletes the matching pair", async () => {
    const deleteChain = chain([{}]);
    db.delete.mockReturnValue(deleteChain);
    await (
      await caller()
    ).profile.unfavoriteRole({
      profileId: "p1",
      roleId: "r1",
    });
    expect(db.delete).toHaveBeenCalledOnce();
    expect(deleteChain.where).toHaveBeenCalledOnce();
  });

  test("favoriteCompany inserts a profile/company pair", async () => {
    const insertChain = chain([{}]);
    db.insert.mockReturnValue(insertChain);
    await (
      await caller()
    ).profile.favoriteCompany({
      profileId: "p1",
      companyId: "c1",
    });
    expect(insertChain.values).toHaveBeenCalledWith({
      profileId: "p1",
      companyId: "c1",
    });
  });

  test("listFavoriteCompanies returns the rows from the raw query", async () => {
    db.execute.mockResolvedValue({
      rows: [{ profileId: "p1", companyId: "c1" }],
    });
    const result = await (
      await caller()
    ).profile.listFavoriteCompanies({
      profileId: "p1",
    });
    expect(result).toEqual([{ profileId: "p1", companyId: "c1" }]);
  });

  test("listFavoriteRoles returns the rows from the raw query", async () => {
    db.execute.mockResolvedValue({
      rows: [{ profileId: "p1", roleId: "r1" }],
    });
    const result = await (
      await caller()
    ).profile.listFavoriteRoles({
      profileId: "p1",
    });
    expect(result).toEqual([{ profileId: "p1", roleId: "r1" }]);
  });

  test("listFavoriteReviews selects from the join table", async () => {
    const selectChain = chain([{ profileId: "p1", reviewId: "rev1" }]);
    db.select.mockReturnValue(selectChain);
    const result = await (
      await caller()
    ).profile.listFavoriteReviews({
      profileId: "p1",
    });
    expect(result).toEqual([{ profileId: "p1", reviewId: "rev1" }]);
    expect(selectChain.from).toHaveBeenCalledOnce();
    expect(selectChain.where).toHaveBeenCalledOnce();
  });
});
