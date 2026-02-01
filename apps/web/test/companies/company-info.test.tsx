import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import CompanyInfo from "~/app/_components/companies/company-info";

vi.mock("~/trpc/react", () => ({
  api: {
    company: {
      getById: {
        useQuery: () => ({
          isSuccess: true,
          data: {
            id: "c1",
            name: "Acme Corp",
          },
        }),
      },
    },
    review: {
      getByCompany: {
        useQuery: () => ({ data: [] }),
      },
    },
    useQueries: () => [],
  },
}));

vi.mock("@cooper/ui/logo", () => ({
  default: () => <div data-testid="logo">Logo</div>,
}));

vi.mock("~/app/_components/shared/favorite-button", () => ({
  FavoriteButton: () => <button type="button">Favorite</button>,
}));

vi.mock("~/app/_components/companies/all-company-roles", () => ({
  default: () => <div data-testid="all-roles">All Roles</div>,
}));

vi.mock("~/app/_components/companies/company-about", () => ({
  CompanyAbout: () => <div data-testid="company-about">About</div>,
}));

vi.mock("~/app/_components/companies/company-reviews", () => ({
  CompanyReview: () => <div data-testid="company-review">Reviews</div>,
}));

vi.mock("~/app/_components/no-results", () => ({
  default: () => <div data-testid="no-results">No results</div>,
}));

describe("CompanyInfo", () => {
  const companyObj = { id: "c1", name: "Acme Corp" } as never;

  test("renders company name when query succeeds", () => {
    render(<CompanyInfo companyObj={companyObj} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  test("renders CompanyAbout and CompanyReview", () => {
    render(<CompanyInfo companyObj={companyObj} />);
    expect(screen.getByTestId("company-about")).toBeInTheDocument();
    expect(screen.getByTestId("company-review")).toBeInTheDocument();
  });

  test("renders RenderAllRoles", () => {
    render(<CompanyInfo companyObj={companyObj} />);
    expect(screen.getByTestId("all-roles")).toBeInTheDocument();
  });
});
