import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@cooper/ui/autocomplete", () => ({
  default: ({ placeholder }: { placeholder?: string }) => (
    <input aria-label="autocomplete-search" placeholder={placeholder} />
  ),
}));

import DropdownFilter, {
  FilterPanelContent,
} from "~/app/_components/filters/dropdown-filter";

const options = [
  { id: "a", label: "Apple", value: "apple" },
  { id: "b", label: "Banana", value: "banana" },
];

describe("DropdownFilter - trigger / display text", () => {
  test("shows the title when nothing selected (checkbox)", () => {
    render(
      <DropdownFilter
        title="Job type"
        options={options}
        selectedOptions={[]}
      />,
    );
    expect(screen.getByText("Job type")).toBeInTheDocument();
  });

  test("shows first selected label for checkbox", () => {
    render(
      <DropdownFilter
        title="Job type"
        options={options}
        selectedOptions={["a"]}
      />,
    );
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  test("shows +N when multiple selected", () => {
    render(
      <DropdownFilter
        title="Job type"
        options={options}
        selectedOptions={["a", "b"]}
      />,
    );
    expect(screen.getByText("Apple +1")).toBeInTheDocument();
  });

  test("falls back to the raw id when label not found", () => {
    render(
      <DropdownFilter
        title="Job type"
        options={[]}
        selectedOptions={["missing"]}
      />,
    );
    expect(screen.getByText("missing")).toBeInTheDocument();
  });

  test("range display: title when no range", () => {
    render(
      <DropdownFilter
        title="Hourly pay"
        filterType="range"
        options={[]}
        selectedOptions={[]}
        minValue={0}
        maxValue={0}
      />,
    );
    expect(screen.getByText("Hourly pay")).toBeInTheDocument();
  });

  test("range display: both min and max", () => {
    render(
      <DropdownFilter
        title="Hourly pay"
        filterType="range"
        options={[]}
        selectedOptions={[]}
        minValue={10}
        maxValue={20}
      />,
    );
    expect(screen.getByText("$10-20/hr")).toBeInTheDocument();
  });

  test("range display: min only", () => {
    render(
      <DropdownFilter
        title="Hourly pay"
        filterType="range"
        options={[]}
        selectedOptions={[]}
        minValue={10}
        maxValue={0}
      />,
    );
    expect(screen.getByText("$10/hr+")).toBeInTheDocument();
  });

  test("range display: max only", () => {
    render(
      <DropdownFilter
        title="Hourly pay"
        filterType="range"
        options={[]}
        selectedOptions={[]}
        minValue={0}
        maxValue={20}
      />,
    );
    expect(screen.getByText("Up to $20/hr")).toBeInTheDocument();
  });

  test("range display: Infinity max treated as no max", () => {
    render(
      <DropdownFilter
        title="Hourly pay"
        filterType="range"
        options={[]}
        selectedOptions={[]}
        minValue={10}
        maxValue={Infinity}
      />,
    );
    expect(screen.getByText("$10/hr+")).toBeInTheDocument();
  });

  test("rating display: title when none selected", () => {
    render(
      <DropdownFilter
        title="Overall rating"
        filterType="rating"
        options={[]}
        selectedOptions={[]}
      />,
    );
    expect(screen.getByText("Overall rating")).toBeInTheDocument();
  });

  test("rating display: single rating", () => {
    render(
      <DropdownFilter
        title="Overall rating"
        filterType="rating"
        options={[]}
        selectedOptions={["3"]}
      />,
    );
    expect(screen.getByText("3.0+ stars")).toBeInTheDocument();
  });

  test("rating display: range of ratings shows star image", () => {
    render(
      <DropdownFilter
        title="Overall rating"
        filterType="rating"
        options={[]}
        selectedOptions={["2", "3", "4"]}
      />,
    );
    expect(screen.getByAltText("Star icon")).toBeInTheDocument();
  });
});

describe("DropdownFilter - triggerOnly mode", () => {
  test("renders only the trigger and fires onTriggerClick", () => {
    const onTriggerClick = vi.fn();
    render(
      <DropdownFilter
        title="Industry"
        options={options}
        selectedOptions={[]}
        triggerOnly
        onTriggerClick={onTriggerClick}
      />,
    );
    fireEvent.click(screen.getByText("Industry"));
    expect(onTriggerClick).toHaveBeenCalledOnce();
  });
});

describe("DropdownFilter - dropdown content (uncontrolled)", () => {
  test("opens on trigger click and shows the title and Clear in the panel", () => {
    render(
      <DropdownFilter
        title="Job type"
        options={options}
        selectedOptions={["a"]}
        onSelectionChange={vi.fn()}
      />,
    );
    fireEvent.pointerDown(screen.getByText("Apple"));
    // panel header Clear button appears
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  test("Clear in panel calls onSelectionChange with empty array", () => {
    const onSelectionChange = vi.fn();
    render(
      <DropdownFilter
        title="Job type"
        options={options}
        selectedOptions={["a"]}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.pointerDown(screen.getByText("Apple"));
    fireEvent.click(screen.getByText("Clear"));
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  test("Clear for range also resets the range", () => {
    const onSelectionChange = vi.fn();
    const onRangeChange = vi.fn();
    render(
      <DropdownFilter
        title="Hourly pay"
        filterType="range"
        options={[]}
        selectedOptions={[]}
        minValue={10}
        maxValue={20}
        onSelectionChange={onSelectionChange}
        onRangeChange={onRangeChange}
      />,
    );
    fireEvent.pointerDown(screen.getByText("$10-20/hr"));
    fireEvent.click(screen.getByText("Clear"));
    expect(onRangeChange).toHaveBeenCalledWith(0, 0);
  });
});

describe("DropdownFilter - controlled open", () => {
  test("uses controlled open value and calls onOpenChange", () => {
    const onOpenChange = vi.fn();
    render(
      <DropdownFilter
        title="Job type"
        options={options}
        selectedOptions={[]}
        open={true}
        onOpenChange={onOpenChange}
        onSelectionChange={vi.fn()}
      />,
    );
    // Open: panel content visible
    expect(screen.getByText("Clear")).toBeInTheDocument();
    // The X close button calls setIsOpen(false) -> onOpenChange(false)
    const buttons = screen.getAllByRole("button");
    // click the close (X) button - it's the last button in the header area
    fireEvent.click(buttons[buttons.length - 1]!);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("FilterPanelContent", () => {
  test("renders title, body, and Clear", () => {
    const onSelectionChange = vi.fn();
    render(
      <FilterPanelContent
        title="Job type"
        options={options}
        selectedOptions={["a"]}
        onSelectionChange={onSelectionChange}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Job type")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Clear"));
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  test("Clear resets range for range filter type", () => {
    const onRangeChange = vi.fn();
    render(
      <FilterPanelContent
        title="Hourly pay"
        filterType="range"
        options={[]}
        selectedOptions={[]}
        minValue={5}
        maxValue={10}
        onRangeChange={onRangeChange}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Clear"));
    expect(onRangeChange).toHaveBeenCalledWith(0, 0);
  });

  test("close button calls onClose", () => {
    const onClose = vi.fn();
    render(
      <FilterPanelContent
        title="Job type"
        options={options}
        selectedOptions={[]}
        onSelectionChange={vi.fn()}
        onClose={onClose}
      />,
    );
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]!);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
