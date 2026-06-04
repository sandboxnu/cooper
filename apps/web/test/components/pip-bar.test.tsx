import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { PipBar } from "~/app/_components/roles/modals/shared/pip-bar";

function getPips(container: HTMLElement) {
  const track = container.firstElementChild!;
  return Array.from(track.children) as HTMLElement[];
}

describe("PipBar", () => {
  test("renders one pip per totalCount", () => {
    const { container } = render(
      <PipBar filledCount={2} totalCount={5} filledColor="rgb(0, 128, 0)" />,
    );
    expect(getPips(container)).toHaveLength(5);
  });

  test("fills exactly filledCount pips with the given color", () => {
    const { container } = render(
      <PipBar filledCount={2} totalCount={4} filledColor="rgb(0, 128, 0)" />,
    );
    const pips = getPips(container);

    expect(pips[0]!.style.backgroundColor).toBe("rgb(0, 128, 0)");
    expect(pips[1]!.style.backgroundColor).toBe("rgb(0, 128, 0)");
    // Unfilled pips get the gray class instead of an inline color.
    expect(pips[2]!.style.backgroundColor).toBe("");
    expect(pips[2]!.className).toContain("bg-[#d3d3d3]");
    expect(pips[3]!.className).toContain("bg-[#d3d3d3]");
  });

  test("clamps pip width to the max when there are few pips", () => {
    const { container } = render(
      <PipBar filledCount={1} totalCount={1} filledColor="rgb(0, 0, 0)" />,
    );
    // A single pip would compute wider than the cap, so it is clamped to 24px.
    expect(getPips(container)[0]!.style.width).toBe("24px");
  });

  test("clamps pip width to the min when there are many pips", () => {
    const { container } = render(
      <PipBar filledCount={0} totalCount={50} filledColor="rgb(0, 0, 0)" />,
    );
    expect(getPips(container)[0]!.style.width).toBe("4px");
  });
});
