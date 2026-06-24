import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/app/_components/themed/onboarding/input", () => ({
  Input: ({
    variant: _variant,
    onClear: _onClear,
    ...props
  }: Record<string, unknown>) => <input {...props} />,
}));
vi.mock("~/app/_components/companies/company-card-preview", () => ({
  CompanyCardPreview: ({ companyObj }: { companyObj: { name: string } }) => (
    <div data-testid="company-card">{companyObj.name}</div>
  ),
}));

import FavoriteCompanySearch from "~/app/_components/profile/favorite-company-search";

const companies = [
  { id: "1", name: "Apple" },
  { id: "2", name: "Google" },
] as never[];

describe("FavoriteCompanySearch", () => {
  test("lists all favorite companies by default", () => {
    render(<FavoriteCompanySearch favoriteCompanies={companies} />);
    expect(screen.getAllByTestId("company-card")).toHaveLength(2);
  });

  test("filters companies by the typed prefix", () => {
    render(<FavoriteCompanySearch favoriteCompanies={companies} />);
    fireEvent.change(
      screen.getByPlaceholderText("Search for a saved company..."),
      { target: { value: "goo" } },
    );
    const cards = screen.getAllByTestId("company-card");
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent("Google");
  });

  test("shows an empty state when nothing matches", () => {
    render(<FavoriteCompanySearch favoriteCompanies={companies} />);
    fireEvent.change(
      screen.getByPlaceholderText("Search for a saved company..."),
      { target: { value: "zzz" } },
    );
    expect(screen.getByText("No saved companies found.")).toBeInTheDocument();
  });

  test("shows the empty state with no favorites", () => {
    render(<FavoriteCompanySearch favoriteCompanies={[]} />);
    expect(screen.getByText("No saved companies found.")).toBeInTheDocument();
  });
});
