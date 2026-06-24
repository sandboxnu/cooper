import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Pagination } from "../src/pagination";

describe("Pagination", () => {
  test("renders nothing when there is a single page", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("shows the current page and total", () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />,
    );
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });

  test("disables previous on the first page", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />,
    );
    const prev = screen.getByLabelText("Previous page");
    expect(prev).toBeDisabled();
    fireEvent.click(prev);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  test("disables next on the last page", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={3} totalPages={3} onPageChange={onPageChange} />,
    );
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  test("navigates forward and backward", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />,
    );
    fireEvent.click(screen.getByLabelText("Next page"));
    expect(onPageChange).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByLabelText("Previous page"));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
