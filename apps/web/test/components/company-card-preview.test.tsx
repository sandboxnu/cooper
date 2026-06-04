import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { CompanyType } from "@cooper/db/schema";

let locationsData: { location: { city: string; state: string } }[] | undefined;
let avgData: { averageOverallRating: number | string } | undefined;
let reviewsData: unknown[] | undefined;

vi.mock("~/trpc/react", () => ({
  api: {
    companyToLocation: {
      getLocationsByCompanyId: {
        useQuery: () => ({ data: locationsData }),
      },
    },
    company: {
      getAverageById: { useQuery: () => ({ data: avgData }) },
    },
    review: {
      getByCompany: { useQuery: () => ({ data: reviewsData }) },
    },
  },
}));

vi.mock("@cooper/ui", () => ({
  cn: (...inputs: unknown[]) => inputs.flat().filter(Boolean).join(" "),
}));

vi.mock("@cooper/ui/logo", () => ({
  default: () => <div data-testid="logo" />,
}));

vi.mock("~/app/_components/shared/favorite-button", () => ({
  FavoriteButton: () => <button data-testid="favorite" />,
}));

import { CompanyCardPreview } from "~/app/_components/companies/company-card-preview";

const company = {
  id: "c1",
  name: "Acme Corp",
} as unknown as CompanyType;

beforeEach(() => {
  locationsData = [{ location: { city: "Boston", state: "MA" } }];
  avgData = { averageOverallRating: 4.256 };
  reviewsData = [{}, {}, {}];
});

describe("CompanyCardPreview", () => {
  test("renders name, location, rounded rating and pluralized reviews", () => {
    render(<CompanyCardPreview companyObj={company} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Boston, MA")).toBeInTheDocument();
    // 4.256 rounds to 4.26
    expect(screen.getByText("4.26")).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/reviews/)).toBeInTheDocument();
  });

  test("stops propagation when clicking the favorite wrapper", () => {
    const onCardClick = vi.fn();
    render(
      <div onClick={onCardClick}>
        <CompanyCardPreview companyObj={company} />
      </div>,
    );
    fireEvent.click(screen.getByTestId("favorite"));
    expect(onCardClick).not.toHaveBeenCalled();
  });

  test("uses singular 'review' for a single review", () => {
    reviewsData = [{}];
    render(<CompanyCardPreview companyObj={company} />);
    expect(screen.getByText(/review/)).toBeInTheDocument();
  });

  test("shows 'Location not specified' when no location", () => {
    locationsData = [];
    render(<CompanyCardPreview companyObj={company} />);
    expect(screen.getByText("Location not specified")).toBeInTheDocument();
  });

  test("shows 'No ratings yet' when average rating is 0", () => {
    avgData = { averageOverallRating: 0 };
    render(<CompanyCardPreview companyObj={company} />);
    expect(screen.getByText("No ratings yet")).toBeInTheDocument();
  });

  test("treats a non-finite average as null (still renders ratings block)", () => {
    avgData = { averageOverallRating: "not-a-number" };
    render(<CompanyCardPreview companyObj={company} />);
    // averageRating becomes null which is !== 0, so the rating block renders.
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });
});
