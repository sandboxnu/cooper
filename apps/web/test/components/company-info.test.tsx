import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { CompanyType } from "@cooper/db/schema";

let companyQuery: {
  data?: { id: string; name: string };
  isSuccess: boolean;
};
let reviewsQuery: { data?: { locationId: string | null }[] };
// Each location query result keyed by call order.
let locationResults: { data?: { city: string; state: string } }[];

vi.mock("~/trpc/react", () => ({
  api: {
    company: {
      getById: { useQuery: () => companyQuery },
    },
    review: {
      getByCompany: { useQuery: () => reviewsQuery },
    },
    useQueries: (
      build: (t: {
        location: {
          getById: (input: { id: string }) => { id: string };
        };
      }) => unknown[],
    ) => {
      // Invoke the builder so the proxy code path runs, then return our results.
      build({ location: { getById: ({ id }) => ({ id }) } });
      return locationResults;
    },
  },
}));

vi.mock("@cooper/ui/logo", () => ({
  default: () => <div data-testid="logo" />,
}));

vi.mock("~/app/_components/shared/favorite-button", () => ({
  FavoriteButton: () => <button data-testid="favorite" />,
}));

vi.mock("~/app/_components/shared/report-button", () => ({
  ReportButton: () => <button data-testid="report" />,
}));

vi.mock("~/app/_components/companies/all-company-roles", () => ({
  default: () => <div data-testid="all-roles" />,
}));

vi.mock("~/app/_components/companies/company-about", () => ({
  CompanyAbout: () => <div data-testid="about" />,
}));

vi.mock("~/app/_components/companies/company-reviews", () => ({
  CompanyReview: () => <div data-testid="reviews" />,
}));

vi.mock("~/app/_components/no-results", () => ({
  default: () => <div data-testid="no-results" />,
}));

import CompanyInfo from "~/app/_components/companies/company-info";

const company = { id: "c1", name: "Acme Corp" } as unknown as CompanyType;

beforeEach(() => {
  vi.clearAllMocks();
  companyQuery = { data: { id: "c1", name: "Acme Corp" }, isSuccess: true };
  reviewsQuery = {
    data: [{ locationId: "l1" }, { locationId: "l2" }, { locationId: null }],
  };
  locationResults = [
    { data: { city: "Boston", state: "MA" } },
    { data: { city: "Seattle", state: "WA" } },
  ];
});

describe("CompanyInfo", () => {
  test("renders company name and child sections on success", () => {
    render(<CompanyInfo companyObj={company} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByTestId("reviews")).toBeInTheDocument();
    expect(screen.getByTestId("about")).toBeInTheDocument();
    expect(screen.getByTestId("all-roles")).toBeInTheDocument();
  });

  test("shows multiple-locations label with +N others", () => {
    render(<CompanyInfo companyObj={company} />);
    // 2 locations -> "Boston, MA +1 other"
    expect(screen.getByText(/Boston, MA \+1 other/)).toBeInTheDocument();
  });

  test("shows a single location with no suffix", () => {
    reviewsQuery = { data: [{ locationId: "l1" }] };
    locationResults = [{ data: { city: "Boston", state: "MA" } }];
    render(<CompanyInfo companyObj={company} />);
    expect(screen.getByText("Boston, MA")).toBeInTheDocument();
  });

  test("renders the back chevron and fires onBack when clicked", () => {
    const onBack = vi.fn();
    const { container } = render(
      <CompanyInfo companyObj={company} onBack={onBack} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    fireEvent.click(svg!);
    expect(onBack).toHaveBeenCalled();
  });

  test("renders NoResults when the company query is not successful", () => {
    companyQuery = { data: undefined, isSuccess: false };
    render(<CompanyInfo companyObj={company} />);
    expect(screen.getByTestId("no-results")).toBeInTheDocument();
  });

  test("handles no locations (renders null location text)", () => {
    reviewsQuery = { data: [] };
    locationResults = [];
    render(<CompanyInfo companyObj={company} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });
});
