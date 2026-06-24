import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import ComboBox from "~/app/_components/combo-box";

const options = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
];

function setup(overrides = {}) {
  const onSelect = vi.fn();
  const onClear = vi.fn();
  render(
    <ComboBox
      defaultLabel="Fruit"
      searchPlaceholder="Search fruit"
      searchEmpty="No fruit"
      valuesAndLabels={options}
      currLabel=""
      onSelect={onSelect}
      {...overrides}
    />,
  );
  return { onSelect, onClear };
}

describe("ComboBox", () => {
  test("shows the default label when nothing is selected", () => {
    setup();
    expect(screen.getByRole("combobox")).toHaveTextContent("Fruit");
  });

  test("shows the current label when one is selected", () => {
    setup({ currLabel: "Banana" });
    expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
  });

  test("renders the clear button and fires onClear", () => {
    const onClear = vi.fn();
    setup({ onClear });
    fireEvent.click(screen.getByLabelText("Clear selection"));
    expect(onClear).toHaveBeenCalledOnce();
  });

  test("renders the form variant", () => {
    setup({ variant: "form" });
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("renders the filtering variant", () => {
    setup({ variant: "filtering" });
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("renders the newForm styling", () => {
    setup({ newForm: true });
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
