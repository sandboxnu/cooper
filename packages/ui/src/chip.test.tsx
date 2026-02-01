import React from "react";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Chip } from "./chip";

describe("Chip", () => {
  test("renders label", () => {
    render(<Chip label="Test chip" />);
    expect(
      screen.getByRole("button", { name: "Test chip" }),
    ).toBeInTheDocument();
  });

  test("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Chip label="Click me" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "Click me" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("applies selected styles when selected is true", () => {
    const { container } = render(<Chip label="Selected" selected />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-cooper-cream-300");
  });

  test("applies default styles when selected is false", () => {
    const { container } = render(
      <Chip label="Not selected" selected={false} />,
    );
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-white");
  });
});
