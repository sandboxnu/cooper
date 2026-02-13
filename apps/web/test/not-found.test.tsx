import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import NotFound from "~/app/not-found";

vi.mock("~/app/_components/header/header-layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header-layout">{children}</div>
  ),
}));

vi.mock("~/app/_components/back-button", () => ({
  default: () => <button type="button">Go Back</button>,
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test mock
    <img src="/svg/deadLogo.svg" alt={alt} data-testid="404-image" />
  ),
}));

describe("NotFound", () => {
  test("renders 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  test("renders Page Not Found message", () => {
    render(<NotFound />);
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  test("renders BackButton", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("button", { name: /go back/i }),
    ).toBeInTheDocument();
  });

  test("renders within HeaderLayout", () => {
    render(<NotFound />);
    expect(screen.getByTestId("header-layout")).toBeInTheDocument();
  });

  test("renders 404 image on desktop", () => {
    render(<NotFound />);
    expect(screen.getByTestId("404-image")).toBeInTheDocument();
  });
});
