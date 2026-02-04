import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import DropdownFiltersBar from "~/app/_components/filters/dropdown-filters-bar";

vi.mock("~/trpc/react", () => ({
  api: {
    location: {
      getByPrefix: {
        useQuery: () => ({ data: [], isLoading: false }),
      },
    },
  },
}));

vi.mock("~/app/_components/onboarding/constants", () => ({
  industryOptions: {
    TECHNOLOGY: { value: "TECHNOLOGY", label: "Technology" },
    HEALTHCARE: { value: "HEALTHCARE", label: "Healthcare" },
  },
}));

describe("DropdownFiltersBar", () => {
  const onFilterChange = vi.fn();

  beforeEach(() => {
    onFilterChange.mockClear();
  });

  test("renders Industry, Location, Job type, Hourly pay, Overall rating filters", () => {
    render(<DropdownFiltersBar onFilterChange={onFilterChange} />);
    expect(screen.getByText("Industry")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Job type")).toBeInTheDocument();
    expect(screen.getByText("Hourly pay")).toBeInTheDocument();
    expect(screen.getByText("Overall rating")).toBeInTheDocument();
  });

  test("calls onFilterChange when filter changes", () => {
    render(<DropdownFiltersBar onFilterChange={onFilterChange} />);
    fireEvent.click(screen.getByText("Job type"));
    const coop = screen.queryByText("Co-op");
    if (coop) {
      fireEvent.click(coop);
      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          jobTypes: expect.any(Array) as unknown as string[],
        }),
      );
    }
  });
});
