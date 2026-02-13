import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@cooper/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock("~/app/_components/header/header", () => ({
  default: ({ auth }: { auth: React.ReactNode }) => (
    <div data-testid="header">{auth}</div>
  ),
}));

vi.mock("~/app/_components/auth/login-button", () => ({
  default: () => <button type="button">Login</button>,
}));

vi.mock("~/app/_components/profile/profile-button", () => ({
  default: () => <button type="button">Profile</button>,
}));

describe("HeaderLayout", () => {
  test("renders children and Header when session is null", async () => {
    const HeaderLayout = (
      await import("~/app/_components/header/header-layout")
    ).default;
    const element = await HeaderLayout({
      children: <span data-testid="child">Page content</span>,
    });
    render(element);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toHaveTextContent("Page content");
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("renders article wrapper for children", async () => {
    const HeaderLayout = (
      await import("~/app/_components/header/header-layout")
    ).default;
    const element = await HeaderLayout({
      children: <span data-testid="child">Content</span>,
    });
    const { container } = render(element);
    const article = container.querySelector("article");
    expect(article).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
