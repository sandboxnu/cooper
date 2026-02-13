import React from "react";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

describe("Popover", () => {
  test("renders trigger and hides content by default", () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button type="button">Open</button>
        </PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
  });

  test("shows content when trigger is clicked", () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button type="button">Open</button>
        </PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Popover content")).toBeInTheDocument();
  });

  test("renders content with custom className", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <button type="button">Open</button>
        </PopoverTrigger>
        <PopoverContent className="custom-popover">Content</PopoverContent>
      </Popover>,
    );
    const content = screen.getByText("Content");
    expect(content.closest("[data-state=open]")).toHaveClass("custom-popover");
  });
});
