import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/roles",
}));

import SearchFilter from "~/app/_components/search/search-filter";

describe("SearchFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, "", "/roles");
  });

  test("renders the embedded search bar", () => {
    render(<SearchFilter />);
    expect(
      screen.getByPlaceholderText("Search for a job, company, industry..."),
    ).toBeInTheDocument();
  });

  test("applies the passed className to the form", () => {
    const { container } = render(<SearchFilter className="my-search" />);
    expect(container.querySelector("form")).toHaveClass("my-search");
  });

  test("submitting pushes the pathname with the search query param", async () => {
    const { container } = render(<SearchFilter />);
    const input = screen.getByPlaceholderText(
      "Search for a job, company, industry...",
    );
    fireEvent.change(input, { target: { value: "nvidia" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/roles?search=nvidia"),
    );
  });

  test("clears stale company and role params on submit", async () => {
    window.history.pushState({}, "", "/roles?company=abc&role=xyz");
    const { container } = render(<SearchFilter />);
    const input = screen.getByPlaceholderText(
      "Search for a job, company, industry...",
    );
    fireEvent.change(input, { target: { value: "apple" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/roles?search=apple"),
    );
  });
});
