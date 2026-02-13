import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CompanyReview } from "~/app/_components/companies/company-reviews";

vi.mock("~/trpc/react", () => ({
  api: {
    review: {
      getByCompany: {
        useQuery: () => ({
          data: [
            {
              id: "r1",
              overallRating: 4,
              workEnvironment: "REMOTE",
              hourlyPay: "25",
            },
          ],
        }),
      },
      list: { useQuery: () => ({ data: [{ overallRating: 4 }] }) },
    },
    company: {
      getAverageById: {
        useQuery: () => ({ data: { averageOverallRating: 4.2 } }),
      },
    },
  },
}));

vi.mock("~/app/_components/shared/star-graph", () => ({
  default: () => <div data-testid="star-graph">StarGraph</div>,
}));

vi.mock("~/app/_components/companies/company-statistics", () => ({
  default: () => <div data-testid="company-statistics">Statistics</div>,
}));

describe("CompanyReview", () => {
  test("renders StarGraph", () => {
    render(<CompanyReview companyObj={{ id: "c1", name: "Test" } as never} />);
    expect(screen.getByTestId("star-graph")).toBeInTheDocument();
  });

  test("renders CompanyStatistics when reviews exist", () => {
    render(<CompanyReview companyObj={{ id: "c1", name: "Test" } as never} />);
    expect(screen.getByTestId("company-statistics")).toBeInTheDocument();
  });
});
