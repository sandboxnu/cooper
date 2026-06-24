import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { ReviewType } from "@cooper/db/schema";

const state: {
  role?: { title: string };
  company?: { name: string };
  location?: { city: string; state: string; country: string };
} = {};

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
vi.mock("~/utils/dateHelpers", () => ({
  formatLastEditedDate: () => "Edited just now",
}));

import { DraftReviewCard } from "~/app/_components/reviews/draft-review-card";

const draft = {
  id: "rev-1",
  overallRating: 3,
  roleId: "role-1",
  companyId: "company-1",
  locationId: "loc-1",
  updatedAt: new Date("2024-03-15T00:00:00Z"),
  createdAt: new Date("2024-03-10T00:00:00Z"),
} as unknown as ReviewType;

describe("DraftReviewCard", () => {
  beforeEach(() => {
    state.role = { title: "Software Engineer" };
    state.company = { name: "Acme" };
    state.location = { city: "Boston", state: "MA", country: "USA" };
  });

  test("renders the role title, company, and Draft badge", () => {
    render(<DraftReviewCard reviewObj={draft} />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  test("shows placeholder text when role and company are missing", () => {
    state.role = undefined;
    state.company = undefined;
    render(<DraftReviewCard reviewObj={draft} />);
    expect(screen.getByText("Job title")).toBeInTheDocument();
    expect(screen.getByText("Company name")).toBeInTheDocument();
  });

  test("renders the formatted last-edited date", () => {
    render(<DraftReviewCard reviewObj={draft} />);
    expect(screen.getByText("Edited just now")).toBeInTheDocument();
  });

  test("shows 0.0 rating placeholder when there is no rating", () => {
    render(<DraftReviewCard reviewObj={{ ...draft, overallRating: null }} />);
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });
});
