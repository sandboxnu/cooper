import React from "react";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "./command";

describe("Command", () => {
  test("Command renders children", () => {
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
        </CommandList>
      </Command>,
    );
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  test("Command applies custom className", () => {
    const { container } = render(
      <Command className="custom-command">
        <CommandList />
      </Command>,
    );
    const command = container.querySelector("[cmdk-root]");
    expect(command).toHaveClass("custom-command");
  });
});

describe("CommandDialog", () => {
  test("CommandDialog renders with open state", () => {
    render(
      <CommandDialog open>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandGroup heading="Suggestions">
            <CommandItem>Item one</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>,
    );
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByText("Item one")).toBeInTheDocument();
  });
});

describe("CommandGroup", () => {
  test("CommandGroup renders heading and items", () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Fruits">
            <CommandItem>Apple</CommandItem>
            <CommandItem>Banana</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText("Fruits")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });
});

describe("CommandItem", () => {
  test("CommandItem is selectable", () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>Select me</CommandItem>
        </CommandList>
      </Command>,
    );
    const item = screen.getByText("Select me");
    fireEvent.click(item);
    expect(item).toHaveAttribute("data-selected", "true");
  });
});

describe("CommandSeparator", () => {
  test("CommandSeparator renders between groups", () => {
    const { container } = render(
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem>A</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup>
            <CommandItem>B</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    const separator = container.querySelector("[cmdk-separator]");
    expect(separator).toBeInTheDocument();
  });
});

describe("CommandShortcut", () => {
  test("CommandShortcut renders shortcut text", () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>
            Save
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText("⌘S")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  test("CommandShortcut applies custom className", () => {
    const { container } = render(
      <Command>
        <CommandList>
          <CommandItem>
            Copy
            <CommandShortcut className="shortcut-class">⌘C</CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>,
    );
    const shortcut = container.querySelector(".shortcut-class");
    expect(shortcut).toBeInTheDocument();
    expect(shortcut).toHaveTextContent("⌘C");
  });
});
