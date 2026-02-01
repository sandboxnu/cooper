import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import SearchFilter from "~/app/_components/search/search-filter";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/roles",
}));

describe("SearchFilter", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  test("renders search input", () => {
    render(<SearchFilter />);
    expect(
      screen.getByPlaceholderText("Search for a job, company, industry..."),
    ).toBeInTheDocument();
  });

  test("renders form with search input that accepts text", () => {
    render(<SearchFilter />);
    const input = screen.getByPlaceholderText(
      "Search for a job, company, industry...",
    );
    fireEvent.change(input, { target: { value: "co-op" } });
    expect(input).toHaveValue("co-op");
  });

  test("applies className when provided", () => {
    const { container } = render(<SearchFilter className="custom-class" />);
    const form = container.querySelector("form");
    expect(form).toHaveClass("custom-class");
  });
});
