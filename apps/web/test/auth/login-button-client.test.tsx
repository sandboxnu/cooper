import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import LoginButtonClient from "~/app/_components/auth/login-button-client";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img src="/login.svg" alt={alt} />,
}));

vi.mock("~/app/_components/auth/actions", () => ({
  handleGoogleSignIn: vi.fn(),
}));

describe("LoginButtonClient", () => {
  test("renders form with submit button", () => {
    render(<LoginButtonClient />);
    const form = screen.getByRole("button", { name: /login/i }).closest("form");
    expect(form).toBeInTheDocument();
  });

  test("renders login image with correct alt", () => {
    render(<LoginButtonClient />);
    expect(screen.getByRole("img", { name: /login/i })).toBeInTheDocument();
  });
});
