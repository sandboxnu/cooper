import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@cooper/auth", () => ({ getSession }));
vi.mock("~/app/_components/header/header", () => ({
  default: ({
    auth,
    loggedIn,
  }: {
    auth: React.ReactNode;
    loggedIn: unknown;
  }) => (
    <div data-testid="header" data-logged-in={loggedIn ? "true" : "false"}>
      {auth}
    </div>
  ),
}));
vi.mock("~/app/_components/profile/profile-button", () => ({
  default: () => <div data-testid="profile-button" />,
}));

import HeaderLayout from "~/app/_components/header/header-layout";

describe("HeaderLayout", () => {
  beforeEach(() => vi.clearAllMocks());

  test("renders children inside the layout", async () => {
    getSession.mockResolvedValue(null);
    render(await HeaderLayout({ children: <div data-testid="child" /> }));
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  test("shows the profile button when there is a session", async () => {
    getSession.mockResolvedValue({ user: { id: "u1" } });
    render(await HeaderLayout({ children: <div /> }));
    expect(screen.getByTestId("profile-button")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toHaveAttribute(
      "data-logged-in",
      "true",
    );
  });

  test("omits the profile button for anonymous visitors", async () => {
    getSession.mockResolvedValue(null);
    render(await HeaderLayout({ children: <div /> }));
    expect(screen.queryByTestId("profile-button")).not.toBeInTheDocument();
    expect(screen.getByTestId("header")).toHaveAttribute(
      "data-logged-in",
      "false",
    );
  });
});
