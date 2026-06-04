import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@cooper/ui/autocomplete", () => ({
  default: ({ placeholder }: { placeholder?: string }) => (
    <input aria-label="autocomplete-search" placeholder={placeholder} />
  ),
}));

import SidebarSection from "~/app/_components/filters/sidebar-section";

const options = [
  { id: "a", label: "Apple", value: "apple" },
  { id: "b", label: "Banana", value: "banana" },
];

describe("SidebarSection", () => {
  test("renders title and Clear button in main variant", () => {
    render(
      <SidebarSection
        title="Fruit"
        options={options}
        selectedOptions={[]}
        onSelectionChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Fruit")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
    // default checkbox variant shows options
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  test("does not render Clear button in subsection variant", () => {
    render(
      <SidebarSection
        title="Sub"
        options={options}
        selectedOptions={[]}
        variant="subsection"
        onSelectionChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Sub")).toBeInTheDocument();
    expect(screen.queryByText("Clear")).toBeNull();
  });

  test("Clear calls onSelectionChange with empty array for checkbox", () => {
    const onSelectionChange = vi.fn();
    render(
      <SidebarSection
        title="Fruit"
        options={options}
        selectedOptions={["a"]}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(screen.getByText("Clear"));
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  test("Clear calls onRangeChange(0,0) for range filterType", () => {
    const onRangeChange = vi.fn();
    render(
      <SidebarSection
        title="Pay"
        filterType="range"
        options={[]}
        selectedOptions={[]}
        minValue={10}
        maxValue={20}
        onRangeChange={onRangeChange}
      />,
    );
    fireEvent.click(screen.getByText("Clear"));
    expect(onRangeChange).toHaveBeenCalledWith(0, 0);
  });

  test("renders rating variant", () => {
    render(
      <SidebarSection
        title="Rating"
        filterType="rating"
        options={[]}
        selectedOptions={[]}
        onSelectionChange={vi.fn()}
      />,
    );
    expect(screen.getByText("1.0")).toBeInTheDocument();
  });

  test("renders autocomplete variant via FilterBody", () => {
    render(
      <SidebarSection
        title="Industry"
        filterType="autocomplete"
        options={options}
        selectedOptions={[]}
        portalZIndex={60}
        onSelectionChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("autocomplete-search")).toBeInTheDocument();
  });
});
