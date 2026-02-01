import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import FavoriteCompanySearch from "~/app/_components/profile/favorite-company-search";

vi.mock("~/app/_components/companies/company-card-preview", () => ({
  CompanyCardPreview: ({ companyObj }: { companyObj: { name: string } }) => (
    <div data-testid="company-card">{companyObj.name}</div>
  ),
}));

describe("FavoriteCompanySearch", () => {
  test("renders search input with placeholder", () => {
    render(<FavoriteCompanySearch favoriteCompanies={[]} />);
    expect(
      screen.getByPlaceholderText("Search for a saved company..."),
    ).toBeInTheDocument();
  });

  test("renders No saved companies found when list is empty", () => {
    render(<FavoriteCompanySearch favoriteCompanies={[]} />);
    expect(
      screen.getByText("No saved companies found."),
    ).toBeInTheDocument();
  });

  test("renders company cards when companies are provided", () => {
    const companies = [
      { id: "c1", name: "Acme Corp" },
      { id: "c2", name: "Beta Inc" },
    ] as never[];
    render(<FavoriteCompanySearch favoriteCompanies={companies} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Beta Inc")).toBeInTheDocument();
    expect(screen.getAllByTestId("company-card")).toHaveLength(2);
  });

  test("filters companies by search prefix", () => {
    const companies = [
      { id: "c1", name: "Acme Corp" },
      { id: "c2", name: "Beta Inc" },
    ] as never[];
    render(<FavoriteCompanySearch favoriteCompanies={companies} />);
    const input = screen.getByPlaceholderText(
      "Search for a saved company...",
    );
    fireEvent.change(input, { target: { value: "Ac" } });
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.queryByText("Beta Inc")).not.toBeInTheDocument();
  });

  test("shows no results message when filter matches nothing", () => {
    const companies = [{ id: "c1", name: "Acme Corp" }] as never[];
    render(<FavoriteCompanySearch favoriteCompanies={companies} />);
    const input = screen.getByPlaceholderText(
      "Search for a saved company...",
    );
    fireEvent.change(input, { target: { value: "Z" } });
    expect(
      screen.getByText("No saved companies found."),
    ).toBeInTheDocument();
  });
});
