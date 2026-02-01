import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import LogoutButton from "~/app/_components/auth/logout-button";

vi.mock("@cooper/auth", () => ({
  signOut: vi.fn(),
}));

describe("LogoutButton", () => {
  test("renders Sign Out button", () => {
    render(<LogoutButton />);
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  test("button is inside a form", () => {
    render(<LogoutButton />);
    const button = screen.getByRole("button", { name: /sign out/i });
    expect(button.closest("form")).toBeInTheDocument();
  });
});
