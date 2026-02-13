import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import BarGraph from "~/app/_components/reviews/bar-graph";

describe("BarGraph", () => {
  test("renders title", () => {
    render(<BarGraph title="Culture" maxValue={5} value={4} />);
    expect(screen.getByText("Culture")).toBeInTheDocument();
  });

  test("renders value with precision 2", () => {
    render(<BarGraph title="Rating" maxValue={5} value={4.2} />);
    expect(screen.getByText("4.2")).toBeInTheDocument();
  });

  test("renders industry average when provided", () => {
    render(
      <BarGraph title="Rating" maxValue={5} value={4} industryAvg={3.5} />,
    );
    expect(screen.getByText("Industry average: 3.5")).toBeInTheDocument();
  });

  test("does not render industry average when not provided", () => {
    render(<BarGraph title="Rating" maxValue={5} value={4} />);
    expect(screen.queryByText(/Industry average/)).not.toBeInTheDocument();
  });
});
