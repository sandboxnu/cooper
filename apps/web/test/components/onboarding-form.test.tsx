import type { Session } from "@cooper/auth";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  mutate: vi.fn(),
  isSuccess: false,
}));

// DialogTitle requires a surrounding Radix Dialog context the form is normally
// rendered inside; render it as a plain heading in isolation.
vi.mock("@cooper/ui/dialog", () => ({
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    profile: {
      create: {
        useMutation: () => ({ mutate: h.mutate, isSuccess: h.isSuccess }),
      },
    },
  },
}));

// ComboBox is a Radix popover; replace it with a simple button that selects a
// fixed major so the student form can be submitted deterministically.
vi.mock("~/app/_components/combo-box", () => ({
  default: ({ onSelect }: { onSelect: (value: string) => void }) => (
    <button type="button" onClick={() => onSelect("Computer Science")}>
      pick-major
    </button>
  ),
}));

import { OnboardingForm } from "~/app/_components/onboarding/onboarding-form";

const closeDialog = vi.fn();

function makeSession(role: string): Session {
  return {
    user: {
      id: "user-1",
      name: "Jane Doe",
      email: "jane@husky.neu.edu",
      role,
    },
  } as unknown as Session;
}

describe("OnboardingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.isSuccess = false;
  });

  test("renders the heading and prefills name/email from the session", () => {
    render(
      <OnboardingForm
        userId="user-1"
        closeDialog={closeDialog}
        session={makeSession("EMPLOYER")}
      />,
    );
    expect(screen.getByText("Let’s get you setup")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Jane")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("jane@husky.neu.edu")).toBeInTheDocument();
  });

  test("hides student-only fields for a non-student", () => {
    render(
      <OnboardingForm
        userId="user-1"
        closeDialog={closeDialog}
        session={makeSession("EMPLOYER")}
      />,
    );
    expect(screen.queryByText("Major")).not.toBeInTheDocument();
    expect(screen.queryByText("Graduation Year")).not.toBeInTheDocument();
  });

  test("shows student-only fields for a student", () => {
    render(
      <OnboardingForm
        userId="user-1"
        closeDialog={closeDialog}
        session={makeSession("STUDENT")}
      />,
    );
    expect(screen.getByText("Major")).toBeInTheDocument();
    expect(screen.getByText("Graduation Year")).toBeInTheDocument();
    expect(screen.getByText("Graduation Month")).toBeInTheDocument();
  });

  test("submits only base fields for a non-student", async () => {
    render(
      <OnboardingForm
        userId="user-1"
        closeDialog={closeDialog}
        session={makeSession("EMPLOYER")}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));

    await waitFor(() => expect(h.mutate).toHaveBeenCalledTimes(1));
    expect(h.mutate).toHaveBeenCalledWith({
      userId: "user-1",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@husky.neu.edu",
    });
  });

  test("does not submit a student form with missing required fields", async () => {
    render(
      <OnboardingForm
        userId="user-1"
        closeDialog={closeDialog}
        session={makeSession("STUDENT")}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));

    await waitFor(() =>
      expect(screen.getByText("Major is required")).toBeInTheDocument(),
    );
    expect(h.mutate).not.toHaveBeenCalled();
  });

  test("shows the welcome dialog once the profile is created", () => {
    h.isSuccess = true;
    render(
      <OnboardingForm
        userId="user-1"
        closeDialog={closeDialog}
        session={makeSession("STUDENT")}
      />,
    );
    expect(screen.getByText("Welcome to Cooper, Jane!")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start browsing" }),
    ).toBeInTheDocument();
  });
});
