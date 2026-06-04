import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const { useQuery } = vi.hoisted(() => ({ useQuery: vi.fn() }));

// Stand in for the UI Autocomplete: surface the options it receives and let
// tests drive search/selection callbacks without the real portal/dropdown.
vi.mock("@cooper/ui/autocomplete", () => ({
  default: ({
    options,
    value,
    onChange,
    onSearchChange,
  }: {
    options: { value: string; label: string }[];
    value: string[];
    onChange: (v: string[]) => void;
    onSearchChange: (s: string) => void;
  }) => (
    <div data-testid="autocomplete">
      <input
        data-testid="search"
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <ul data-testid="options">
        {options.map((opt) => (
          <li key={opt.value}>{opt.label}</li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...value, "React"])}>
        select-react
      </button>
    </div>
  ),
}));

vi.mock("~/trpc/react", () => ({
  api: { tool: { getCommon: { useQuery } } },
}));

import { ToolsAutocomplete } from "~/app/_components/form/sections/tools-autocomplete";

describe("ToolsAutocomplete", () => {
  test("maps common tools from the query into options", () => {
    useQuery.mockReturnValue({
      data: [{ name: "React" }, { name: "Figma" }],
    });
    render(<ToolsAutocomplete value={[]} onChange={vi.fn()} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Figma")).toBeInTheDocument();
  });

  test("keeps selected custom values as options even when not common", () => {
    useQuery.mockReturnValue({ data: [{ name: "React" }] });
    render(<ToolsAutocomplete value={["Custom Tool"]} onChange={vi.fn()} />);
    expect(screen.getByText("Custom Tool")).toBeInTheDocument();
  });

  test("appends the trimmed search term as a new option", () => {
    useQuery.mockReturnValue({ data: [{ name: "React" }] });
    render(<ToolsAutocomplete value={[]} onChange={vi.fn()} />);
    fireEvent.change(screen.getByTestId("search"), {
      target: { value: "  Postman  " },
    });
    expect(screen.getByText("Postman")).toBeInTheDocument();
  });

  test("does not duplicate an option that already exists for the search", () => {
    useQuery.mockReturnValue({ data: [{ name: "React" }] });
    render(<ToolsAutocomplete value={[]} onChange={vi.fn()} />);
    fireEvent.change(screen.getByTestId("search"), {
      target: { value: "react" },
    });
    expect(screen.getAllByText(/^React$/)).toHaveLength(1);
  });

  test("forwards selection changes through onChange", () => {
    useQuery.mockReturnValue({ data: [{ name: "React" }] });
    const onChange = vi.fn();
    render(<ToolsAutocomplete value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("select-react"));
    expect(onChange).toHaveBeenCalledWith(["React"]);
  });

  test("renders without options when the query has no data", () => {
    useQuery.mockReturnValue({ data: undefined });
    render(<ToolsAutocomplete value={[]} onChange={vi.fn()} />);
    expect(screen.getByTestId("options").children).toHaveLength(0);
  });
});
