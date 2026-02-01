import { describe, expect, test, vi } from "vitest";

const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    mockRedirect(path);
    throw new Error("NEXT_REDIRECT");
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock("@cooper/ui", () => ({
  CustomToaster: () => null,
}));

vi.mock("~/app/_components/header/header-layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("ProtectedLayout redirect when no session", () => {
  test("calls redirect(/) when session is null", async () => {
    mockRedirect.mockClear();
    const ProtectedLayout = (await import("~/app/(pages)/(protected)/layout"))
      .default;
    await expect(
      ProtectedLayout({ children: <div>Child</div> }),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });
});
