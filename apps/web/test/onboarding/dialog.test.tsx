import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { OnboardingDialog } from "~/app/_components/onboarding/dialog";

vi.mock("~/trpc/react", () => ({
  api: {
    profile: {
      getCurrentUser: {
        useQuery: () => ({
          data: { id: "p1" },
          isPending: false,
        }),
      },
    },
  },
}));

vi.mock("~/app/_components/onboarding/onboarding-form", () => ({
  OnboardingForm: () => <div data-testid="onboarding-form">Form</div>,
}));

describe("OnboardingDialog", () => {
  test("returns null when profile exists (shouldShowOnboarding is false)", () => {
    const { container } = render(
      <OnboardingDialog
        session={
          {
            user: { id: "u1", email: "a@b.com", name: "User" },
            session: {},
          } as never
        }
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
