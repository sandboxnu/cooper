import React from "react";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CompanyPopup } from "~/app/_components/companies/company-popup";

vi.mock("node_modules/@cooper/ui/src/logo", () => ({
  default: ({ company }: { company: { name: string } }) => (
    <span data-testid="company-logo">{company.name}</span>
  ),
}));

vi.mock("~/app/_components/shared/favorite-button", () => ({
  FavoriteButton: () => <button data-testid="favorite-button">Favorite</button>,
}));

vi.mock("~/app/_components/companies/all-company-roles", () => ({
  default: () => <div data-testid="all-company-roles">Roles</div>,
}));

vi.mock("~/app/_components/companies/company-about", () => ({
  CompanyAbout: () => <div data-testid="company-about">About</div>,
}));

vi.mock("~/app/_components/companies/company-reviews", () => ({
  CompanyReview: () => <div data-testid="company-reviews">Reviews</div>,
}));

const mockCompany = {
  id: "company-1",
  name: "Test Company",
  slug: "test-company",
} as never;

describe("CompanyPopup", () => {
  test("renders trigger when provided", () => {
    render(
      <CompanyPopup
        trigger={<span>Open company</span>}
        company={mockCompany}
      />,
    );
    expect(screen.getByText("Open company")).toBeInTheDocument();
  });

  test("opens dialog and shows company name when trigger clicked", () => {
    render(
      <CompanyPopup
        trigger={<button type="button">View company</button>}
        company={mockCompany}
      />,
    );
    fireEvent.click(screen.getByText("View company"));
    expect(
      screen.getByRole("heading", { name: "Test Company" }),
    ).toBeInTheDocument();
  });

  test("shows single location when locations has one item", () => {
    render(
      <CompanyPopup
        trigger={<button type="button">Open</button>}
        company={mockCompany}
        locations={["Boston, MA"]}
      />,
    );
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Boston, MA")).toBeInTheDocument();
  });

  test("shows location count when locations has multiple items", () => {
    render(
      <CompanyPopup
        trigger={<button type="button">Open</button>}
        company={mockCompany}
        locations={["Boston, MA", "New York, NY", "Chicago, IL"]}
      />,
    );
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText(/Boston, MA \+2 others/)).toBeInTheDocument();
  });

  test("shows CompanyAbout and CompanyReview in dialog", () => {
    render(
      <CompanyPopup
        trigger={<button type="button">Open</button>}
        company={mockCompany}
      />,
    );
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByTestId("company-about")).toBeInTheDocument();
    expect(screen.getByTestId("company-reviews")).toBeInTheDocument();
  });

  test("shows FavoriteButton in dialog", () => {
    render(
      <CompanyPopup
        trigger={<button type="button">Open</button>}
        company={mockCompany}
      />,
    );
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByTestId("favorite-button")).toBeInTheDocument();
  });
});
