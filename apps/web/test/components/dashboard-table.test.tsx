import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const setFlaggedMutate = vi.fn();
const setHiddenMutate = vi.fn();
const invalidate = vi.fn();

interface QueryResult {
  data?: { items: unknown[] };
  isLoading: boolean;
}

let recentResult: QueryResult;
let flaggedResult: QueryResult;
let hiddenResult: QueryResult;
let reportedResult: QueryResult;

vi.mock("~/trpc/react", () => ({
  api: {
    useUtils: () => ({
      admin: {
        dashboardItems: { invalidate },
        flaggedDashboardItems: { invalidate },
        hiddenDashboardItems: { invalidate },
        reportedDashboardItems: { invalidate },
      },
    }),
    admin: {
      dashboardItems: { useQuery: () => recentResult },
      flaggedDashboardItems: { useQuery: () => flaggedResult },
      hiddenDashboardItems: { useQuery: () => hiddenResult },
      reportedDashboardItems: { useQuery: () => reportedResult },
      setFlaggedStatus: {
        useMutation: () => ({ mutate: setFlaggedMutate, isPending: false }),
      },
      setHiddenStatus: {
        useMutation: () => ({ mutate: setHiddenMutate, isPending: false }),
      },
    },
  },
}));

import { AdminDashboardTable } from "~/app/_components/admin/dashboard-table";

const review = (overrides: Record<string, unknown> = {}) => ({
  type: "review",
  id: "rev-1",
  text: "Great internship experience",
  headline: "Loved it",
  createdAt: new Date("2024-01-01").toISOString(),
  flagged: false,
  hidden: false,
  ...overrides,
});

const role = (overrides: Record<string, unknown> = {}) => ({
  type: "role",
  id: "role-1",
  title: "Software Engineer Intern",
  companyId: "Acme Corp",
  createdAt: new Date("2024-02-01").toISOString(),
  flagged: false,
  hidden: false,
  ...overrides,
});

const company = (overrides: Record<string, unknown> = {}) => ({
  type: "company",
  id: "co-1",
  name: "Globex",
  createdAt: new Date("2024-03-01").toISOString(),
  flagged: false,
  hidden: false,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  recentResult = { data: { items: [] }, isLoading: false };
  flaggedResult = { data: { items: [] }, isLoading: false };
  hiddenResult = { data: { items: [] }, isLoading: false };
  reportedResult = { data: { items: [] }, isLoading: false };
});

/** Returns the "New this week" section so queries are scoped to one table. */
const recentSection = () =>
  screen.getByRole("button", { name: /New this week/ }).closest("div")!;

describe("AdminDashboardTable", () => {
  test("shows a loading row while the recent section loads", () => {
    recentResult = { data: undefined, isLoading: true };
    render(<AdminDashboardTable />);
    expect(screen.getByText("Loading dashboard data…")).toBeInTheDocument();
  });

  test("renders the four section headers", () => {
    render(<AdminDashboardTable />);
    expect(
      screen.getByRole("button", { name: /New this week/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reported/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Flagged/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hidden/ })).toBeInTheDocument();
  });

  test("renders items of every category with the right labels", () => {
    recentResult = {
      data: { items: [review(), role(), company()] },
      isLoading: false,
    };
    render(<AdminDashboardTable />);

    expect(screen.getByText("Great internship experience")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer Intern")).toBeInTheDocument();
    expect(screen.getByText("Globex")).toBeInTheDocument();
    // Company id appears alongside the role title.
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
  });

  test("shows an empty state for sections without items", () => {
    render(<AdminDashboardTable />);
    expect(
      screen.getAllByText("No results in this section.").length,
    ).toBeGreaterThan(0);
  });

  test("ignores malformed raw items", () => {
    recentResult = {
      data: {
        items: [
          review(),
          { type: "unknown", id: "x" },
          { type: "role", id: "no-title" }, // role missing title -> dropped
          null,
        ],
      },
      isLoading: false,
    };
    render(<AdminDashboardTable />);
    expect(screen.getByText("Great internship experience")).toBeInTheDocument();
    expect(within(recentSection()).getAllByRole("row").length).toBeGreaterThan(
      0,
    );
  });

  test("filters items by the active category tab", () => {
    recentResult = {
      data: { items: [review(), role(), company()] },
      isLoading: false,
    };
    render(<AdminDashboardTable />);

    fireEvent.click(screen.getByRole("button", { name: "Role" }));

    expect(screen.getByText("Software Engineer Intern")).toBeInTheDocument();
    expect(screen.queryByText("Great internship experience")).toBeNull();
    expect(screen.queryByText("Globex")).toBeNull();
  });

  test("updates the search input value", () => {
    render(<AdminDashboardTable />);
    const input = screen.getByPlaceholderText(
      "Search for a review, role, company...",
    );
    fireEvent.change(input, { target: { value: "acme" } });
    expect(input).toHaveValue("acme");
  });

  test("collapses a section when its header is toggled", () => {
    render(<AdminDashboardTable />);
    const header = screen.getByRole("button", { name: /New this week/ });
    expect(header).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(header);
    expect(header).toHaveAttribute("aria-expanded", "false");
  });

  describe("flagging", () => {
    test("opens the flag dialog and requires a reason before submitting", () => {
      recentResult = {
        data: { items: [review({ flagged: false })] },
        isLoading: false,
      };
      render(<AdminDashboardTable />);

      fireEvent.click(screen.getByRole("button", { name: "Flag item" }));

      expect(
        screen.getByRole("heading", { name: "Flag this item?" }),
      ).toBeInTheDocument();

      const submit = screen.getByRole("button", { name: "Flag" });
      expect(submit).toBeDisabled();

      fireEvent.change(screen.getByPlaceholderText("Enter a reason..."), {
        target: { value: "Spam content" },
      });
      expect(submit).toBeEnabled();

      fireEvent.click(submit);
      expect(setFlaggedMutate).toHaveBeenCalledWith({
        entityType: "review",
        entityId: "rev-1",
        flagged: true,
        description: "Spam content",
      });
    });

    test("unflags immediately without opening a dialog", () => {
      recentResult = {
        data: { items: [review({ flagged: true })] },
        isLoading: false,
      };
      render(<AdminDashboardTable />);

      fireEvent.click(screen.getByRole("button", { name: "Remove flag" }));

      expect(
        screen.queryByRole("heading", { name: "Flag this item?" }),
      ).toBeNull();
      expect(setFlaggedMutate).toHaveBeenCalledWith({
        entityType: "review",
        entityId: "rev-1",
        flagged: false,
      });
    });
  });

  describe("hiding", () => {
    test("opens the hide dialog and confirms hiding", () => {
      recentResult = {
        data: { items: [review({ hidden: false })] },
        isLoading: false,
      };
      render(<AdminDashboardTable />);

      fireEvent.click(screen.getByRole("button", { name: "Hide content" }));

      expect(
        screen.getByRole("heading", { name: "Hide this item?" }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Hide" }));
      expect(setHiddenMutate).toHaveBeenCalledWith({
        entityType: "review",
        entityId: "rev-1",
        hidden: true,
      });
    });

    test("unhides immediately without opening a dialog", () => {
      recentResult = {
        data: { items: [review({ hidden: true })] },
        isLoading: false,
      };
      render(<AdminDashboardTable />);

      fireEvent.click(screen.getByRole("button", { name: "Show content" }));

      expect(
        screen.queryByRole("heading", { name: "Hide this item?" }),
      ).toBeNull();
      expect(setHiddenMutate).toHaveBeenCalledWith({
        entityType: "review",
        entityId: "rev-1",
        hidden: false,
      });
    });

    test("cancelling the hide dialog does not call the mutation", () => {
      recentResult = {
        data: { items: [review({ hidden: false })] },
        isLoading: false,
      };
      render(<AdminDashboardTable />);

      fireEvent.click(screen.getByRole("button", { name: "Hide content" }));
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(setHiddenMutate).not.toHaveBeenCalled();
    });
  });

  describe("section-specific data", () => {
    test("flagged section only shows flagged items", () => {
      flaggedResult = {
        data: {
          items: [
            review({ id: "rev-9", text: "Flagged review", flagged: true }),
          ],
        },
        isLoading: false,
      };
      render(<AdminDashboardTable />);
      expect(screen.getByText("Flagged review")).toBeInTheDocument();
    });

    test("hidden section only shows hidden items", () => {
      hiddenResult = {
        data: {
          items: [review({ id: "rev-8", text: "Hidden review", hidden: true })],
        },
        isLoading: false,
      };
      render(<AdminDashboardTable />);
      expect(screen.getByText("Hidden review")).toBeInTheDocument();
    });

    test("flagged section drops non-flagged items", () => {
      flaggedResult = {
        data: {
          items: [review({ id: "rev-7", text: "Not flagged", flagged: false })],
        },
        isLoading: false,
      };
      render(<AdminDashboardTable />);
      expect(screen.queryByText("Not flagged")).toBeNull();
    });
  });

  describe("pagination", () => {
    const manyReviews = Array.from({ length: 7 }, (_, i) =>
      review({ id: `rev-${i}`, text: `Review number ${i}` }),
    );

    test("paginates items beyond the page size", () => {
      recentResult = { data: { items: manyReviews }, isLoading: false };
      render(<AdminDashboardTable />);

      const section = recentSection();
      // Page 1 shows the first five reviews, not the sixth.
      expect(within(section).getByText("Review number 0")).toBeInTheDocument();
      expect(within(section).queryByText("Review number 5")).toBeNull();

      fireEvent.click(within(section).getByRole("button", { name: "2" }));

      expect(within(section).getByText("Review number 5")).toBeInTheDocument();
      expect(within(section).queryByText("Review number 0")).toBeNull();
    });

    test("disables the previous-page control on the first page", () => {
      recentResult = { data: { items: manyReviews }, isLoading: false };
      render(<AdminDashboardTable />);
      const section = recentSection();
      expect(
        within(section).getByRole("button", { name: "Previous page" }),
      ).toBeDisabled();
    });
  });
});
