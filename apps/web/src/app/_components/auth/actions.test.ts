import { describe, expect, test, vi } from "vitest";
import { handleGoogleSignIn, handleSignOut } from "./actions";

const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
vi.mock("@cooper/auth", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args) as unknown,
  signOut: (...args: unknown[]) => mockSignOut(...args) as unknown,
}));

describe("auth actions", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- vitest beforeEach callback with hoisted mocks
  beforeEach(() => {
    mockSignIn.mockReset();
    mockSignOut.mockReset();
  });

  describe("handleGoogleSignIn", () => {
    test("calls signIn with google and redirectTo", async () => {
      mockSignIn.mockResolvedValue(undefined);
      await handleGoogleSignIn();
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockSignIn).toHaveBeenCalledWith("google", { redirectTo: "/" });
    });
  });

  describe("handleSignOut", () => {
    test("calls signOut with redirectTo", async () => {
      mockSignOut.mockResolvedValue(undefined);
      await handleSignOut();
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockSignOut).toHaveBeenCalledWith({ redirectTo: "/" });
    });
  });
});
