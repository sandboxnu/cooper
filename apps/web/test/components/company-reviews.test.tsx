import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { CompanyType } from "@cooper/db/schema";

let reviewsByCompany: { data?: unknown[] };
let avgById: { data?: { averageOverallRating: number } };
let reviewList: { data?: { overallRating: number | null }[] };

vi.mock("~/trpc/react", () => ({
  api: {
    review: {
      getByCompany: { useQuery: () => reviewsByCompany },
      list: { useQuery: () => reviewList },
    },
    company: {
      getAverageById: { useQuery: () => avgById },
    },
  },
}));

vi.mock("~/app/_components/shared/star-graph", () => ({
  default: ({
    reviews,
    averageOverallRating,
    cooperAvg,
  }: {
    reviews: number;
    averageOverallRating: number;
    cooperAvg: number;
  }) => (
    <div data-testid="star-graph">
      reviews:{reviews} avg:{averageOverallRating} cooper:{cooperAvg}
    </div>
  ),
}));

vi.mock("~/app/_components/companies/company-statistics", () => ({
  default: () => <div data-testid="company-stats" />,
}));

import { CompanyReview } from "~/app/_components/companies/company-reviews";

const company = { id: "c1", name: "Acme" } as unknown as CompanyType;

beforeEach(() => {
  reviewsByCompany = {
    data: [
      { overallRating: 5, workEnvironment: "REMOTE", jobType: "COOP", pay: 30 },
      {
        overallRating: 4,
        workEnvironment: "HYBRID",
        jobType: "INTERNSHIP",
        pay: 40,
      },
    ],
  };
  avgById = { data: { averageOverallRating: 4.5 } };
  reviewList = {
    data: [
      { overallRating: 5 },
      { overallRating: 3 },
      { overallRating: 0 },
      { overallRating: null },
    ],
  };
});

describe("CompanyReview", () => {
  test("renders StarGraph with computed cooper average", () => {
    render(<CompanyReview companyObj={company} />);
    const graph = screen.getByTestId("star-graph");
    expect(graph).toHaveTextContent("reviews:2");
    expect(graph).toHaveTextContent("avg:4.5");
    // (5 + 3) / 2 = 4, filtered out 0 and null.
    expect(graph).toHaveTextContent("cooper:4");
  });

  test("renders CompanyStatistics when there are reviews", () => {
    render(<CompanyReview companyObj={company} />);
    expect(screen.getByTestId("company-stats")).toBeInTheDocument();
  });

  test("hides CompanyStatistics when there are no reviews", () => {
    reviewsByCompany = { data: [] };
    render(<CompanyReview companyObj={company} />);
    expect(screen.queryByTestId("company-stats")).toBeNull();
  });

  test("handles all undefined data without crashing", () => {
    reviewsByCompany = { data: undefined };
    avgById = { data: undefined };
    reviewList = { data: undefined };
    render(<CompanyReview companyObj={undefined} />);
    const graph = screen.getByTestId("star-graph");
    expect(graph).toHaveTextContent("reviews:0");
    expect(graph).toHaveTextContent("avg:0");
  });
});
