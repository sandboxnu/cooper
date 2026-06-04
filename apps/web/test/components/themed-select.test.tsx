import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Select } from "~/app/_components/themed/onboarding/select";

const options = [
  { value: "co-op", label: "Co-op" },
  { value: "intern", label: "Internship" },
];

describe("themed Select", () => {
  test("renders an option per item", () => {
    render(<Select options={options} />);
    expect(screen.getByRole("option", { name: "Co-op" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Internship" }),
    ).toBeInTheDocument();
  });

  test("renders the placeholder as a hidden option", () => {
    render(<Select options={options} placeholder="Select a type" />);
    const placeholder = screen.getByText("Select a type");
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveValue("");
  });

  test("fires onChange when a value is selected", () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "intern" },
    });
    expect(onChange).toHaveBeenCalled();
  });

  test("renders and fires the clear button when onClear is provided", () => {
    const onClear = vi.fn();
    render(<Select options={options} onClear={onClear} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  test("omits the clear button without onClear", () => {
    render(<Select options={options} />);
    expect(
      screen.queryByRole("button", { name: "Clear selection" }),
    ).not.toBeInTheDocument();
  });
});
