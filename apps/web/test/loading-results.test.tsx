import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import LoadingResults from "~/app/_components/loading-results";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
  }: {
    src: string;
    alt: string;
    width?: number;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} data-testid="body-logo" />
  ),
}));

describe("LoadingResults", () => {
  test("renders loading message", () => {
    render(<LoadingResults />);
    expect(screen.getByText("Loading ...")).toBeInTheDocument();
  });

  test("renders body logo", () => {
    render(<LoadingResults />);
    expect(screen.getByTestId("body-logo")).toBeInTheDocument();
  });

  test("applies custom className", () => {
    const { container } = render(
      <LoadingResults className="custom-class" />,
    );
    const section = container.querySelector("section");
    expect(section).toHaveClass("custom-class");
  });
});
