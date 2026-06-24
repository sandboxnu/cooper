import { beforeEach, describe, expect, test, vi } from "vitest";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { studentSession } from "./helpers";

const { invalidateSessionToken, getSession } = vi.hoisted(() => ({
  invalidateSessionToken: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("@cooper/db/client", () => ({ db: {} }));
vi.mock("@cooper/auth", () => ({
  auth: { api: { getSession } },
  invalidateSessionToken,
}));

async function makeCaller(headers = new Headers()) {
  const ctx = await createTRPCContext({ session: studentSession, headers });
  return createCallerFactory(appRouter)(ctx);
}

describe("auth router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue(null);
  });

  test("getSession returns the current session", async () => {
    const caller = await makeCaller();
    expect(await caller.auth.getSession()).toEqual(studentSession);
  });

  test("getSession returns null when unauthenticated", async () => {
    const ctx = await createTRPCContext({
      session: null,
      headers: new Headers(),
    });
    const caller = createCallerFactory(appRouter)(ctx);
    expect(await caller.auth.getSession()).toBeNull();
  });

  test("getSecretMessage requires a session", async () => {
    const ctx = await createTRPCContext({
      session: null,
      headers: new Headers(),
    });
    const caller = createCallerFactory(appRouter)(ctx);
    await expect(caller.auth.getSecretMessage()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  test("getSecretMessage returns the message when authenticated", async () => {
    const caller = await makeCaller();
    expect(await caller.auth.getSecretMessage()).toBe(
      "you can see this secret message!",
    );
  });

  test("signOut invalidates the token when present", async () => {
    const headers = new Headers({ Authorization: "Bearer abc123" });
    const caller = await makeCaller(headers);

    const result = await caller.auth.signOut();

    expect(result).toEqual({ success: true });
    expect(invalidateSessionToken).toHaveBeenCalledWith("Bearer abc123");
  });

  test("signOut is a no-op when no token is present", async () => {
    const caller = await makeCaller();

    const result = await caller.auth.signOut();

    expect(result).toEqual({ success: false });
    expect(invalidateSessionToken).not.toHaveBeenCalled();
  });
});
