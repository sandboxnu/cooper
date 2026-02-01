import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import Profile from "~/app/(pages)/(protected)/profile/page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useSearchParams: vi.fn(() => new URLSearchParams("tab=saved-roles")),
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

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img src={src} alt={alt} data-testid="profile-image" />
  ),
}));

const mockSession = {
  user: { id: "u1", email: "test@neu.edu", image: "/svg/defaultProfile.svg" },
  session: {},
};
const mockProfile = {
  id: "p1",
  firstName: "Test",
  lastName: "User",
  graduationYear: 2025,
};

vi.mock("~/trpc/react", () => ({
  api: {
    auth: {
      getSession: {
        useQuery: () => ({
          data: mockSession,
          isLoading: false,
          error: null,
        }),
      },
    },
    profile: {
      getCurrentUser: {
        useQuery: () => ({
          data: mockProfile,
          isLoading: false,
          error: null,
        }),
      },
      listFavoriteRoles: {
        useQuery: () => ({ data: [], enabled: true }),
      },
      listFavoriteCompanies: {
        useQuery: () => ({ data: [], enabled: true }),
      },
    },
    review: {
      getByProfile: {
        useQuery: () => ({ data: [], enabled: true }),
      },
    },
    useQueries: () => [],
  },
}));

vi.mock("~/app/_components/profile/profile-card-header", () => ({
  default: () => <div data-testid="profile-card-header">Profile Card</div>,
}));

vi.mock("~/app/_components/profile/profile-tabs", () => ({
  default: () => <div data-testid="profile-tabs">Tabs</div>,
}));

vi.mock("~/app/_components/profile/favorite-role-search", () => ({
  default: () => <div data-testid="favorite-role-search">Favorite Roles</div>,
}));

vi.mock("~/app/_components/profile/favorite-company-search", () => ({
  default: () => (
    <div data-testid="favorite-company-search">Favorite Companies</div>
  ),
}));

vi.mock("~/app/_components/reviews/review-card", () => ({
  ReviewCard: () => <div data-testid="review-card">Review</div>,
}));

describe("Profile page", () => {
  test("renders profile name and graduation year when session and profile exist", () => {
    render(<Profile />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Class of 2025")).toBeInTheDocument();
  });

  test("renders ProfileCardHeader and ProfileTabs", () => {
    render(<Profile />);
    expect(screen.getByTestId("profile-card-header")).toBeInTheDocument();
    expect(screen.getByTestId("profile-tabs")).toBeInTheDocument();
  });

  test("renders FavoriteRoleSearch when tab is saved-roles", () => {
    render(<Profile />);
    expect(screen.getByTestId("favorite-role-search")).toBeInTheDocument();
  });
});
