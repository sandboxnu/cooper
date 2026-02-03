import { describe, expect, test, vi } from "vitest";

import type { Session } from "@cooper/auth";
import { auth, invalidateSessionToken, validateToken } from "@cooper/auth";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";

vi.mock("@cooper/db/client", () => ({
  db: {},
}));

vi.mock("@cooper/auth", () => ({
  auth: vi.fn(),
  invalidateSessionToken: vi.fn(),
  validateToken: vi.fn(),
}));

describe("Auth Router", () => {
  test("getSession returns session when logged in", async () => {
    const session: Session = { user: { id: "1" }, expires: "1" };
    vi.mocked(auth).mockResolvedValue(session);

    const ctx = await createTRPCContext({
      session,
      headers: new Headers(),
    });
    const caller = createCallerFactory(appRouter)(ctx);

    const result = await caller.auth.getSession();
    expect(result).toEqual(session);
  });

  test("getSession returns null when not logged in", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const ctx = await createTRPCContext({
      session: null,
      headers: new Headers(),
    });
    const caller = createCallerFactory(appRouter)(ctx);

    const result = await caller.auth.getSession();
    expect(result).toBeNull();
  });

  test("getSecretMessage returns message when authenticated", async () => {
    const session: Session = { user: { id: "1" }, expires: "1" };
    vi.mocked(auth).mockResolvedValue(session);

    const ctx = await createTRPCContext({
      session,
      headers: new Headers(),
    });
    const caller = createCallerFactory(appRouter)(ctx);

    const result = await caller.auth.getSecretMessage();
    expect(result).toBe("you can see this secret message!");
  });

  test("signOut returns success false when no token", async () => {
    const session: Session = { user: { id: "1" }, expires: "1" };
    vi.mocked(auth).mockResolvedValue(session);

    const ctx = await createTRPCContext({
      session,
      headers: new Headers(),
    });
    const caller = createCallerFactory(appRouter)(ctx);

    const result = await caller.auth.signOut();
    expect(result).toEqual({ success: false });
    expect(invalidateSessionToken).not.toHaveBeenCalled();
  });

  test("signOut invalidates token and returns success when token present", async () => {
    const session: Session = { user: { id: "1" }, expires: "1" };
    vi.mocked(validateToken).mockResolvedValue(session);
    vi.mocked(invalidateSessionToken).mockResolvedValue(undefined);

    const ctx = await createTRPCContext({
      session,
      headers: new Headers({ Authorization: "Bearer some-token" }),
    });
    const caller = createCallerFactory(appRouter)(ctx);

    const result = await caller.auth.signOut();
    expect(result).toEqual({ success: true });
    expect(invalidateSessionToken).toHaveBeenCalledWith("Bearer some-token");
  });
});
