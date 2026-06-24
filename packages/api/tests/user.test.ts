import { beforeEach, describe, expect, test, vi } from "vitest";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { adminSession, chain } from "./helpers";

const db = vi.hoisted(() => ({
  query: {
    User: { findFirst: vi.fn() },
  },
  insert: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@cooper/db/client", () => ({ db }));
vi.mock("@cooper/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

async function caller() {
  const ctx = await createTRPCContext({
    session: adminSession,
    headers: new Headers(),
  });
  return createCallerFactory(appRouter)(ctx);
}

describe("user router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("create inserts a new user when the email is not taken", async () => {
    const inserted = [{ id: "u1", email: "new@x.com", role: "STUDENT" }];
    db.query.User.findFirst.mockResolvedValue(undefined);
    const insertChain = chain(inserted);
    db.insert.mockReturnValue(insertChain);

    const result = await (
      await caller()
    ).user.create({
      email: "new@x.com",
      role: "STUDENT",
    });

    expect(db.insert).toHaveBeenCalledOnce();
    expect(db.update).not.toHaveBeenCalled();
    expect(result).toEqual(inserted);
    // isDisabled defaults to false when omitted.
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@x.com",
        role: "STUDENT",
        isDisabled: false,
      }),
    );
  });

  test("create updates the existing user instead of inserting", async () => {
    const updated = [{ id: "u1", email: "dupe@x.com", role: "ADMIN" }];
    db.query.User.findFirst.mockResolvedValue({
      id: "u1",
      email: "dupe@x.com",
    });
    const updateChain = chain(updated);
    db.update.mockReturnValue(updateChain);

    const result = await (
      await caller()
    ).user.create({
      email: "dupe@x.com",
      role: "ADMIN",
      isDisabled: true,
    });

    expect(db.update).toHaveBeenCalledOnce();
    expect(db.insert).not.toHaveBeenCalled();
    expect(result).toEqual(updated);
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ role: "ADMIN", isDisabled: true }),
    );
  });

  test("create rejects an invalid email", async () => {
    await expect(
      (await caller()).user.create({ email: "not-an-email", role: "STUDENT" }),
    ).rejects.toThrow();
    expect(db.query.User.findFirst).not.toHaveBeenCalled();
  });
});
