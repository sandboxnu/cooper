import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { BrowseAroundPrompt } from "~/app/_components/onboarding/post-onboarding/browse-around-prompt";

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

describe("BrowseAroundPrompt", () => {
  test("renders WelcomeDialog with welcome message for first name", () => {
    render(
      <BrowseAroundPrompt firstName="Alex" onClick={vi.fn()} />,
    );
    expect(screen.getByTestId("welcome-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("heading")).toHaveTextContent(
      "Welcome to Cooper, Alex!",
    );
    expect(screen.getByTestId("subheading")).toHaveTextContent(
      "Feel free to browse job reviews and search for companies you may be interested in.",
    );
    expect(screen.getByTestId("button-text")).toHaveTextContent("Got it");
  });
});
