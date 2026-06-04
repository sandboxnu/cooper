import type { Session } from "@cooper/auth";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

interface QueryState {
  isPending: boolean;
  data: unknown;
}

const state: {
  profile: QueryState;
  roles: QueryState;
} = {
  profile: { isPending: false, data: undefined },
  roles: { isPending: false, data: [] },
};

vi.mock("~/trpc/react", () => ({
  api: {
    profile: {
      getCurrentUser: { useQuery: () => state.profile },
    },
    roleAndCompany: {
      list: { useQuery: () => state.roles },
    },
  },
}));

vi.mock("~/app/_components/onboarding/onboarding-form", () => ({
  OnboardingForm: ({ userId }: { userId: string }) => (
    <div data-testid="onboarding-form">{userId}</div>
  ),
}));

import { OnboardingDialog } from "~/app/_components/onboarding/dialog";

const session = {
  user: { id: "user-1", name: "Jane Doe", email: "jane@husky.neu.edu" },
} as unknown as Session;

describe("OnboardingDialog", () => {
  beforeEach(() => {
    state.profile = { isPending: false, data: undefined };
    state.roles = { isPending: false, data: [] };
  });

  test("renders nothing when there is no session", () => {
    render(<OnboardingDialog session={null} />);
    expect(screen.queryByTestId("onboarding-form")).not.toBeInTheDocument();
  });

  test("renders nothing while the profile query is pending", () => {
    state.profile = { isPending: true, data: undefined };
    render(<OnboardingDialog session={session} />);
    expect(screen.queryByTestId("onboarding-form")).not.toBeInTheDocument();
  });

  test("renders nothing while the roles query is pending", () => {
    state.roles = { isPending: true, data: undefined };
    render(<OnboardingDialog session={session} />);
    expect(screen.queryByTestId("onboarding-form")).not.toBeInTheDocument();
  });

  test("renders nothing when the user already has a profile", () => {
    state.profile = { isPending: false, data: { id: "profile-1" } };
    render(<OnboardingDialog session={session} />);
    expect(screen.queryByTestId("onboarding-form")).not.toBeInTheDocument();
  });

  test("shows the onboarding form for a session without a profile", () => {
    render(<OnboardingDialog session={session} />);
    const form = screen.getByTestId("onboarding-form");
    expect(form).toBeInTheDocument();
    expect(form).toHaveTextContent("user-1");
  });

  test("does not render the form when isOpen is false", () => {
    render(<OnboardingDialog isOpen={false} session={session} />);
    expect(screen.queryByTestId("onboarding-form")).not.toBeInTheDocument();
  });
});
