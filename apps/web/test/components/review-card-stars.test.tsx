import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  GrayStar,
  ReviewCardStars,
  YellowStar,
} from "~/app/_components/reviews/review-card-stars";

function countByFill(container: HTMLElement, fill: string) {
  return container.querySelectorAll(`path[fill="${fill}"]`).length;
}

const YELLOW = "#FF9900";
const GRAY = "#C1C1C1";

describe("ReviewCardStars", () => {
  test("renders five yellow stars for a perfect rating", () => {
    const { container } = render(<ReviewCardStars numStars={5} />);
    expect(countByFill(container, YELLOW)).toBe(5);
    expect(countByFill(container, GRAY)).toBe(0);
  });

  test("renders full and empty stars for a whole-number rating", () => {
    const { container } = render(<ReviewCardStars numStars={3} />);
    expect(countByFill(container, YELLOW)).toBe(3);
    expect(countByFill(container, GRAY)).toBe(2);
  });

  test("renders a fractional star overlay", () => {
    const { container } = render(<ReviewCardStars numStars={3.5} />);
    // 3 full yellow + 1 overlay yellow (over a gray) = 4 yellow paths
    expect(countByFill(container, YELLOW)).toBe(4);
    // 1 gray under the fraction + 1 trailing empty = 2 gray paths
    expect(countByFill(container, GRAY)).toBe(2);
  });

  test("renders all gray stars for a zero rating", () => {
    const { container } = render(<ReviewCardStars numStars={0} />);
    expect(countByFill(container, YELLOW)).toBe(0);
    expect(countByFill(container, GRAY)).toBe(5);
  });
});

describe("Star icons", () => {
  test("YellowStar applies its className", () => {
    const { container } = render(<YellowStar className="custom-class" />);
    expect(container.querySelector("svg")).toHaveClass("custom-class");
  });

  test("GrayStar applies its className", () => {
    const { container } = render(<GrayStar className="custom-class" />);
    expect(container.querySelector("svg")).toHaveClass("custom-class");
  });
});
