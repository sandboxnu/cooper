import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { InfoIcon } from "~/app/_components/roles/modals/shared/info-icon";

describe("InfoIcon", () => {
  test("renders the info trigger button", () => {
    render(<InfoIcon tooltip="Helpful hint" />);
    const button = screen.getByRole("button", { name: "More info" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("i");
  });

  test("tooltip is hidden until hovered", () => {
    render(<InfoIcon tooltip="Helpful hint" />);
    expect(screen.queryByText("Helpful hint")).not.toBeInTheDocument();
  });

  test("shows tooltip on hover and hides it when the pointer leaves", () => {
    render(<InfoIcon tooltip="Helpful hint" />);
    const button = screen.getByRole("button", { name: "More info" });

    fireEvent.mouseEnter(button);
    expect(screen.getByText("Helpful hint")).toBeInTheDocument();

    fireEvent.mouseLeave(button);
    expect(screen.queryByText("Helpful hint")).not.toBeInTheDocument();
  });

  test("renders rich tooltip content", () => {
    render(<InfoIcon tooltip={<span data-testid="rich">Rich</span>} />);
    fireEvent.mouseEnter(screen.getByRole("button", { name: "More info" }));
    expect(screen.getByTestId("rich")).toBeInTheDocument();
  });
});
