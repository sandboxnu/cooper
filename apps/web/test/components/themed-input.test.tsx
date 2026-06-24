import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Input } from "~/app/_components/themed/onboarding/input";

describe("themed Input", () => {
  test("renders the underlying input with passed props", () => {
    render(<Input placeholder="Your name" />);
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
  });

  test("does not render a clear button without onClear", () => {
    render(<Input placeholder="Your name" />);
    expect(
      screen.queryByRole("button", { name: "Clear input" }),
    ).not.toBeInTheDocument();
  });

  test("renders and fires the clear button when onClear is provided", () => {
    const onClear = vi.fn();
    render(<Input placeholder="Your name" onClear={onClear} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear input" }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
