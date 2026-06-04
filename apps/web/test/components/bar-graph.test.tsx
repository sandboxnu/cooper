import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import BarGraph from "~/app/_components/shared/bar-graph";

describe("BarGraph", () => {
  test("renders the title and value", () => {
    render(<BarGraph title="Culture" maxValue={5} value={4} />);
    expect(screen.getByText("Culture")).toBeDefined();
    // value.toPrecision(2)
    expect(screen.getByText("4.0")).toBeDefined();
  });

  test("renders the industry average line and label when provided", () => {
    render(<BarGraph title="Pay" maxValue={5} value={3} industryAvg={2.5} />);
    expect(screen.getByText("Industry average: 2.5")).toBeDefined();
  });

  test("does not render the industry average label when omitted", () => {
    render(<BarGraph title="Pay" maxValue={5} value={3} />);
    expect(screen.queryByText(/Industry average/)).toBeNull();
  });
});
