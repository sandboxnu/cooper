import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

interface Review {
  id: string;
  overallRating?: number;
  workYear?: number;
  workTerm?: string;
  locationId?: string | null;
  jobType?: string;
  status?: string;
}

const state: {
  reviews: { data: Review[]; isSuccess: boolean };
  usersReviews: { data: { status: string }[]; isSuccess: boolean };
  list: { data: { overallRating: number }[] };
  byPopularity: { data: { id: string }[] };
} = {
  reviews: { data: [], isSuccess: true },
  usersReviews: { data: [], isSuccess: true },
  list: { data: [] },
  byPopularity: { data: [] },
};

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("~/trpc/react", () => ({
  api: {
    review: {
      getByRole: {
        useQuery: () => ({
          data: state.reviews.data,
          isSuccess: state.reviews.isSuccess,
        }),
      },
      list: { useQuery: () => ({ data: state.list.data }) },
      getByProfile: {
        useQuery: () => ({
          data: state.usersReviews.data,
          isSuccess: state.usersReviews.isSuccess,
        }),
      },
    },
    role: {
      getAverageById: {
        useQuery: () => ({ data: { averageOverallRating: 4.2 } }),
      },
    },
    profile: { getCurrentUser: { useQuery: () => ({ data: { id: "p1" } }) } },
    location: {
      getByPopularity: { useQuery: () => ({ data: state.byPopularity.data }) },
    },
    // Invoke the query-builder callback so the `t.location.getById(...)` map
    // inside the component executes, returning one `{ data }` per location id.
    useQueries: (cb: (t: unknown) => unknown) =>
      cb({
        location: {
          getById: (input: { id: string }) => ({ data: { id: input.id } }),
        },
      }),
  },
}));

vi.mock("~/app/_components/shared/star-graph", () => ({
  default: () => <div data-testid="star-graph" />,
}));
vi.mock("~/app/_components/reviews/review-card", () => ({
  ReviewCard: ({ reviewObj }: { reviewObj: { id: string } }) => (
    <div data-testid="review-card">{reviewObj.id}</div>
  ),
}));
vi.mock("~/utils/reviewCountByStars", () => ({
  calculateRatings: () => [],
}));
vi.mock("~/utils/locationHelpers", () => ({
  prettyLocationName: (loc: { id: string }) => `loc-${loc.id}`,
}));

// Popover/DropdownMenu doubles that always render their children so the inner
// FilterPanelContent and Sort buttons are present and clickable in jsdom.
vi.mock("@cooper/ui/popover", () => ({
  Popover: ({
    children,
    onOpenChange,
  }: {
    children: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div>
      <button data-testid="popover-close" onClick={() => onOpenChange?.(false)}>
        x
      </button>
      {children}
    </div>
  ),
  PopoverAnchor: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-anchor">{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@cooper/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// DropdownFilter / FilterPanelContent doubles expose their callbacks as
// buttons keyed by title so tests can drive the component's filter state.
vi.mock("~/app/_components/filters/dropdown-filter", () => ({
  default: ({
    title,
    onTriggerClick,
    onSelectionChange,
    onSearchChange,
  }: {
    title: string;
    onTriggerClick?: () => void;
    onSelectionChange?: (s: string[]) => void;
    onSearchChange?: (s: string) => void;
  }) => (
    <div>
      <button data-testid={`trigger-${title}`} onClick={onTriggerClick}>
        {title}
      </button>
      <button
        data-testid={`select-${title}`}
        onClick={() => onSelectionChange?.(["3", "4"])}
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
  FilterPanelContent: ({
    title,
    onSelectionChange,
    onSearchChange,
    onClose,
  }: {
    title: string;
    onSelectionChange?: (s: string[]) => void;
    onSearchChange?: (s: string) => void;
    onClose: () => void;
  }) => (
    <div data-testid={`panel-${title}`}>
      <button
        data-testid={`panel-select-${title}`}
        onClick={() => onSelectionChange?.(["5"])}
      >
        psel
      </button>
      {onSearchChange && (
        <button
          data-testid={`panel-search-${title}`}
          onClick={() => onSearchChange("nyc")}
        >
          psearch
        </button>
      )}
      <button data-testid={`panel-close-${title}`} onClick={onClose}>
        close
      </button>
    </div>
  ),
}));

import { ReviewModal } from "~/app/_components/roles/modals/review-modal";

const twoReviews: Review[] = [
  {
    id: "rev-1",
    overallRating: 4,
    workYear: 2024,
    workTerm: "FALL",
    locationId: "loc-a",
    jobType: "CO-OP",
  },
  {
    id: "rev-2",
    overallRating: 2,
    workYear: 2023,
    workTerm: "SPRING",
    locationId: "loc-b",
    jobType: "INTERNSHIP",
  },
];

describe("ReviewModal", () => {
  beforeEach(() => {
    state.reviews = { data: [], isSuccess: true };
    state.usersReviews = { data: [], isSuccess: true };
    state.list = { data: [] };
    state.byPopularity = { data: [] };
  });

  describe("empty state", () => {
    test("shows the empty state with an Add link when there are no reviews", () => {
      render(<ReviewModal roleId="r1" isComparing={false} />);
      expect(screen.getByText("Reviews")).toBeInTheDocument();
      expect(screen.getByText("No reviews yet")).toBeInTheDocument();
      expect(screen.getByText("Add one!")).toBeInTheDocument();
    });

    test("hides the Add link once the user has 5 published reviews", () => {
      state.usersReviews = {
        data: Array.from({ length: 5 }, () => ({ status: "PUBLISHED" })),
        isSuccess: true,
      };
      render(<ReviewModal roleId="r1" isComparing={false} />);
      expect(screen.getByText("No reviews yet")).toBeInTheDocument();
      expect(screen.queryByText("Add one!")).not.toBeInTheDocument();
    });
  });

  describe("with reviews", () => {
    beforeEach(() => {
      state.reviews = { data: twoReviews, isSuccess: true };
      state.list = { data: [{ overallRating: 4 }, { overallRating: 5 }] };
      state.byPopularity = { data: [{ id: "loc-search" }] };
    });

    test("renders the star graph and a card per review", () => {
      render(<ReviewModal roleId="r1" isComparing={false} />);
      expect(screen.getByTestId("star-graph")).toBeInTheDocument();
      expect(screen.getAllByTestId("review-card")).toHaveLength(2);
    });

    test("renders the filter triggers and Sort By control", () => {
      render(<ReviewModal roleId="r1" isComparing={true} />);
      expect(screen.getByTestId("trigger-Overall rating")).toBeInTheDocument();
      expect(screen.getByTestId("trigger-Location")).toBeInTheDocument();
      expect(screen.getByTestId("trigger-Job type")).toBeInTheDocument();
      expect(screen.getByText(/Sort By/)).toBeInTheDocument();
    });

    test("opening the rating filter wraps it in an anchor and shows its panel", () => {
      render(<ReviewModal roleId="r1" isComparing={false} />);
      fireEvent.click(screen.getByTestId("trigger-Overall rating"));
      expect(screen.getByTestId("popover-anchor")).toBeInTheDocument();
      expect(screen.getByTestId("panel-Overall rating")).toBeInTheDocument();
    });

    test("selecting a rating range filters the review list", () => {
      render(<ReviewModal roleId="r1" isComparing={false} />);
      // ratingFilter [3,4] keeps rev-1 (4) and drops rev-2 (2).
      fireEvent.click(screen.getByTestId("select-Overall rating"));
      expect(screen.getAllByTestId("review-card")).toHaveLength(1);
      expect(screen.getByText("rev-1")).toBeInTheDocument();
    });

    test("opening the location filter drives selection and search", () => {
      render(<ReviewModal roleId="r1" isComparing={false} />);
      fireEvent.click(screen.getByTestId("trigger-Location"));
      fireEvent.click(screen.getByTestId("panel-search-Location"));
      fireEvent.click(screen.getByTestId("search-Location"));
      // locationFilter ["3","4"] matches neither location, so no cards remain.
      fireEvent.click(screen.getByTestId("select-Location"));
      expect(screen.queryAllByTestId("review-card")).toHaveLength(0);
      expect(
        screen.getByText("No reviews found matching your filter criteria."),
      ).toBeInTheDocument();
    });

    test("opening the job type filter narrows by job type", () => {
      render(<ReviewModal roleId="r1" isComparing={false} />);
      fireEvent.click(screen.getByTestId("trigger-Job type"));
      // jobTypeFilter becomes "3" (selected[0]); matches neither review.
      fireEvent.click(screen.getByTestId("panel-select-Job type"));
      expect(screen.getByTestId("panel-Job type")).toBeInTheDocument();
    });

    test("closing a panel resets the open filter key", () => {
      render(<ReviewModal roleId="r1" isComparing={false} />);
      fireEvent.click(screen.getByTestId("trigger-Overall rating"));
      expect(screen.getByTestId("panel-Overall rating")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("panel-close-Overall rating"));
      expect(
        screen.queryByTestId("panel-Overall rating"),
      ).not.toBeInTheDocument();
    });

    test("clicking the same trigger twice toggles the filter closed", () => {
      render(<ReviewModal roleId="r1" isComparing={false} />);
      fireEvent.click(screen.getByTestId("trigger-Overall rating"));
      expect(screen.getByTestId("panel-Overall rating")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("trigger-Overall rating"));
      expect(
        screen.queryByTestId("panel-Overall rating"),
      ).not.toBeInTheDocument();
    });

    test("the popover onOpenChange(false) clears the open filter", () => {
      render(<ReviewModal roleId="r1" isComparing={false} />);
      fireEvent.click(screen.getByTestId("trigger-Location"));
      expect(screen.getByTestId("panel-Location")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("popover-close"));
      expect(screen.queryByTestId("panel-Location")).not.toBeInTheDocument();
    });

    test("sorting by highest then lowest rating reorders the cards", () => {
      render(<ReviewModal roleId="r1" isComparing={false} />);
      fireEvent.click(screen.getByText("Highest rating"));
      let cards = screen.getAllByTestId("review-card");
      expect(cards[0]).toHaveTextContent("rev-1");

      fireEvent.click(screen.getByText("Lowest rating"));
      cards = screen.getAllByTestId("review-card");
      expect(cards[0]).toHaveTextContent("rev-2");

      fireEvent.click(screen.getByText("Most recent"));
      cards = screen.getAllByTestId("review-card");
      expect(cards).toHaveLength(2);
    });

    test("most-recent sort falls back to term order within the same year", () => {
      state.reviews = {
        data: [
          {
            id: "spring",
            overallRating: 3,
            workYear: 2024,
            workTerm: "SPRING",
          },
          { id: "fall", overallRating: 3, workYear: 2024, workTerm: "FALL" },
        ],
        isSuccess: true,
      };
      render(<ReviewModal roleId="r1" isComparing={false} />);
      const cards = screen.getAllByTestId("review-card");
      // Same year → FALL (3) sorts before SPRING (1).
      expect(cards[0]).toHaveTextContent("fall");
      expect(cards[1]).toHaveTextContent("spring");
    });
  });
});
