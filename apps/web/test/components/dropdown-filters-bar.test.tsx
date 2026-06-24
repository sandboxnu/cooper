import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { FilterState } from "~/app/_components/filters/types";

// Mutable result for the popularity query plus a record of how useQueries was
// invoked, so tests can drive both location code paths.
const h = vi.hoisted(() => {
  const locationQuery: {
    data: { id: string; label: string }[] | undefined;
  } = { data: undefined };
  const selectedLocationData: unknown[] = [];
  return { locationQuery, selectedLocationData };
});

vi.mock("~/trpc/react", () => ({
  api: {
    location: {
      getByPopularity: { useQuery: () => h.locationQuery },
    },
    // The component builds queries for each selected location id; invoke the
    // builder so its code path runs, then return our canned results.
    useQueries: (
      build: (t: {
        location: { getById: (input: { id: string }) => unknown };
      }) => unknown[],
    ) => {
      build({
        location: { getById: ({ id }) => ({ data: { id } }) },
      });
      return h.selectedLocationData.map((data) => ({ data }));
    },
  },
}));

vi.mock("~/utils/locationHelpers", () => ({
  prettyLocationName: (loc: { id: string; label?: string }) =>
    loc.label ?? loc.id,
}));

vi.mock("@cooper/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover">{children}</div>
  ),
  PopoverAnchor: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

// DropdownFilter renders the trigger; FilterPanelContent renders the open
// panel. Both are mocked to surface their props as buttons / text.
vi.mock("~/app/_components/filters/dropdown-filter", () => ({
  default: ({
    title,
    onTriggerClick,
    options,
  }: {
    title: string;
    onTriggerClick?: () => void;
    options: { id: string; label: string }[];
  }) => (
    <button data-testid={`trigger-${title}`} onClick={() => onTriggerClick?.()}>
      {title}
      <span data-testid={`trigger-opts-${title}`}>
        {options.map((o) => o.label).join(",")}
      </span>
    </button>
  ),
  FilterPanelContent: ({
    title,
    options,
    onSelectionChange,
    onSearchChange,
    onClose,
  }: {
    title: string;
    options: { id: string; label: string }[];
    onSelectionChange?: (s: string[]) => void;
    onSearchChange?: (s: string) => void;
    onClose: () => void;
  }) => (
    <div data-testid={`panel-${title}`}>
      <span data-testid={`panel-opts-${title}`}>
        {options.map((o) => o.label).join(",")}
      </span>
      <button
        data-testid={`panel-select-${title}`}
        onClick={() => onSelectionChange?.(["picked"])}
      >
        select
      </button>
      {onSearchChange && (
        <button
          data-testid={`panel-search-${title}`}
          onClick={() => onSearchChange("bos")}
        >
          search
        </button>
      )}
      <button data-testid={`panel-close-${title}`} onClick={onClose}>
        close
      </button>
    </div>
  ),
}));

import DropdownFiltersBar from "~/app/_components/filters/dropdown-filters-bar";

const emptyFilters: FilterState = {
  industries: [],
  locations: [],
  jobTypes: [],
  hourlyPay: { min: 0, max: 0 },
  ratings: [],
  workModels: [],
  overtimeWork: [],
  companyCulture: [],
};

function renderBar(filters: FilterState = emptyFilters) {
  const onFilterChange = vi.fn();
  render(
    <DropdownFiltersBar filters={filters} onFilterChange={onFilterChange} />,
  );
  return { onFilterChange };
}

beforeEach(() => {
  h.locationQuery = { data: undefined };
  h.selectedLocationData = [];
});

describe("DropdownFiltersBar - triggers", () => {
  test("renders every filter trigger", () => {
    renderBar();
    expect(screen.getByTestId("trigger-Industry")).toBeInTheDocument();
    expect(screen.getByTestId("trigger-Location")).toBeInTheDocument();
    expect(screen.getByTestId("trigger-Job type")).toBeInTheDocument();
    expect(screen.getByTestId("trigger-Hourly pay")).toBeInTheDocument();
    expect(screen.getByTestId("trigger-Overall rating")).toBeInTheDocument();
  });

  test("no panel is shown before any trigger is clicked", () => {
    renderBar();
    expect(screen.queryByTestId("panel-Industry")).toBeNull();
  });

  test("industry options are sorted alphabetically", () => {
    renderBar();
    const labels =
      screen.getByTestId("trigger-opts-Industry").textContent ?? "";
    expect(labels.startsWith("Aerospace")).toBe(true);
  });
});

describe("DropdownFiltersBar - open / close behavior", () => {
  test("clicking a trigger opens the matching panel", () => {
    renderBar();
    fireEvent.click(screen.getByTestId("trigger-Industry"));
    expect(screen.getByTestId("panel-Industry")).toBeInTheDocument();
    // Only the clicked filter's panel renders.
    expect(screen.queryByTestId("panel-Location")).toBeNull();
  });

  test("clicking the same trigger twice toggles the panel closed", () => {
    renderBar();
    fireEvent.click(screen.getByTestId("trigger-Job type"));
    expect(screen.getByTestId("panel-Job type")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("trigger-Job type"));
    expect(screen.queryByTestId("panel-Job type")).toBeNull();
  });

  test("opening a second filter swaps the visible panel", () => {
    renderBar();
    fireEvent.click(screen.getByTestId("trigger-Industry"));
    fireEvent.click(screen.getByTestId("trigger-Location"));
    expect(screen.queryByTestId("panel-Industry")).toBeNull();
    expect(screen.getByTestId("panel-Location")).toBeInTheDocument();
  });

  test("panel close button closes the panel", () => {
    renderBar();
    fireEvent.click(screen.getByTestId("trigger-Overall rating"));
    fireEvent.click(screen.getByTestId("panel-close-Overall rating"));
    expect(screen.queryByTestId("panel-Overall rating")).toBeNull();
  });
});

describe("DropdownFiltersBar - filter changes", () => {
  test("a panel selection merges into existing filters", () => {
    const { onFilterChange } = renderBar();
    fireEvent.click(screen.getByTestId("trigger-Industry"));
    fireEvent.click(screen.getByTestId("panel-select-Industry"));
    expect(onFilterChange).toHaveBeenCalledWith({
      ...emptyFilters,
      industries: ["picked"],
    });
  });

  test("rating panel selection updates ratings", () => {
    const { onFilterChange } = renderBar();
    fireEvent.click(screen.getByTestId("trigger-Overall rating"));
    fireEvent.click(screen.getByTestId("panel-select-Overall rating"));
    expect(onFilterChange).toHaveBeenCalledWith({
      ...emptyFilters,
      ratings: ["picked"],
    });
  });
});

describe("DropdownFiltersBar - location options", () => {
  test("merges prefix results into location options", () => {
    h.locationQuery = { data: [{ id: "1", label: "Boston, MA" }] };
    renderBar();
    fireEvent.click(screen.getByTestId("trigger-Location"));
    fireEvent.click(screen.getByTestId("panel-search-Location"));
    expect(screen.getByTestId("panel-opts-Location").textContent).toContain(
      "Boston, MA",
    );
  });

  test("includes selected-location labels and dedupes by id", () => {
    // Same id present in both the selected results and the prefix results.
    h.selectedLocationData = [{ id: "1", label: "Boston, MA" }];
    h.locationQuery = {
      data: [
        { id: "1", label: "Boston, MA" },
        { id: "2", label: "Austin, TX" },
      ],
    };
    renderBar({ ...emptyFilters, locations: ["1"] });
    fireEvent.click(screen.getByTestId("trigger-Location"));
    const labels = screen.getByTestId("panel-opts-Location").textContent ?? "";
    // Boston appears once despite being in both sources.
    expect(labels.match(/Boston, MA/g)?.length).toBe(1);
    expect(labels).toContain("Austin, TX");
  });
});
