import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/env", () => ({ env: { VERCEL_ENV: "development" } }));
vi.mock("~/app/styles/font", () => ({
  hankenGroteskFont: { variable: "font-hanken" },
}));
vi.mock("~/trpc/react", () => ({
  TRPCReactProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="trpc-provider">{children}</div>
  ),
}));
vi.mock("~/app/_components/compare/compare-context", () => ({
  CompareProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="compare-provider">{children}</div>
  ),
}));

import RootLayout, { metadata } from "~/app/layout";

describe("RootLayout", () => {
  test("wraps children in the tRPC and compare providers", () => {
    render(
      <RootLayout>
        <span>child content</span>
      </RootLayout>,
    );
    expect(screen.getByTestId("trpc-provider")).toBeInTheDocument();
    expect(screen.getByTestId("compare-provider")).toBeInTheDocument();
    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  test("exposes page metadata", () => {
    expect(metadata.title).toBe("Cooper");
  });
});
