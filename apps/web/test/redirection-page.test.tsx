import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import ErrorPage from "~/app/(pages)/(dashboard)/redirection/page";

describe("Redirection / Error page", () => {
  test("renders Authentication Error heading", () => {
    render(<ErrorPage />);
    expect(
      screen.getByRole("heading", { name: /authentication error/i }),
    ).toBeInTheDocument();
  });

  test("renders husky.neu.edu message", () => {
    render(<ErrorPage />);
    expect(
      screen.getByText(/you must log in with husky\.neu\.edu/i),
    ).toBeInTheDocument();
  });

  test("renders sign in hint", () => {
    render(<ErrorPage />);
    expect(
      screen.getByText(/click the sign in button to try again/i),
    ).toBeInTheDocument();
  });
});
