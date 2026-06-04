import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { TabToggle } from "~/app/_components/roles/modals/shared/tab-toggle";

describe("TabToggle", () => {
  test("renders both tabs", () => {
    render(<TabToggle activeTab="total" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Total" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Industry" }),
    ).toBeInTheDocument();
  });

  test("highlights the active tab", () => {
    render(<TabToggle activeTab="industry" onChange={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Industry" }).className,
    ).toContain("bg-cooper-gray-125");
    expect(screen.getByRole("button", { name: "Total" }).className).toContain(
      "bg-white",
    );
  });

  test("calls onChange with 'total' when Total is clicked", () => {
    const onChange = vi.fn();
    render(<TabToggle activeTab="industry" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Total" }));
    expect(onChange).toHaveBeenCalledWith("total");
  });

  test("calls onChange with 'industry' when Industry is clicked", () => {
    const onChange = vi.fn();
    render(<TabToggle activeTab="total" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Industry" }));
    expect(onChange).toHaveBeenCalledWith("industry");
  });
});
