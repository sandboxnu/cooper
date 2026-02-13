import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ComboBox from "~/app/_components/combo-box";

const defaultProps = {
  defaultLabel: "Select option",
  searchPlaceholder: "Search...",
  searchEmpty: "No results.",
  valuesAndLabels: [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
    { value: "c", label: "Option C" },
  ],
  currLabel: "",
  onSelect: vi.fn(),
};

describe("ComboBox", () => {
  test("renders trigger with default label when currLabel is empty", () => {
    render(<ComboBox {...defaultProps} />);
    expect(screen.getByText("Select option")).toBeInTheDocument();
  });

  test("renders trigger with currLabel when set", () => {
    render(<ComboBox {...defaultProps} currLabel="Option B" />);
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  test("opens popover and shows options when trigger clicked", () => {
    render(<ComboBox {...defaultProps} />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
    expect(screen.getByText("Option C")).toBeInTheDocument();
  });

  test("calls onSelect when option clicked", () => {
    const onSelect = vi.fn();
    render(<ComboBox {...defaultProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Option B"));
    expect(onSelect).toHaveBeenCalledWith("Option B");
  });

  test("shows search empty message when no match", () => {
    render(<ComboBox {...defaultProps} />);
    fireEvent.click(screen.getByRole("combobox"));
    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "zzz" } });
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  test("renders Clear selection button when onClear provided", () => {
    const onClear = vi.fn();
    render(
      <ComboBox {...defaultProps} currLabel="Option A" onClear={onClear} />,
    );
    expect(screen.getByLabelText("Clear selection")).toBeInTheDocument();
  });

  test("calls onClear when clear button clicked", () => {
    const onClear = vi.fn();
    render(
      <ComboBox {...defaultProps} currLabel="Option A" onClear={onClear} />,
    );
    fireEvent.click(screen.getByLabelText("Clear selection"));
    expect(onClear).toHaveBeenCalled();
  });

  test("calls onChange when typing in search", () => {
    const onChange = vi.fn();
    render(<ComboBox {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByRole("combobox"));
    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "test" } });
    expect(onChange).toHaveBeenCalledWith("test");
  });
});
