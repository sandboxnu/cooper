import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ReviewCardStars } from "~/app/_components/reviews/review-card-stars";

describe("ReviewCardStars", () => {
  test("renders 5 full stars for 5", () => {
    const { container } = render(<ReviewCardStars numStars={5} />);
    const yellowStars = container.querySelectorAll('[fill="#FF9900"]');
    expect(yellowStars.length).toBeGreaterThanOrEqual(5);
  });

  test("renders 3 full stars for 3", () => {
    const { container } = render(<ReviewCardStars numStars={3} />);
    const yellowStars = container.querySelectorAll('[fill="#FF9900"]');
    expect(yellowStars.length).toBeGreaterThanOrEqual(3);
  });

  test("renders mixed stars for 3.5", () => {
    const { container } = render(<ReviewCardStars numStars={3.5} />);
    const yellowStars = container.querySelectorAll('[fill="#FF9900"]');
    const grayStars = container.querySelectorAll('[fill="#C1C1C1"]');
    expect(yellowStars.length).toBeGreaterThanOrEqual(3);
    expect(grayStars.length).toBeGreaterThanOrEqual(1);
  });

  test("renders fractional bar for decimal", () => {
    const { container } = render(<ReviewCardStars numStars={2.5} />);
    const fractionalBar = container.querySelector(".overflow-hidden");
    expect(fractionalBar).toBeInTheDocument();
  });
});
