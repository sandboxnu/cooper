import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import RoundBarGraph from "~/app/_components/reviews/round-bar-graph";

describe("RoundBarGraph", () => {
  test("renders bar container", () => {
    const { container } = render(
      <RoundBarGraph maxValue={100} highValue={50} />,
    );
    const wrapper = container.querySelector(".relative.h-5");
    expect(wrapper).toBeInTheDocument();
  });

  test("renders fill bar with correct width for range", () => {
    const { container } = render(
      <RoundBarGraph
        minValue={0}
        maxValue={100}
        lowValue={20}
        highValue={80}
      />,
    );
    const fillBar = container.querySelector('[style*="width"]');
    expect(fillBar).toBeInTheDocument();
    expect((fillBar as HTMLElement).style.width).toBe("60%");
  });

  test("caps fill at 100% when range exceeds max", () => {
    const { container } = render(
      <RoundBarGraph
        minValue={0}
        maxValue={100}
        lowValue={0}
        highValue={150}
      />,
    );
    const fillBar = container.querySelector('[style*="width"]');
    expect((fillBar as HTMLElement).style.width).toBe("100%");
  });

  test("renders industry avg markers when provided", () => {
    const { container } = render(
      <RoundBarGraph
        minValue={0}
        maxValue={100}
        lowValue={10}
        highValue={90}
        lowIndustryAvg={30}
        highIndustryAvg={70}
      />,
    );
    const dashedBorders = container.querySelectorAll(".border-dashed");
    expect(dashedBorders.length).toBe(2);
  });
});
