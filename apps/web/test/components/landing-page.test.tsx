import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const { envRef } = vi.hoisted(() => ({
  envRef: { VERCEL_ENV: "production" },
}));

vi.mock("~/env", () => ({ env: envRef }));

vi.mock("~/app/_components/auth/admin-signin-button", () => ({
  default: () => <div data-testid="admin-signin" />,
}));
vi.mock("~/app/_components/auth/login-button", () => ({
  default: ({ isPreview }: { isPreview: boolean }) => (
    <div data-testid="login-button">{isPreview ? "preview" : "prod"}</div>
  ),
}));
vi.mock("~/app/_components/landing/admin-access-toast", () => ({
  AdminAccessToast: () => <div data-testid="admin-toast" />,
}));

import Landing from "~/app/(pages)/(landing)/page";

describe("Landing page", () => {
  test("renders the hero copy and value props", () => {
    render(<Landing />);
    expect(screen.getByText("real co-op experiences")).toBeInTheDocument();
    expect(
      screen.getByText("Anonymous reviews to protect identities"),
    ).toBeInTheDocument();
  });

  test("shows the husky email prompt and admin sign-in in production", () => {
    render(<Landing />);
    expect(
      screen.getByText("Log in with husky.neu.edu email to access reviews"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("admin-signin")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toHaveTextContent("prod");
  });
});
