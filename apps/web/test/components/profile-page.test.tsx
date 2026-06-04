import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

interface Query<T> {
  data: T;
  isLoading: boolean;
  error: unknown;
}

const h = vi.hoisted(() => {
  const make = <T,>(data: T): Query<T> => ({
    data,
    isLoading: false,
    error: null,
  });
  return {
    make,
    redirect: vi.fn(),
    searchParams: new URLSearchParams(),
    sessionQuery: make<unknown>({
      user: { image: null, email: "jane@husky.neu.edu", role: "STUDENT" },
    }),
    profileQuery: make<unknown>({
      id: "p1",
      firstName: "Jane",
      lastName: "Doe",
      graduationYear: 2025,
    }),
    reviewsQuery: { data: [] as unknown[] },
    favoriteRolesQuery: { data: [] as unknown[] },
    favoriteCompaniesQuery: { data: [] as unknown[] },
  };
});

vi.mock("next/navigation", () => ({
  redirect: h.redirect,
  useSearchParams: () => h.searchParams,
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@cooper/ui/button", () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

vi.mock("~/app/_components/profile/favorite-company-search", () => ({
  default: () => <div data-testid="favorite-company-search" />,
}));
vi.mock("~/app/_components/profile/favorite-role-search", () => ({
  default: () => <div data-testid="favorite-role-search" />,
}));
vi.mock("~/app/_components/profile/profile-card-header", () => ({
  default: ({ email }: { email: string }) => (
    <div data-testid="profile-card-header">{email}</div>
  ),
}));
vi.mock("~/app/_components/profile/profile-tabs", () => ({
  default: ({ numReviews }: { numReviews: number }) => (
    <div data-testid="profile-tabs">{numReviews}</div>
  ),
}));
vi.mock("~/app/_components/reviews/draft-review-card", () => ({
  DraftReviewCard: ({ reviewObj }: { reviewObj: { id: string } }) => (
    <div data-testid="draft-review-card">{reviewObj.id}</div>
  ),
}));
vi.mock("~/app/_components/reviews/profile-review-card", () => ({
  ProfileReviewCard: ({ reviewObj }: { reviewObj: { id: string } }) => (
    <div data-testid="profile-review-card">{reviewObj.id}</div>
  ),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    auth: { getSession: { useQuery: () => h.sessionQuery } },
    profile: {
      getCurrentUser: { useQuery: () => h.profileQuery },
      listFavoriteRoles: { useQuery: () => h.favoriteRolesQuery },
      listFavoriteCompanies: { useQuery: () => h.favoriteCompaniesQuery },
    },
    review: { getByProfile: { useQuery: () => h.reviewsQuery } },
    role: { getById: () => ({}) },
    company: { getById: () => ({}) },
    useQueries: () => [],
  },
}));

import Profile from "~/app/(pages)/(protected)/profile/page";

describe("Profile page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.searchParams = new URLSearchParams();
    h.sessionQuery = h.make({
      user: { image: null, email: "jane@husky.neu.edu", role: "STUDENT" },
    });
    h.profileQuery = h.make({
      id: "p1",
      firstName: "Jane",
      lastName: "Doe",
      graduationYear: 2025,
    });
    h.reviewsQuery = { data: [] };
    h.favoriteRolesQuery = { data: [] };
    h.favoriteCompaniesQuery = { data: [] };
  });

  test("renders an error message when a query fails", () => {
    h.profileQuery = { ...h.make(undefined), error: new Error("boom") };
    render(<Profile />);
    expect(screen.getByText(/Error loading profile/)).toBeInTheDocument();
  });

  test("redirects home and renders nothing when there is no profile", () => {
    h.profileQuery = h.make(undefined);
    const { container } = render(<Profile />);
    expect(h.redirect).toHaveBeenCalledWith("/");
    expect(container).toBeEmptyDOMElement();
  });

  test("renders the user's name, class year, header, and tabs", () => {
    render(<Profile />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Class of 2025")).toBeInTheDocument();
    expect(screen.getByTestId("profile-card-header")).toHaveTextContent(
      "jane@husky.neu.edu",
    );
    expect(screen.getByTestId("profile-tabs")).toBeInTheDocument();
  });

  test("defaults to the saved-roles tab", () => {
    render(<Profile />);
    expect(screen.getByTestId("favorite-role-search")).toBeInTheDocument();
    expect(
      screen.queryByTestId("favorite-company-search"),
    ).not.toBeInTheDocument();
  });

  test("shows the saved-companies tab when requested", () => {
    h.searchParams = new URLSearchParams("tab=saved-companies");
    render(<Profile />);
    expect(screen.getByTestId("favorite-company-search")).toBeInTheDocument();
    expect(
      screen.queryByTestId("favorite-role-search"),
    ).not.toBeInTheDocument();
  });

  test("shows an empty state on the reviews tab with no reviews", () => {
    h.searchParams = new URLSearchParams("tab=my-reviews");
    render(<Profile />);
    expect(screen.getByText("No Reviews Yet")).toBeInTheDocument();
  });

  test("renders drafts before published reviews on the reviews tab", () => {
    h.searchParams = new URLSearchParams("tab=my-reviews");
    h.reviewsQuery = {
      data: [
        { id: "published-1", status: "PUBLISHED", updatedAt: new Date(1) },
        { id: "draft-1", status: "DRAFT", updatedAt: new Date(2) },
      ],
    };
    render(<Profile />);

    const draft = screen.getByTestId("draft-review-card");
    const published = screen.getByTestId("profile-review-card");
    expect(draft).toHaveTextContent("draft-1");
    expect(published).toHaveTextContent("published-1");
    // Drafts sort ahead of published reviews.
    expect(
      draft.compareDocumentPosition(published) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByText("No Reviews Yet")).not.toBeInTheDocument();
  });
});
