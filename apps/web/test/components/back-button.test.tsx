import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const back = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back }),
}));

import BackButton from "~/app/_components/back-button";

describe("BackButton", () => {
  test("renders a Go Back button and navigates back on click", () => {
    render(<BackButton />);
    const button = screen.getByRole("button", { name: "Go Back" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(back).toHaveBeenCalledOnce();
  });
});
