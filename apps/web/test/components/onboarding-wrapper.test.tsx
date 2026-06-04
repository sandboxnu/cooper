import type { Session } from "@cooper/auth";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock("@cooper/auth", () => ({
  getSession: h.getSession,
}));

vi.mock("~/app/_components/onboarding/dialog", () => ({
  OnboardingDialog: ({ session }: { session: Session | null }) => (
    <div data-testid="onboarding-dialog">
      {session ? session.user.id : "no-session"}
    </div>
  ),
}));

import OnboardingWrapper from "~/app/_components/onboarding/onboarding-wrapper";

describe("OnboardingWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders children alongside the onboarding dialog", async () => {
    h.getSession.mockResolvedValue(null);
    render(await OnboardingWrapper({ children: <p>child content</p> }));

    expect(screen.getByText("child content")).toBeInTheDocument();
    expect(screen.getByTestId("onboarding-dialog")).toBeInTheDocument();
  });

  test("passes a resolved session through to the dialog", async () => {
    h.getSession.mockResolvedValue({
      user: { id: "user-42" },
    });
    render(await OnboardingWrapper({ children: <p>child</p> }));

    expect(screen.getByTestId("onboarding-dialog")).toHaveTextContent(
      "user-42",
    );
  });

  test("passes a null session through when logged out", async () => {
    h.getSession.mockResolvedValue(null);
    render(await OnboardingWrapper({ children: <p>child</p> }));

    expect(screen.getByTestId("onboarding-dialog")).toHaveTextContent(
      "no-session",
    );
  });
});
