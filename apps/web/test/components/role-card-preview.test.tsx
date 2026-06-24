import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const state: {
  company?: { name: string };
  role?: { id: string; title: string };
  reviews: { data: unknown[]; isSuccess: boolean };
  averages?: { averageOverallRating: number };
  location: { isSuccess: boolean; data?: unknown };
  compareMode: boolean;
} = {
  reviews: { data: [], isSuccess: false },
  location: { isSuccess: false },
  compareMode: false,
};

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
vi.mock("~/trpc/react", () => ({
  api: {
    company: { getById: { useQuery: () => ({ data: state.company }) } },
    role: {
      getById: { useQuery: () => ({ data: state.role }) },
      getAverageById: { useQuery: () => ({ data: state.averages }) },
    },
    review: {
      getByRole: {
        useQuery: () => ({
          data: state.reviews.data,
          isSuccess: state.reviews.isSuccess,
        }),
      },
    },
    location: { getById: { useQuery: () => state.location } },
  },
}));
vi.mock("~/app/_components/shared/favorite-button", () => ({
  FavoriteButton: () => <div data-testid="favorite-button" />,
}));
vi.mock("~/app/_components/compare/compare-context", () => ({
  useCompare: () => ({
    isCompareMode: state.compareMode,
    comparedRoleIds: [],
    enterCompareMode: vi.fn(),
    addRoleId: vi.fn(),
  }),
}));

import { RoleCardPreview } from "~/app/_components/roles/role-card-preview";

const roleObj = { id: "r1", companyId: "c1" } as never;

describe("RoleCardPreview", () => {
  beforeEach(() => {
    state.company = { name: "Acme" };
    state.role = { id: "r1", title: "Software Engineer" };
    state.reviews = { data: [{ locationId: "l1" }], isSuccess: true };
    state.averages = { averageOverallRating: 4.2 };
    state.location = {
      isSuccess: true,
      data: { city: "Boston", state: "MA", country: "USA" },
    };
    state.compareMode = false;
  });

  test("renders the role title and company name", () => {
    render(<RoleCardPreview roleObj={roleObj} />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText(/Acme/)).toBeInTheDocument();
  });

  test("renders the rounded average rating and review count", () => {
    render(<RoleCardPreview roleObj={roleObj} />);
    expect(screen.getByText("4.2")).toBeInTheDocument();
    expect(screen.getByText("(1 review)")).toBeInTheDocument();
  });

  test("pluralizes the review count for multiple reviews", () => {
    state.reviews = {
      data: [{ locationId: "l1" }, { locationId: "l2" }],
      isSuccess: true,
    };
    render(<RoleCardPreview roleObj={roleObj} />);
    expect(screen.getByText("(2 reviews)")).toBeInTheDocument();
  });

  test("shows the favorite button outside compare mode", () => {
    render(<RoleCardPreview roleObj={roleObj} />);
    expect(screen.getByTestId("favorite-button")).toBeInTheDocument();
  });

  test("hides the favorite button in compare mode", () => {
    state.compareMode = true;
    render(<RoleCardPreview roleObj={roleObj} />);
    expect(screen.queryByTestId("favorite-button")).not.toBeInTheDocument();
  });
});
