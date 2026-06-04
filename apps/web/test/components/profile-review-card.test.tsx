import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const state: {
  role?: { title: string };
  company?: { name: string };
  location?: { city: string; state: string; country: string };
} = {};

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
vi.mock("~/trpc/react", () => ({
  api: {
    role: { getById: { useQuery: () => ({ data: state.role }) } },
    company: { getById: { useQuery: () => ({ data: state.company }) } },
    location: { getById: { useQuery: () => ({ data: state.location }) } },
  },
}));
vi.mock("~/app/_components/reviews/review-actions-dialogue", () => ({
  ReviewActionsDialog: () => <div data-testid="review-actions" />,
}));

import { ProfileReviewCard } from "~/app/_components/reviews/profile-review-card";

const review = {
  id: "rev-1",
  overallRating: 4.5,
  roleId: "role-1",
  companyId: "company-1",
  locationId: "loc-1",
  createdAt: new Date("2024-03-15T00:00:00Z"),
} as never;

describe("ProfileReviewCard", () => {
  beforeEach(() => {
    state.role = { title: "Software Engineer" };
    state.company = { name: "Acme" };
    state.location = { city: "Boston", state: "MA", country: "USA" };
  });

  test("renders the role title and rating", () => {
    render(<ProfileReviewCard reviewObj={review} />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  test("renders a subtitle combining company and location", () => {
    render(<ProfileReviewCard reviewObj={review} />);
    expect(screen.getByText(/Acme/)).toBeInTheDocument();
  });

  test("falls back to an em dash when the role is unknown", () => {
    state.role = undefined;
    render(<ProfileReviewCard reviewObj={review} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  test("renders the reviewed-on date and actions menu", () => {
    render(<ProfileReviewCard reviewObj={review} />);
    expect(screen.getByText(/Reviewed on/)).toBeInTheDocument();
    expect(screen.getByTestId("review-actions")).toBeInTheDocument();
  });
});
