import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import Autocomplete from "./autocomplete";

const defaultOptions = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
  { value: "c", label: "Cherry" },
];

describe("Autocomplete", () => {
  test("renders input with default placeholder", () => {
    const onChange = vi.fn();
    render(<Autocomplete options={defaultOptions} onChange={onChange} />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  test("renders input with custom placeholder", () => {
    const onChange = vi.fn();
    render(
      <Autocomplete
        options={defaultOptions}
        placeholder="Type to search"
        onChange={onChange}
      />,
    );
    expect(screen.getByPlaceholderText("Type to search")).toBeInTheDocument();
  });

  test("shows search icon when empty", () => {
    const onChange = vi.fn();
    render(<Autocomplete options={defaultOptions} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Search...");
    expect(input).toHaveValue("");
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  test("calls onSearchChange when typing", () => {
    const onChange = vi.fn();
    const onSearchChange = vi.fn();
    render(
      <Autocomplete
        options={defaultOptions}
        onChange={onChange}
        onSearchChange={onSearchChange}
      />,
    );
    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "App" } });
    expect(onSearchChange).toHaveBeenCalledWith("App");
  });

  test("opens dropdown on focus and shows options", () => {
    const onChange = vi.fn();
    render(<Autocomplete options={defaultOptions} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Search...");
    fireEvent.focus(input);
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Cherry")).toBeInTheDocument();
  });

  test("filters options by search", () => {
    const onChange = vi.fn();
    render(<Autocomplete options={defaultOptions} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Search...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Ban" } });
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.queryByText("Apple")).not.toBeInTheDocument();
    expect(screen.queryByText("Cherry")).not.toBeInTheDocument();
  });

  test("shows no results when no match", () => {
    const onChange = vi.fn();
    render(<Autocomplete options={defaultOptions} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Search...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "xyz" } });
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  test("calls onChange when option toggled", () => {
    const onChange = vi.fn();
    render(<Autocomplete options={defaultOptions} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Search...");
    fireEvent.focus(input);
    fireEvent.click(screen.getByText("Apple"));
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  test("displays selected value badges", () => {
    const onChange = vi.fn();
    render(
      <Autocomplete
        options={defaultOptions}
        value={["a", "b"]}
        onChange={onChange}
      />,
    );
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  test("calls onChange when removing a selected item via badge button", () => {
    const onChange = vi.fn();
    render(
      <Autocomplete
        options={defaultOptions}
        value={["a", "b"]}
        onChange={onChange}
      />,
    );
    const appleBadge = screen.getByText("Apple").closest("span");
    const removeButton = appleBadge?.querySelector("button");
    if (removeButton) fireEvent.click(removeButton);
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });

  test("clear all button clears search and calls onChange with empty array", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Autocomplete
        options={defaultOptions}
        value={["a"]}
        onChange={onChange}
      />,
    );
    const inputWrapper = container.querySelector(
      ".relative.w-full > .relative",
    );
    const clearButton = inputWrapper?.querySelector("button");
    if (clearButton) fireEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  test("clicking overlay closes dropdown and clears search", () => {
    const onChange = vi.fn();
    render(<Autocomplete options={defaultOptions} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Search...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "App" } });
    expect(screen.getByText("Apple")).toBeInTheDocument();
    const overlay = document.querySelector(".fixed.inset-0");
    if (overlay) fireEvent.click(overlay);
    expect(screen.queryByText("Apple")).not.toBeInTheDocument();
  });
});
