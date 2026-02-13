import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@cooper/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "u1" }, session: {} }),
}));

vi.mock("~/app/_components/onboarding/dialog", () => ({
  OnboardingDialog: ({ session }: { session: unknown }) => (
    <div data-testid="onboarding-dialog">
      {session ? "Dialog" : "No session"}
    </div>
  ),
}));

describe("OnboardingWrapper", () => {
  test("renders children and OnboardingDialog when session exists", async () => {
    const OnboardingWrapper = (
      await import("~/app/_components/onboarding/onboarding-wrapper")
    ).default;
    const element = await OnboardingWrapper({
      children: <span data-testid="child">Page</span>,
    });
    render(element);
    expect(screen.getByTestId("child")).toHaveTextContent("Page");
    expect(screen.getByTestId("onboarding-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("onboarding-dialog")).toHaveTextContent("Dialog");
  });
});
