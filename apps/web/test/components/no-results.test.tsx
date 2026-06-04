import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/companies",
}));

import NoResults from "~/app/_components/no-results";

describe("NoResults", () => {
  test("renders the no results message", () => {
    render(<NoResults />);
    expect(screen.getByText("No Results Found")).toBeInTheDocument();
  });

  test("does not show the clear button by default", () => {
    render(<NoResults />);
    expect(screen.queryByRole("button", { name: "Clear Filters" })).toBeNull();
  });

  test("clears filters by pushing the current pathname", () => {
    render(<NoResults clearFunction />);
    const button = screen.getByRole("button", { name: "Clear Filters" });
    fireEvent.click(button);
    expect(push).toHaveBeenCalledWith("/companies");
  });
});
