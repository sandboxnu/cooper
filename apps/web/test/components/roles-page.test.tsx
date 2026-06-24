import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => {
  const emptyQuery = {
    isSuccess: false,
    isPending: false,
    isError: false,
    data: undefined as unknown,
  };
  return {
    emptyQuery,
    listQuery: { ...emptyQuery },
    pageNumberQuery: {
      isSuccess: false,
      isError: false,
      data: undefined,
    },
    push: vi.fn(),
    searchParams: new URLSearchParams(),
    compare: {
      isCompareMode: false,
      anchorRoleId: null as string | null,
      comparedRoleIds: [] as string[],
      exitCompareMode: vi.fn(),
    },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push }),
  useSearchParams: () => h.searchParams,
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("@cooper/ui", () => ({
  cn: (...args: unknown[]) => args.flat().filter(Boolean).join(" "),
  Pagination: ({
    currentPage,
    totalPages,
  }: {
    currentPage: number;
    totalPages: number;
  }) => (
    <div data-testid="pagination">
      {currentPage}/{totalPages}
    </div>
  ),
}));

vi.mock("@cooper/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@cooper/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("~/app/_components/compare/compare-context", () => ({
  useCompare: () => h.compare,
}));

vi.mock("~/app/_components/compare/compare-ui", () => ({
  CompareColumns: ({ anchorRole }: { anchorRole: { id: string } }) => (
    <div data-testid="compare-columns">{anchorRole.id}</div>
  ),
  CompareControls: ({ anchorRoleId }: { anchorRoleId: string }) => (
    <div data-testid="compare-controls">{anchorRoleId}</div>
  ),
}));

vi.mock("~/app/_components/companies/company-card-preview", () => ({
  CompanyCardPreview: ({ companyObj }: { companyObj: { name: string } }) => (
    <div data-testid="company-card">{companyObj.name}</div>
  ),
}));
vi.mock("~/app/_components/companies/company-info", () => ({
  default: ({ companyObj }: { companyObj: { name: string } }) => (
    <div data-testid="company-info">{companyObj.name}</div>
  ),
}));
vi.mock("~/app/_components/filters/dropdown-filters-bar", () => ({
  default: () => <div data-testid="dropdown-filters-bar" />,
}));
vi.mock("~/app/_components/filters/role-type-selector", () => ({
  default: ({ selectedType }: { selectedType: string }) => (
    <div data-testid="role-type-selector">{selectedType}</div>
  ),
}));
vi.mock("~/app/_components/filters/sidebar-filter", () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="sidebar-filter">{isOpen ? "open" : "closed"}</div>
  ),
}));
vi.mock("~/app/_components/loading-results", () => ({
  default: () => <div data-testid="loading-results" />,
}));
vi.mock("~/app/_components/no-results", () => ({
  default: () => <div data-testid="no-results" />,
}));
vi.mock("~/app/_components/roles/role-card-preview", () => ({
  RoleCardPreview: ({ roleObj }: { roleObj: { title: string } }) => (
    <div data-testid="role-card">{roleObj.title}</div>
  ),
}));
vi.mock("~/app/_components/roles/role-info", () => ({
  RoleInfo: ({ roleObj }: { roleObj: { title: string } }) => (
    <div data-testid="role-info">{roleObj.title}</div>
  ),
}));
vi.mock("~/app/_components/search/search-filter", () => ({
  default: () => <div data-testid="search-filter" />,
}));

vi.mock("~/trpc/react", () => {
  const empty = () => ({ useQuery: () => h.emptyQuery });
  return {
    api: {
      company: { getBySlug: empty() },
      role: {
        getByCompanySlugAndRoleSlug: empty(),
        getByIdWithCompany: empty(),
      },
      roleAndCompany: {
        getPageNumber: { useQuery: () => h.pageNumberQuery },
        list: { useQuery: () => h.listQuery },
      },
    },
  };
});

import Roles from "~/app/(pages)/(dashboard)/roles/page";

const roleItem = {
  id: "r1",
  type: "role" as const,
  title: "Software Engineer",
};
const companyItem = {
  id: "c1",
  type: "company" as const,
  name: "Acme Corp",
};

function setList(data: unknown) {
  h.listQuery = {
    isSuccess: true,
    isPending: false,
    isError: false,
    data,
  };
}

describe("Roles page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.searchParams = new URLSearchParams();
    h.listQuery = {
      isSuccess: false,
      isPending: true,
      isError: false,
      data: undefined,
    };
    h.pageNumberQuery = { isSuccess: false, isError: false, data: undefined };
    h.compare = {
      isCompareMode: false,
      anchorRoleId: null,
      comparedRoleIds: [],
      exitCompareMode: vi.fn(),
    };
  });

  test("renders the search bar and sidebar filter chrome", () => {
    render(<Roles />);
    expect(screen.getByTestId("search-filter")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-filter")).toHaveTextContent("closed");
  });

  test("shows the loading state while the list query is pending", () => {
    render(<Roles />);
    expect(screen.getByTestId("loading-results")).toBeInTheDocument();
  });

  test("shows no-results when the query succeeds with an empty list", () => {
    setList({
      items: [],
      totalCount: 0,
      totalRolesCount: 0,
      totalCompanyCount: 0,
    });
    render(<Roles />);
    expect(screen.getByTestId("no-results")).toBeInTheDocument();
  });

  test("renders role and company cards with pagination", () => {
    setList({
      items: [roleItem, companyItem],
      totalCount: 12,
      totalRolesCount: 6,
      totalCompanyCount: 6,
    });
    render(<Roles />);

    expect(screen.getByTestId("role-card")).toHaveTextContent(
      "Software Engineer",
    );
    expect(screen.getByTestId("company-card")).toHaveTextContent("Acme Corp");
    // ceil(12 / 10) = 2 pages
    expect(screen.getByTestId("pagination")).toHaveTextContent("1/2");
    expect(screen.getByTestId("role-type-selector")).toBeInTheDocument();
  });

  test("auto-selects the first item and shows its detail pane", () => {
    setList({
      items: [roleItem, companyItem],
      totalCount: 2,
      totalRolesCount: 1,
      totalCompanyCount: 1,
    });
    render(<Roles />);
    // First item is a role, so RoleInfo is shown in the detail pane.
    expect(screen.getByTestId("role-info")).toHaveTextContent(
      "Software Engineer",
    );
  });

  test("reflects the type query param in the role type selector", () => {
    h.searchParams = new URLSearchParams("type=companies");
    setList({
      items: [companyItem],
      totalCount: 1,
      totalRolesCount: 0,
      totalCompanyCount: 1,
    });
    render(<Roles />);
    expect(screen.getByTestId("role-type-selector")).toHaveTextContent(
      "companies",
    );
  });

  test("renders compare controls and columns in compare mode", () => {
    h.compare = {
      isCompareMode: true,
      anchorRoleId: "r1",
      comparedRoleIds: [],
      exitCompareMode: vi.fn(),
    };
    setList({
      items: [roleItem, companyItem],
      totalCount: 2,
      totalRolesCount: 1,
      totalCompanyCount: 1,
    });
    render(<Roles />);
    expect(screen.getByTestId("compare-controls")).toHaveTextContent("r1");
    expect(screen.getByTestId("compare-columns")).toHaveTextContent("r1");
  });
});
