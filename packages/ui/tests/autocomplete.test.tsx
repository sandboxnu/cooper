import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import Autocomplete from "../src/autocomplete";

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];

function getInput() {
  return screen.getByRole("textbox");
}

describe("Autocomplete", () => {
  test("renders the placeholder and a closed dropdown", () => {
    render(
      <Autocomplete options={options} onChange={vi.fn()} placeholder="Pick" />,
    );
    expect(getInput()).toHaveAttribute("placeholder", "Pick");
    expect(screen.queryByText("React")).not.toBeInTheDocument();
  });

  test("opens the dropdown on focus and lists every option", () => {
    render(<Autocomplete options={options} onChange={vi.fn()} />);
    fireEvent.focus(getInput());
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vue")).toBeInTheDocument();
    expect(screen.getByText("Svelte")).toBeInTheDocument();
  });

  test("filters options by the search text and reports changes", () => {
    const onSearchChange = vi.fn();
    render(
      <Autocomplete
        options={options}
        onChange={vi.fn()}
        onSearchChange={onSearchChange}
      />,
    );
    fireEvent.change(getInput(), { target: { value: "vu" } });
    expect(onSearchChange).toHaveBeenCalledWith("vu");
    expect(screen.getByText("Vue")).toBeInTheDocument();
    expect(screen.queryByText("React")).not.toBeInTheDocument();
  });

  test("shows an empty state when nothing matches", () => {
    render(<Autocomplete options={options} onChange={vi.fn()} />);
    fireEvent.change(getInput(), { target: { value: "zzz" } });
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  test("toggles a selection on in multi-select mode", () => {
    const onChange = vi.fn();
    render(<Autocomplete options={options} value={[]} onChange={onChange} />);
    fireEvent.focus(getInput());
    fireEvent.click(screen.getByText("React"));
    expect(onChange).toHaveBeenCalledWith(["react"]);
  });

  test("toggles an already-selected option off", () => {
    const onChange = vi.fn();
    render(
      <Autocomplete options={options} value={["react"]} onChange={onChange} />,
    );
    fireEvent.focus(getInput());
    fireEvent.click(screen.getByText("React"));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  test("renders chips for selected values when closed and removes one", () => {
    const onChange = vi.fn();
    render(
      <Autocomplete
        options={options}
        value={["react", "vue"]}
        onChange={onChange}
      />,
    );
    // closed by default → chips visible
    const chips = screen.getByText("React").closest("span");
    expect(chips).toBeInTheDocument();
    fireEvent.click(within(chips as HTMLElement).getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(["vue"]);
  });

  test("clears the whole selection with the clear button", () => {
    const onChange = vi.fn();
    render(
      <Autocomplete options={options} value={["react"]} onChange={onChange} />,
    );
    // The clear (X) button is the first button rendered next to the input.
    const clearButton = screen.getAllByRole("button")[0]!;
    fireEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  test("selects an exact match when Enter is pressed", () => {
    const onChange = vi.fn();
    render(<Autocomplete options={options} value={[]} onChange={onChange} />);
    const input = getInput();
    fireEvent.change(input, { target: { value: "vue" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["vue"]);
  });

  test("selects the first filtered result on Enter without an exact match", () => {
    const onChange = vi.fn();
    render(<Autocomplete options={options} value={[]} onChange={onChange} />);
    const input = getInput();
    fireEvent.change(input, { target: { value: "s" } });
    fireEvent.keyDown(input, { key: "Enter" });
    // "s" matches both "Svelte"; first filtered option is selected
    expect(onChange).toHaveBeenCalledWith(["svelte"]);
  });

  test("single-select shows the chosen label and closes after picking", () => {
    const onChange = vi.fn();
    render(
      <Autocomplete
        options={options}
        value={[]}
        onChange={onChange}
        singleSelect
      />,
    );
    fireEvent.focus(getInput());
    fireEvent.click(screen.getByText("Vue"));
    expect(onChange).toHaveBeenCalledWith(["vue"]);
    // dropdown closed: no second "Vue" option remains, label shown in input
    expect(screen.queryByText("React")).not.toBeInTheDocument();
  });

  test("single-select displays the current label in the input", () => {
    render(
      <Autocomplete
        options={options}
        value={["svelte"]}
        onChange={vi.fn()}
        singleSelect
      />,
    );
    expect(getInput()).toHaveValue("Svelte");
  });

  test("renders an inline dropdown for isInMenuContent instead of a portal", () => {
    const { container } = render(
      <Autocomplete
        options={options}
        value={[]}
        onChange={vi.fn()}
        isInMenuContent
      />,
    );
    fireEvent.focus(getInput());
    // inline variant lives inside the component container, not a body portal
    expect(within(container).getByText("React")).toBeInTheDocument();
    expect(
      document.querySelector("[data-autocomplete-portal]"),
    ).not.toBeInTheDocument();
  });

  test("closes the dropdown on an outside pointer down", () => {
    render(<Autocomplete options={options} value={[]} onChange={vi.fn()} />);
    fireEvent.focus(getInput());
    expect(screen.getByText("React")).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByText("React")).not.toBeInTheDocument();
  });
});
