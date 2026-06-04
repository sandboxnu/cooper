import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { FilterState } from "~/app/_components/filters/types";

// Mutable container for the location-by-popularity query result so individual
// tests can drive the location options mapping.
const h = vi.hoisted(() => {
  const locationQuery: {
    data: { id: string; label: string }[] | undefined;
  } = { data: undefined };
  return { locationQuery };
});

vi.mock("~/trpc/react", () => ({
  api: {
    location: {
      getByPopularity: { useQuery: () => h.locationQuery },
    },
  },
}));

vi.mock("@cooper/ui", () => ({
  cn: (...args: unknown[]) => args.flat().filter(Boolean).join(" "),
}));

vi.mock("@cooper/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("~/utils/locationHelpers", () => ({
  prettyLocationName: (loc: { id: string; label?: string }) =>
    loc.label ?? loc.id,
}));

vi.mock("~/app/_components/filters/role-type-selector", () => ({
  default: ({
    selectedType,
    onSelectedTypeChange,
  }: {
    selectedType: string;
    onSelectedTypeChange: (t: "roles" | "companies" | "all") => void;
  }) => (
    <button
      data-testid="role-type-selector"
      onClick={() => onSelectedTypeChange("companies")}
    >
      type:{selectedType}
    </button>
  ),
}));

// Lightweight SidebarSection mock that surfaces its props as buttons so the
// container's callback wiring can be exercised without the real component.
vi.mock("~/app/_components/filters/sidebar-section", () => ({
  default: ({
    title,
    options,
    onSelectionChange,
    onSearchChange,
  }: {
    title: string;
    options: { id: string; label: string }[];
    onSelectionChange?: (s: string[]) => void;
    onSearchChange?: (s: string) => void;
  }) => (
    <div data-testid={`section-${title}`}>
      <span>{title}</span>
      <span data-testid={`opts-${title}`}>
        {options.map((o) => o.label).join(",")}
      </span>
      <button
        data-testid={`select-${title}`}
        onClick={() => onSelectionChange?.(["picked"])}
      >
        select
      </button>
      {onSearchChange && (
        <button
          data-testid={`search-${title}`}
          onClick={() => onSearchChange("bos")}
        >
          search
        </button>
      )}
    </div>
  ),
}));

import SidebarFilter from "~/app/_components/filters/sidebar-filter";

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

function renderFilter(
  overrides: Partial<Parameters<typeof SidebarFilter>[0]> = {},
) {
  const onFilterChange = vi.fn();
  const onClose = vi.fn();
  const onSelectedTypeChange = vi.fn();
  render(
    <SidebarFilter
      isOpen
      filters={emptyFilters}
      onFilterChange={onFilterChange}
      onClose={onClose}
      selectedType="roles"
      onSelectedTypeChange={onSelectedTypeChange}
      {...overrides}
    />,
  );
  return { onFilterChange, onClose, onSelectedTypeChange };
}

beforeEach(() => {
  h.locationQuery = { data: undefined };
});

describe("SidebarFilter - rendering", () => {
  test("renders the header and all filter sections", () => {
    renderFilter();
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByTestId("section-Industry")).toBeInTheDocument();
    expect(screen.getByTestId("section-Location")).toBeInTheDocument();
    expect(screen.getByTestId("section-Job type")).toBeInTheDocument();
    expect(screen.getByTestId("section-Hourly pay")).toBeInTheDocument();
    expect(screen.getByTestId("section-Work model")).toBeInTheDocument();
    expect(screen.getByTestId("section-Overtime work")).toBeInTheDocument();
    expect(screen.getByTestId("section-Company Culture")).toBeInTheDocument();
    expect(screen.getByTestId("section-Overall rating")).toBeInTheDocument();
  });

  test("sorts industry options alphabetically", () => {
    renderFilter();
    const labels = screen.getByTestId("opts-Industry").textContent ?? "";
    expect(labels.startsWith("Aerospace")).toBe(true);
  });

  test("passes job type options through", () => {
    renderFilter();
    expect(screen.getByTestId("opts-Job type").textContent).toBe(
      "Co-op,Internship",
    );
  });
});

describe("SidebarFilter - filter changes", () => {
  test("a section selection merges into existing filters", () => {
    const { onFilterChange } = renderFilter();
    fireEvent.click(screen.getByTestId("select-Industry"));
    expect(onFilterChange).toHaveBeenCalledWith({
      ...emptyFilters,
      industries: ["picked"],
    });
  });

  test("Clear all resets every filter field", () => {
    const { onFilterChange } = renderFilter({
      filters: {
        ...emptyFilters,
        industries: ["TECHNOLOGY"],
        ratings: ["4"],
      },
    });
    fireEvent.click(screen.getByText("Clear all"));
    expect(onFilterChange).toHaveBeenCalledWith(emptyFilters);
  });

  test("On the job Clear resets only the on-the-job fields", () => {
    const { onFilterChange } = renderFilter({
      filters: {
        ...emptyFilters,
        industries: ["TECHNOLOGY"],
        workModels: ["REMOTE"],
        overtimeWork: ["Yes"],
        companyCulture: ["3"],
      },
    });
    fireEvent.click(screen.getByText("Clear"));
    expect(onFilterChange).toHaveBeenCalledWith({
      ...emptyFilters,
      industries: ["TECHNOLOGY"],
      workModels: [],
      overtimeWork: [],
      companyCulture: [],
    });
  });
});

describe("SidebarFilter - close & type controls", () => {
  test("Show Results triggers onClose", () => {
    const { onClose } = renderFilter();
    fireEvent.click(screen.getByText("Show Results"));
    expect(onClose).toHaveBeenCalled();
  });

  test("clicking the overlay triggers onClose", () => {
    const { onClose } = renderFilter();
    // The outermost overlay (parent of the panel) carries the onClose handler;
    // the panel itself stops propagation.
    const panel = screen.getByText("Filters").closest("div.fixed")!;
    fireEvent.click(panel.parentElement!);
    expect(onClose).toHaveBeenCalled();
  });

  test("role type selector forwards the new type", () => {
    const { onSelectedTypeChange } = renderFilter();
    fireEvent.click(screen.getByTestId("role-type-selector"));
    expect(onSelectedTypeChange).toHaveBeenCalledWith("companies");
  });
});

describe("SidebarFilter - location search", () => {
  test("maps location query results into options", () => {
    h.locationQuery = {
      data: [
        { id: "1", label: "Boston, MA" },
        { id: "2", label: "Austin, TX" },
      ],
    };
    renderFilter();
    // Trigger the 3-char search so the query path is enabled.
    fireEvent.click(screen.getByTestId("search-Location"));
    expect(screen.getByTestId("opts-Location").textContent).toBe(
      "Boston, MA,Austin, TX",
    );
  });

  test("location options are empty when the query has no data", () => {
    renderFilter();
    fireEvent.click(screen.getByTestId("search-Location"));
    expect(screen.getByTestId("opts-Location").textContent).toBe("");
  });
});
