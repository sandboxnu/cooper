import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import RoleTypeSelector from "~/app/_components/filters/role-type-selector";

function setup(selectedType: "roles" | "companies" | "all" = "all") {
  const onSelectedTypeChange = vi.fn();
  render(
    <RoleTypeSelector
      selectedType={selectedType}
      onSelectedTypeChange={onSelectedTypeChange}
    />,
  );
  return { onSelectedTypeChange };
}

describe("RoleTypeSelector", () => {
  test("renders all three chips", () => {
    setup();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Jobs")).toBeInTheDocument();
    expect(screen.getByText("Companies")).toBeInTheDocument();
  });

  test("clicking All selects all", () => {
    const { onSelectedTypeChange } = setup("roles");
    fireEvent.click(screen.getByText("All"));
    expect(onSelectedTypeChange).toHaveBeenCalledWith("all");
  });

  test("clicking Jobs from all selects roles", () => {
    const { onSelectedTypeChange } = setup("all");
    fireEvent.click(screen.getByText("Jobs"));
    expect(onSelectedTypeChange).toHaveBeenCalledWith("roles");
  });

  test("clicking Jobs when already roles toggles back to all", () => {
    const { onSelectedTypeChange } = setup("roles");
    fireEvent.click(screen.getByText("Jobs"));
    expect(onSelectedTypeChange).toHaveBeenCalledWith("all");
  });

  test("clicking Companies from all selects companies", () => {
    const { onSelectedTypeChange } = setup("all");
    fireEvent.click(screen.getByText("Companies"));
    expect(onSelectedTypeChange).toHaveBeenCalledWith("companies");
  });

  test("clicking Companies when already companies toggles back to all", () => {
    const { onSelectedTypeChange } = setup("companies");
    fireEvent.click(screen.getByText("Companies"));
    expect(onSelectedTypeChange).toHaveBeenCalledWith("all");
  });
});
