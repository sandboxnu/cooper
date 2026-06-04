import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import RoundBarGraph from "~/app/_components/reviews/round-bar-graph";

function getFill(container: HTMLElement) {
  return container.querySelector<HTMLElement>(".bg-cooper-blue-600")!;
}

describe("RoundBarGraph", () => {
  test("fills proportionally to the high/low span over the range", () => {
    // span = 5-0 = 5 of range 10 -> 50%
    const { container } = render(<RoundBarGraph maxValue={10} highValue={5} />);
    const fill = getFill(container);
    expect(fill.style.width).toBe("50%");
    expect(fill.style.left).toBe("0%");
  });

  test("offsets the fill by the low value", () => {
    // low=2 of range 10 -> left 20%; span (8-2)=6 -> 60%
    const { container } = render(
      <RoundBarGraph maxValue={10} lowValue={2} highValue={8} />,
    );
    const fill = getFill(container);
    expect(fill.style.left).toBe("20%");
    expect(fill.style.width).toBe("60%");
  });

  test("clamps the fill width at 100%", () => {
    const { container } = render(<RoundBarGraph maxValue={5} highValue={20} />);
    expect(getFill(container).style.width).toBe("100%");
  });

  test("renders dashed markers for industry averages", () => {
    const { container } = render(
      <RoundBarGraph
        maxValue={10}
        highValue={5}
        lowIndustryAvg={2}
        highIndustryAvg={8}
      />,
    );
    expect(container.querySelectorAll(".border-dashed")).toHaveLength(2);
  });
});
