import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import RootLayout from "~/app/layout";

vi.mock("~/env", () => ({
  env: { VERCEL_ENV: "development", NODE_ENV: "test" },
}));

vi.mock("~/trpc/react", () => ({
  TRPCReactProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="trpc-provider">{children}</div>
  ),
}));

vi.mock("~/app/_components/compare/compare-context", () => ({
  CompareProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="compare-provider">{children}</div>
  ),
}));

vi.mock("~/app/styles/font", () => ({
  hankenGroteskFont: { variable: "font-hanken" },
}));

describe("RootLayout", () => {
  test("renders children inside providers", () => {
    render(
      <RootLayout>
        <span data-testid="child">Child content</span>
      </RootLayout>,
    );
    expect(screen.getByTestId("trpc-provider")).toBeInTheDocument();
    expect(screen.getByTestId("compare-provider")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toHaveTextContent("Child content");
  });

  test("renders html with lang and font class", () => {
    const { container } = render(
      <RootLayout>
        <span>Child</span>
      </RootLayout>,
    );
    const html = container.querySelector("html");
    expect(html).toHaveAttribute("lang", "en");
    expect(html).toHaveClass("font-hanken");
  });

  test("renders body with expected classes", () => {
    const { container } = render(
      <RootLayout>
        <span>Child</span>
      </RootLayout>,
    );
    const body = container.querySelector("body");
    expect(body).toHaveClass("bg-cooper-cream-100", "font-sans", "antialiased");
  });
});
