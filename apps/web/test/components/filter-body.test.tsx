import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

// Mock the heavy Autocomplete (portal-based) with a simple controllable stub.
vi.mock("@cooper/ui/autocomplete", () => ({
  default: ({
    options,
    value,
    onChange,
    onSearchChange,
    placeholder,
  }: {
    options: { value: string; label: string }[];
    value?: string[];
    onChange: (v: string[]) => void;
    onSearchChange?: (s: string) => void;
    placeholder?: string;
  }) => (
    <div>
      <input
        aria-label="autocomplete-search"
        placeholder={placeholder}
        onChange={(e) => onSearchChange?.(e.target.value)}
      />
      <span data-testid="autocomplete-value">{(value ?? []).join(",")}</span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange([...(value ?? []), o.value])}
        >
          ac-{o.label}
        </button>
      ))}
    </div>
  ),
}));

import FilterBody from "~/app/_components/filters/filter-body";

const options = [
  { id: "a", label: "Apple", value: "apple" },
  { id: "b", label: "Banana", value: "banana" },
];

describe("FilterBody - checkbox", () => {
  test("renders options and toggles selection on", () => {
    const onSelectionChange = vi.fn();
    render(
      <FilterBody
        variant="checkbox"
        title="Fruit"
        options={options}
        selectedOptions={[]}
        onSelectionChange={onSelectionChange}
      />,
    );
    expect(screen.getByText("Apple")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Apple"));
    expect(onSelectionChange).toHaveBeenCalledWith(["a"]);
  });

  test("toggles a selected option off", () => {
    const onSelectionChange = vi.fn();
    render(
      <FilterBody
        variant="checkbox"
        title="Fruit"
        options={options}
        selectedOptions={["a"]}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(screen.getByText("Apple"));
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  test("no-op when onSelectionChange is missing", () => {
    render(
      <FilterBody
        variant="checkbox"
        title="Fruit"
        options={options}
        selectedOptions={[]}
      />,
    );
    // Should not throw
    fireEvent.click(screen.getByText("Apple"));
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  test("shows a search box and filters when more than 5 options", () => {
    const many = Array.from({ length: 6 }, (_, i) => ({
      id: `id${i}`,
      label: `Label${i}`,
    }));
    render(
      <FilterBody
        variant="checkbox"
        title="Many"
        options={many}
        selectedOptions={[]}
        onSelectionChange={vi.fn()}
      />,
    );
    const search = screen.getByPlaceholderText("Search...");
    fireEvent.change(search, { target: { value: "Label1" } });
    expect(screen.getByText("Label1")).toBeInTheDocument();
    expect(screen.queryByText("Label2")).toBeNull();
  });

  test("defaults to checkbox for unknown variant", () => {
    render(
      <FilterBody
        // @ts-expect-error testing default branch
        variant="something-else"
        title="Fruit"
        options={options}
        selectedOptions={[]}
        onSelectionChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });
});

describe("FilterBody - rating", () => {
  test("renders 5 star buttons", () => {
    render(
      <FilterBody
        variant="rating"
        title="Rating"
        options={[]}
        selectedOptions={[]}
        onSelectionChange={vi.fn()}
      />,
    );
    expect(screen.getByText("1.0")).toBeInTheDocument();
    expect(screen.getByText("5.0")).toBeInTheDocument();
  });

  test("first click selects a single rating", () => {
    const onSelectionChange = vi.fn();
    render(
      <FilterBody
        variant="rating"
        title="Rating"
        options={[]}
        selectedOptions={[]}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(screen.getByText("3.0"));
    expect(onSelectionChange).toHaveBeenCalledWith(["3"]);
  });

  test("clicking the same single rating clears it", () => {
    const onSelectionChange = vi.fn();
    render(
      <FilterBody
        variant="rating"
        title="Rating"
        options={[]}
        selectedOptions={["3"]}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(screen.getByText("3.0"));
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  test("clicking a different rating builds a range", () => {
    const onSelectionChange = vi.fn();
    render(
      <FilterBody
        variant="rating"
        title="Rating"
        options={[]}
        selectedOptions={["2"]}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(screen.getByText("4.0"));
    expect(onSelectionChange).toHaveBeenCalledWith(["2", "3", "4"]);
  });

  test("clicking with an existing range resets to single", () => {
    const onSelectionChange = vi.fn();
    render(
      <FilterBody
        variant="rating"
        title="Rating"
        options={[]}
        selectedOptions={["2", "3", "4"]}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(screen.getByText("5.0"));
    expect(onSelectionChange).toHaveBeenCalledWith(["5"]);
  });

  test("no-op when onSelectionChange missing", () => {
    render(
      <FilterBody
        variant="rating"
        title="Rating"
        options={[]}
        selectedOptions={[]}
      />,
    );
    fireEvent.click(screen.getByText("1.0"));
    expect(screen.getByText("1.0")).toBeInTheDocument();
  });
});

describe("FilterBody - range", () => {
  test("renders empty inputs when default range (0,0)", () => {
    const { container } = render(
      <FilterBody
        variant="range"
        title="Pay"
        options={[]}
        selectedOptions={[]}
        minValue={0}
        maxValue={0}
        onRangeChange={vi.fn()}
      />,
    );
    const min = container.querySelector<HTMLInputElement>("#min")!;
    const max = container.querySelector<HTMLInputElement>("#max")!;
    expect(min.value).toBe("");
    expect(max.value).toBe("");
  });

  test("applies a valid range on blur", () => {
    const onRangeChange = vi.fn();
    const { container } = render(
      <FilterBody
        variant="range"
        title="Pay"
        options={[]}
        selectedOptions={[]}
        minValue={0}
        maxValue={0}
        onRangeChange={onRangeChange}
      />,
    );
    const minInput = container.querySelector("#min")!;
    const maxInput = container.querySelector("#max")!;
    fireEvent.change(minInput, { target: { value: "10" } });
    fireEvent.change(maxInput, { target: { value: "20" } });
    fireEvent.blur(maxInput);
    expect(onRangeChange).toHaveBeenCalledWith(10, 20);
  });

  test("shows error and does not apply when min >= max", () => {
    const onRangeChange = vi.fn();
    const { container } = render(
      <FilterBody
        variant="range"
        title="Pay"
        options={[]}
        selectedOptions={[]}
        minValue={0}
        maxValue={0}
        onRangeChange={onRangeChange}
      />,
    );
    const minInput = container.querySelector("#min")!;
    const maxInput = container.querySelector("#max")!;
    fireEvent.change(minInput, { target: { value: "30" } });
    fireEvent.change(maxInput, { target: { value: "20" } });
    fireEvent.blur(maxInput);
    expect(
      screen.getByText("Minimum must be less than maximum"),
    ).toBeInTheDocument();
    expect(onRangeChange).not.toHaveBeenCalled();
  });

  test("clears the range when both inputs are empty", () => {
    const onRangeChange = vi.fn();
    const { container } = render(
      <FilterBody
        variant="range"
        title="Pay"
        options={[]}
        selectedOptions={[]}
        minValue={10}
        maxValue={20}
        onRangeChange={onRangeChange}
      />,
    );
    const minInput = container.querySelector("#min")!;
    const maxInput = container.querySelector("#max")!;
    fireEvent.change(minInput, { target: { value: "" } });
    fireEvent.change(maxInput, { target: { value: "" } });
    fireEvent.blur(maxInput);
    expect(onRangeChange).toHaveBeenCalledWith(0, 0);
  });

  test("applies min-only range (max becomes Infinity)", () => {
    const onRangeChange = vi.fn();
    const { container } = render(
      <FilterBody
        variant="range"
        title="Pay"
        options={[]}
        selectedOptions={[]}
        minValue={0}
        maxValue={0}
        onRangeChange={onRangeChange}
      />,
    );
    const minInput = container.querySelector("#min")!;
    fireEvent.change(minInput, { target: { value: "15" } });
    fireEvent.blur(minInput);
    expect(onRangeChange).toHaveBeenCalledWith(15, Infinity);
  });

  test("applies on Enter key", () => {
    const onRangeChange = vi.fn();
    const { container } = render(
      <FilterBody
        variant="range"
        title="Pay"
        options={[]}
        selectedOptions={[]}
        minValue={0}
        maxValue={0}
        onRangeChange={onRangeChange}
      />,
    );
    const minInput = container.querySelector("#min")!;
    fireEvent.change(minInput, { target: { value: "5" } });
    fireEvent.keyDown(minInput, { key: "Enter" });
    expect(onRangeChange).toHaveBeenCalledWith(5, Infinity);
  });

  test("syncs local inputs from non-default props", () => {
    const { container } = render(
      <FilterBody
        variant="range"
        title="Pay"
        options={[]}
        selectedOptions={[]}
        minValue={12}
        maxValue={34}
        onRangeChange={vi.fn()}
      />,
    );
    const minInput = container.querySelector<HTMLInputElement>("#min")!;
    const maxInput = container.querySelector<HTMLInputElement>("#max")!;
    expect(minInput.value).toBe("12");
    expect(maxInput.value).toBe("34");
  });

  test("no-op when onRangeChange missing", () => {
    const { container } = render(
      <FilterBody
        variant="range"
        title="Pay"
        options={[]}
        selectedOptions={[]}
        minValue={0}
        maxValue={0}
      />,
    );
    const minInput = container.querySelector("#min")!;
    fireEvent.change(minInput, { target: { value: "5" } });
    fireEvent.blur(minInput);
    // does not throw
    expect(minInput).toBeDefined();
  });
});

describe("FilterBody - autocomplete & location", () => {
  test("autocomplete passes options through and reports selection", () => {
    const onSelectionChange = vi.fn();
    render(
      <FilterBody
        variant="autocomplete"
        title="Industry"
        options={options}
        selectedOptions={[]}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(screen.getByText("ac-Apple"));
    expect(onSelectionChange).toHaveBeenCalledWith(["apple"]);
  });

  test("autocomplete forwards search changes", () => {
    const onSearchChange = vi.fn();
    render(
      <FilterBody
        variant="autocomplete"
        title="Industry"
        options={options}
        selectedOptions={[]}
        onSearchChange={onSearchChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("autocomplete-search"), {
      target: { value: "ap" },
    });
    expect(onSearchChange).toHaveBeenCalledWith("ap");
  });

  test("location variant reports selection using id", () => {
    const onSelectionChange = vi.fn();
    render(
      <FilterBody
        variant="location"
        title="Location"
        options={options}
        selectedOptions={[]}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(screen.getByText("ac-Apple"));
    expect(onSelectionChange).toHaveBeenCalledWith(["a"]);
  });
});
