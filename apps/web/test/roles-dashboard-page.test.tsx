import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import Roles from "~/app/(pages)/(dashboard)/(roles)/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () =>
    new URLSearchParams({ company: "", role: "", search: "" }),
}));

const mockListData = {
  items: [
    {
      id: "role-1",
      type: "role",
      title: "Software Engineer",
      companyName: "Test Co",
      slug: "software-engineer",
      companySlug: "test-co",
    } as never,
  ],
  totalCount: 1,
  totalRolesCount: 1,
  totalCompanyCount: 0,
};

vi.mock("~/trpc/react", () => ({
  api: {
    company: {
      getBySlug: { useQuery: () => ({ data: undefined, isSuccess: false }) },
    },
    role: {
      getByCompanySlugAndRoleSlug: {
        useQuery: () => ({ data: undefined, isSuccess: false }),
      },
    },
    roleAndCompany: {
      getPageNumber: {
        useQuery: () => ({
          data: { found: false, page: 1 },
          isSuccess: false,
          isError: false,
        }),
      },
      list: {
        useQuery: () => ({
          data: mockListData,
          isSuccess: true,
          isPending: false,
        }),
      },
    },
    location: {
      getByPrefix: {
        useQuery: () => ({ data: [], isLoading: false }),
      },
    },
  },
}));

vi.mock("~/app/_components/compare/compare-context", () => ({
  useCompare: () => ({
    isCompareMode: false,
    comparedRoleIds: [],
    enterCompareMode: vi.fn(),
    addRoleId: vi.fn(),
  }),
}));

vi.mock("~/app/_components/loading-results", () => ({
  default: () => <div data-testid="loading-results">Loading</div>,
}));

vi.mock("~/app/_components/no-results", () => ({
  default: () => <div data-testid="no-results">No results</div>,
}));

vi.mock("~/app/_components/search/search-filter", () => ({
  default: () => <div data-testid="search-filter">Search</div>,
}));

vi.mock("~/app/_components/filters/dropdown-filters-bar", () => ({
  default: () => <div data-testid="dropdown-filters-bar">Filters</div>,
}));

vi.mock("~/app/_components/companies/company-card-preview", () => ({
  CompanyCardPreview: () => (
    <div data-testid="company-card-preview">Company</div>
  ),
}));

vi.mock("~/app/_components/reviews/role-card-preview", () => ({
  RoleCardPreview: () => <div data-testid="role-card-preview">Role</div>,
}));

vi.mock("~/app/_components/reviews/role-info", () => ({
  RoleInfo: () => <div data-testid="role-info">Role info</div>,
}));

vi.mock("~/app/_components/companies/company-info", () => ({
  default: () => <div data-testid="company-info">Company info</div>,
}));

vi.mock("~/app/_components/compare/compare-ui", () => ({
  CompareColumns: () => <div data-testid="compare-columns">Compare</div>,
  CompareControls: () => <div data-testid="compare-controls">Controls</div>,
}));

describe("Roles dashboard page", () => {
  test("renders SearchFilter and DropdownFiltersBar", () => {
    render(<Roles />);
    expect(screen.getByTestId("search-filter")).toBeInTheDocument();
    expect(screen.getByTestId("dropdown-filters-bar")).toBeInTheDocument();
  });

  test("renders Sort By dropdown and type chips when list has data", () => {
    render(<Roles />);
    expect(screen.getByText(/Sort By/)).toBeInTheDocument();
  });

  test("renders role card when list has role items", () => {
    render(<Roles />);
    expect(screen.getByTestId("role-card-preview")).toBeInTheDocument();
  });

  test("renders RoleInfo when a role is selected", () => {
    render(<Roles />);
    expect(screen.getByTestId("role-info")).toBeInTheDocument();
  });
});
