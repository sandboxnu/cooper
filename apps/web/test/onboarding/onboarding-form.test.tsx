import React from "react";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Dialog, DialogContent } from "@cooper/ui/dialog";
import { OnboardingForm } from "~/app/_components/onboarding/onboarding-form";

function OnboardingDialogWrapper(
  props: React.ComponentProps<typeof OnboardingForm>,
) {
  return (
    <Dialog open>
      <DialogContent>
        <OnboardingForm {...props} />
      </DialogContent>
    </Dialog>
  );
}

const mockCloseDialog = vi.fn();
const mockMutate = vi.fn();
let mockProfileIsSuccess = false;

vi.mock("~/trpc/react", () => ({
  api: {
    profile: {
      create: {
        useMutation: () => ({
          mutate: mockMutate,
          isSuccess: mockProfileIsSuccess,
        }),
      },
    },
  },
}));

vi.mock("~/app/_components/combo-box", () => ({
  default: ({
    defaultLabel,
    onSelect,
  }: {
    defaultLabel: string;
    onSelect: (v: string) => void;
  }) => (
    <div data-testid="combo-box">
      <span>{defaultLabel}</span>
      <button type="button" onClick={() => onSelect("Computer Science")}>
        Select major
      </button>
    </div>
  ),
}));

vi.mock("~/app/_components/themed/onboarding/select", () => ({
  Select: ({ placeholder }: { placeholder?: string }) => (
    <select data-testid="graduation-month" aria-label={placeholder}>
      <option value="">{placeholder}</option>
      <option value="5">May</option>
    </select>
  ),
}));

vi.mock(
  "~/app/_components/onboarding/post-onboarding/browse-around-prompt",
  () => ({
    BrowseAroundPrompt: ({
      firstName,
      onClick,
    }: {
      firstName: string;
      onClick: () => void;
    }) => (
      <div data-testid="browse-around-prompt">
        <span>{firstName}</span>
        <button type="button" onClick={onClick}>
          Browse
        </button>
      </div>
    ),
  }),
);

vi.mock("~/app/_components/onboarding/post-onboarding/coop-prompt", () => ({
  CoopPrompt: ({
    firstName,
    onClick,
  }: {
    firstName: string;
    onClick: () => void;
  }) => (
    <div data-testid="coop-prompt">
      <span>{firstName}</span>
      <button type="button" onClick={onClick}>
        Coop
      </button>
    </div>
  ),
}));

const defaultSession = {
  user: {
    id: "user-1",
    email: "jane@example.com",
    name: "Jane Doe",
  },
  expires: "",
} as never;

describe("OnboardingForm", () => {
  beforeEach(() => {
    mockMutate.mockClear();
    mockCloseDialog.mockClear();
  });

  test("renders Create a Cooper Account title", () => {
    render(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Create a Cooper Account" }),
    ).toBeInTheDocument();
  });

  test("renders First Name and Last Name fields", () => {
    render(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    expect(screen.getByPlaceholderText("First")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last")).toBeInTheDocument();
  });

  test("renders Email field", () => {
    render(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    expect(
      screen.getByPlaceholderText("example@example.com"),
    ).toBeInTheDocument();
  });

  test("renders Major ComboBox", () => {
    render(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    expect(screen.getByTestId("combo-box")).toBeInTheDocument();
    expect(screen.getByText("Select major...")).toBeInTheDocument();
  });

  test("renders Minor, Graduation Year, Graduation Month fields", () => {
    render(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    expect(screen.getByPlaceholderText("Minor")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Year")).toBeInTheDocument();
    expect(screen.getByTestId("graduation-month")).toBeInTheDocument();
  });

  test("renders Have you completed a co-op before with Yes and No", () => {
    render(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    expect(
      screen.getByText(/Have you completed a co-op before/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
  });

  test("renders Next submit button", () => {
    render(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  test("pre-fills firstName and lastName from session name", () => {
    render(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    expect(screen.getByPlaceholderText("First")).toHaveValue("Jane");
    expect(screen.getByPlaceholderText("Last")).toHaveValue("Doe");
  });

  test("pre-fills email from session", () => {
    render(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    expect(screen.getByPlaceholderText("example@example.com")).toHaveValue(
      "jane@example.com",
    );
  });

  test("clicking Yes sets cooped to true", () => {
    render(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(screen.getByRole("button", { name: "Yes" })).toHaveClass(
      "bg-cooper-blue-200",
    );
  });

  test("clicking No sets cooped to false", () => {
    render(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "No" }));
    expect(screen.getByRole("button", { name: "No" })).toHaveClass(
      "bg-cooper-blue-200",
    );
  });
});

describe("OnboardingForm on success", () => {
  test("renders BrowseAroundPrompt when profile.isSuccess and cooped is false", () => {
    mockProfileIsSuccess = true;
    render(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    expect(screen.getByTestId("browse-around-prompt")).toBeInTheDocument();
    expect(screen.getByTestId("browse-around-prompt")).toHaveTextContent(
      "Jane",
    );
    mockProfileIsSuccess = false;
  });

  test("renders CoopPrompt when profile.isSuccess and cooped is true", () => {
    const { rerender } = render(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    mockProfileIsSuccess = true;
    rerender(
      <OnboardingDialogWrapper
        userId="user-1"
        closeDialog={mockCloseDialog}
        session={defaultSession}
      />,
    );
    expect(screen.getByTestId("coop-prompt")).toBeInTheDocument();
    expect(screen.getByTestId("coop-prompt")).toHaveTextContent("Jane");
    mockProfileIsSuccess = false;
  });
});
