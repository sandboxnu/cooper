import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { PipCard } from "~/app/_components/roles/modals/shared/pip-card";

describe("PipCard", () => {
  test("renders the name and subtext", () => {
    render(
      <PipCard
        name="Work-life balance"
        subtext="How sustainable the hours were"
        filledCount={3}
        totalCount={5}
        filledColor="rgb(0, 128, 0)"
      />,
    );
    expect(screen.getByText("Work-life balance")).toBeInTheDocument();
    expect(
      screen.getByText("How sustainable the hours were"),
    ).toBeInTheDocument();
  });

  test("renders the pip bar with the requested number of pips", () => {
    const { container } = render(
      <PipCard
        name="Culture"
        subtext="sub"
        filledCount={1}
        totalCount={3}
        filledColor="rgb(0, 128, 0)"
      />,
    );
    // Each pip rendered by the embedded PipBar carries the h-9 class.
    expect(container.querySelectorAll(".h-9")).toHaveLength(3);
  });

  test("omits the footer region when no footer is provided", () => {
    render(
      <PipCard
        name="Culture"
        subtext="sub"
        filledCount={1}
        totalCount={3}
        filledColor="rgb(0, 128, 0)"
      />,
    );
    expect(screen.queryByText("footer text")).not.toBeInTheDocument();
  });

  test("renders the footer when provided", () => {
    render(
      <PipCard
        name="Culture"
        subtext="sub"
        filledCount={1}
        totalCount={3}
        filledColor="rgb(0, 128, 0)"
        footer={<span>footer text</span>}
      />,
    );
    expect(screen.getByText("footer text")).toBeInTheDocument();
  });
});
