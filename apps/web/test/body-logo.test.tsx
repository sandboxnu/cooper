import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import BodyLogo from "~/app/_components/body-logo";

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
      data-testid="body-logo-img"
    />
  ),
}));

describe("BodyLogo", () => {
  test("renders logo with default dimensions when no width", () => {
    render(<BodyLogo />);
    const img = screen.getByTestId("body-logo-img");
    expect(img).toHaveAttribute("src", "/svg/bodyLogo.svg");
    expect(img).toHaveAttribute("alt", "Logo Picture");
    expect(img).toHaveAttribute("width", "80");
    expect(img).toHaveAttribute("height", "70");
  });

  test("renders logo with custom width", () => {
    render(<BodyLogo width={200} />);
    const img = screen.getByTestId("body-logo-img");
    expect(img).toHaveAttribute("width", "200");
    expect(Number(img.getAttribute("height"))).toBeCloseTo(200 / 1.17);
  });
});
