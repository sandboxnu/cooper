import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { ReviewType } from "@cooper/db/schema";

let locationData: { city: string; state: string; country: string } | undefined;

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
vi.mock("~/trpc/react", () => ({
  api: {
    location: { getById: { useQuery: () => ({ data: locationData }) } },
  },
}));
vi.mock("~/app/_components/shared/report-button", () => ({
  ReportButton: ({ entityId }: { entityId: string }) => (
    <div data-testid="report-button">{entityId}</div>
  ),
}));

import { ReviewCard } from "~/app/_components/reviews/review-card";

const baseReview = {
  id: "rev-1",
  overallRating: 4.2,
  workTerm: "SPRING",
  workYear: 2024,
  textReview: "Great experience overall",
  jobType: "CO-OP",
  workEnvironment: "REMOTE",
  hourlyPay: "25",
  locationId: "loc-1",
} as unknown as ReviewType;

describe("ReviewCard", () => {
  beforeEach(() => {
    locationData = { city: "Boston", state: "MA", country: "USA" };
  });

  test("renders the rating, term, and pay", () => {
    render(<ReviewCard reviewObj={baseReview} />);
    expect(screen.getByText("4.2")).toBeInTheDocument();
    expect(screen.getByText(/Spring/)).toBeInTheDocument();
    expect(screen.getByText("25", { exact: false })).toBeInTheDocument();
  });

  test("maps CO-OP job type to the friendly label", () => {
    render(<ReviewCard reviewObj={baseReview} />);
    expect(screen.getAllByText("Co-op").length).toBeGreaterThan(0);
  });

  test("falls back to N/A when there is no overall rating", () => {
    render(<ReviewCard reviewObj={{ ...baseReview, overallRating: null }} />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  test("renders the report button for the review", () => {
    render(<ReviewCard reviewObj={baseReview} />);
    expect(screen.getByTestId("report-button")).toHaveTextContent("rev-1");
  });
});
