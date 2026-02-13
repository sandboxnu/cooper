import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CoopPrompt } from "~/app/_components/onboarding/post-onboarding/coop-prompt";

vi.mock("~/app/_components/onboarding/post-onboarding/welcome-dialog", () => ({
  WelcomeDialog: ({
    heading,
    subheading,
    buttonText,
  }: {
    heading: string;
    subheading: string;
    buttonText: string;
  }) => (
    <div data-testid="welcome-dialog">
      <span data-testid="heading">{heading}</span>
      <span data-testid="subheading">{subheading}</span>
      <span data-testid="button-text">{buttonText}</span>
    </div>
  ),
}));

describe("CoopPrompt", () => {
  test("renders WelcomeDialog with coop review prompt", () => {
    render(<CoopPrompt firstName="Jordan" onClick={vi.fn()} />);
    expect(screen.getByTestId("welcome-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("heading")).toHaveTextContent(
      "Welcome to Cooper, Jordan!",
    );
    expect(screen.getByTestId("subheading")).toHaveTextContent(
      "To get started, please leave a co-op review.",
    );
    expect(screen.getByTestId("button-text")).toHaveTextContent(
      "Take me there!",
    );
  });
});
