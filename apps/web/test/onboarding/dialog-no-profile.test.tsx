import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { OnboardingDialog } from "~/app/_components/onboarding/dialog";

vi.mock("~/trpc/react", () => ({
  api: {
    profile: {
      getCurrentUser: {
        useQuery: () => ({ data: undefined, isPending: false }),
      },
    },
  },
}));

vi.mock("~/app/_components/onboarding/onboarding-form", () => ({
  OnboardingForm: () => <div data-testid="onboarding-form">Form</div>,
}));

describe("OnboardingDialog when no profile", () => {
  test("renders OnboardingForm when session exists and no profile", () => {
    render(
      <OnboardingDialog
        session={{
          user: { id: "u1", email: "a@b.com", name: "User" },
          session: {},
        } as never}
      />,
    );
    expect(screen.getByTestId("onboarding-form")).toBeInTheDocument();
  });
});
