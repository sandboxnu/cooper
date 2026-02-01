import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import BackButton from "~/app/_components/back-button";

const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe("BackButton", () => {
  test("renders Go Back button", () => {
    render(<BackButton />);
    expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
  });

  test("calls router.back on click", () => {
    render(<BackButton />);
    fireEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
