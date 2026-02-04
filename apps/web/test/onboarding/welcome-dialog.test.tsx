import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { WelcomeDialog } from "~/app/_components/onboarding/post-onboarding/welcome-dialog";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test mock
    <img src={src} alt={alt} />
  ),
}));

describe("WelcomeDialog", () => {
  const onClick = vi.fn();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- vitest beforeEach callback with mocks
  beforeEach(() => {
    onClick.mockClear();
  });

  test("renders heading and subheading", () => {
    render(
      <WelcomeDialog
        heading="Welcome!"
        subheading="Get started."
        buttonText="OK"
        onClick={onClick}
      />,
    );
    expect(screen.getByText("Welcome!")).toBeInTheDocument();
    expect(screen.getByText("Get started.")).toBeInTheDocument();
  });

  test("renders button with buttonText", () => {
    render(
      <WelcomeDialog
        heading="Hi"
        subheading="Sub"
        buttonText="Take me there!"
        onClick={onClick}
      />,
    );
    const button = screen.getByRole("button", { name: /take me there/i });
    expect(button).toBeInTheDocument();
  });

  test("calls onClick when button is clicked", () => {
    render(
      <WelcomeDialog
        heading="Hi"
        subheading="Sub"
        buttonText="Got it"
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /got it/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("renders Cooper Logo image", () => {
    render(
      <WelcomeDialog
        heading="Hi"
        subheading="Sub"
        buttonText="OK"
        onClick={onClick}
      />,
    );
    expect(
      screen.getByRole("img", { name: /cooper logo/i }),
    ).toBeInTheDocument();
  });
});
