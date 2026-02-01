import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    mockRedirect(path);
    throw new Error("NEXT_REDIRECT");
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "user-1", email: "test@neu.edu" },
    session: {},
  }),
}));

vi.mock("@cooper/ui", () => ({
  CustomToaster: () => <div data-testid="custom-toaster">Toaster</div>,
}));

vi.mock("~/app/_components/header/header-layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header-layout">{children}</div>
  ),
}));

describe("ProtectedLayout", () => {
  test("renders children and HeaderLayout when session exists", async () => {
    const ProtectedLayout = (
      await import("~/app/(pages)/(protected)/layout")
    ).default;
    const element = await ProtectedLayout({
      children: <span data-testid="protected-child">Protected</span>,
    });
    render(element);
    expect(screen.getByTestId("header-layout")).toBeInTheDocument();
    expect(screen.getByTestId("protected-child")).toHaveTextContent("Protected");
    expect(screen.getByTestId("custom-toaster")).toBeInTheDocument();
  });
});
