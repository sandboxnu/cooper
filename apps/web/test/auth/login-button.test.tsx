import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import LoginButton from "~/app/_components/auth/login-button";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img src="/login.svg" alt={alt} />,
}));

vi.mock("@cooper/auth", () => ({
  signIn: vi.fn(),
}));

describe("LoginButton", () => {
  test("renders mobile form with image button", () => {
    render(<LoginButton />);
    const forms = screen.getAllByRole("button");
    expect(forms.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("img", { name: /login/i })).toBeInTheDocument();
  });

  test("renders Log in button for larger screens", () => {
    render(<LoginButton />);
    expect(screen.getByText("Log in")).toBeInTheDocument();
  });
});
