import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CompanyCardPreview } from "~/app/_components/companies/company-card-preview";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test mock
    <img src="/star.svg" alt={alt} />
  ),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    companyToLocation: {
      getLocationsByCompanyId: {
        useQuery: () => ({ data: [] }),
      },
    },
    company: {
      getAverageById: {
        useQuery: () => ({ data: { averageOverallRating: 4.2 } }),
      },
    },
    review: {
      getByCompany: {
        useQuery: () => ({ data: [{ id: "1" }] }),
      },
    },
  },
}));

vi.mock("@cooper/ui/logo", () => ({
  default: () => <div data-testid="logo">Logo</div>,
}));

vi.mock("~/app/_components/shared/favorite-button", () => ({
  FavoriteButton: () => <button type="button">Favorite</button>,
}));

describe("CompanyCardPreview", () => {
  const companyObj = {
    id: "c1",
    name: "Test Company",
  } as never;

  test("renders company name", () => {
    render(<CompanyCardPreview companyObj={companyObj} />);
    expect(screen.getByText("Test Company")).toBeInTheDocument();
  });

  test("renders average rating when present", () => {
    render(<CompanyCardPreview companyObj={companyObj} />);
    expect(screen.getByText("4.2")).toBeInTheDocument();
  });

  test("renders review count", () => {
    render(<CompanyCardPreview companyObj={companyObj} />);
    expect(screen.getByText(/1 review/)).toBeInTheDocument();
  });

  test("renders Location not specified when no locations", () => {
    render(<CompanyCardPreview companyObj={companyObj} />);
    expect(screen.getByText("Location not specified")).toBeInTheDocument();
  });
});
