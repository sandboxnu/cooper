import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import CooperLogo from "~/app/_components/cooper-logo";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      data-testid="cooper-logo-img"
    />
  ),
}));

describe("CooperLogo", () => {
  test("renders logo with default dimensions when no width", () => {
    render(<CooperLogo />);
    const img = screen.getByTestId("cooper-logo-img");
    expect(img).toHaveAttribute("src", "/svg/logoOutline.svg");
    expect(img).toHaveAttribute("alt", "Logo Picture");
    expect(img).toHaveAttribute("width", "80");
    expect(img).toHaveAttribute("height", "70");
  });

  test("renders logo with custom width", () => {
    render(<CooperLogo width={120} />);
    const img = screen.getByTestId("cooper-logo-img");
    expect(img).toHaveAttribute("width", "120");
    expect(Number(img.getAttribute("height"))).toBeCloseTo(120 / 1.17);
  });
});
