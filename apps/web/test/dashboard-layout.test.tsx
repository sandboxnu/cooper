import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import DashboardLayout from "~/app/(pages)/(dashboard)/layout";

vi.mock("@cooper/ui", () => ({
  CustomToaster: () => <div data-testid="custom-toaster">Toaster</div>,
}));

vi.mock("~/app/_components/header/header-layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header-layout">{children}</div>
  ),
}));

vi.mock("~/app/_components/onboarding/onboarding-wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="onboarding-wrapper">{children}</div>
  ),
}));

describe("DashboardLayout", () => {
  test("renders children inside HeaderLayout and OnboardingWrapper", () => {
    render(
      <DashboardLayout>
        <span data-testid="page-child">Page content</span>
      </DashboardLayout>,
    );
    expect(screen.getByTestId("header-layout")).toBeInTheDocument();
    expect(screen.getByTestId("onboarding-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("page-child")).toHaveTextContent("Page content");
  });

  test("renders CustomToaster", () => {
    render(
      <DashboardLayout>
        <span>Child</span>
      </DashboardLayout>,
    );
    expect(screen.getByTestId("custom-toaster")).toBeInTheDocument();
  });
});
