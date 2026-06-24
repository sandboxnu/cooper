import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import BarGraph from "~/app/_components/reviews/bar-graph";

describe("reviews/BarGraph", () => {
  test("renders the title and value to two significant figures", () => {
    render(<BarGraph title="Culture" maxValue={5} value={4} />);
    expect(screen.getByText("Culture")).toBeInTheDocument();
    expect(screen.getByText("4.0")).toBeInTheDocument();
  });

  test("does not render the industry average label when absent", () => {
    render(<BarGraph title="Culture" maxValue={5} value={4} />);
    expect(screen.queryByText(/Industry average/)).not.toBeInTheDocument();
  });

  test("renders the industry average label when provided", () => {
    render(
      <BarGraph title="Culture" maxValue={5} value={4} industryAvg={3.5} />,
    );
    expect(screen.getByText("Industry average: 3.5")).toBeInTheDocument();
  });

  test("caps the fill width at 100% when the value exceeds the max", () => {
    const { container } = render(
      <BarGraph title="Pay" maxValue={5} value={10} />,
    );
    const fill = container.querySelector(".bg-cooper-blue-600");
    expect(fill).toHaveStyle({ width: "100%" });
  });
});
