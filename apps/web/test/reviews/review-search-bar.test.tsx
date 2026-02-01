import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ReviewSearchBar from "~/app/_components/reviews/review-search-bar";

describe("ReviewSearchBar", () => {
  test("renders input with placeholder", () => {
    render(
      <ReviewSearchBar searchTerm="" onSearchChange={() => {}} />,
    );
    expect(
      screen.getByPlaceholderText("Search reviews..."),
    ).toBeInTheDocument();
  });

  test("displays initial search term", () => {
    render(
      <ReviewSearchBar
        searchTerm="co-op"
        onSearchChange={() => {}}
      />,
    );
    const input = screen.getByPlaceholderText("Search reviews...");
    expect(input).toHaveValue("co-op");
  });

  test("calls onSearchChange when user types", () => {
    const onSearchChange = vi.fn();
    render(
      <ReviewSearchBar searchTerm="" onSearchChange={onSearchChange} />,
    );
    const input = screen.getByPlaceholderText("Search reviews...");
    fireEvent.change(input, { target: { value: "test" } });
    expect(onSearchChange).toHaveBeenCalledWith("test");
  });

  test("applies className when provided", () => {
    const { container } = render(
      <ReviewSearchBar
        searchTerm=""
        onSearchChange={() => {}}
        className="custom-class"
      />,
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("custom-class");
  });
});
