import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CompanyAbout } from "~/app/_components/companies/company-about";

describe("CompanyAbout", () => {
  test("renders About heading with company name", () => {
    render(
      <CompanyAbout
        companyObj={
          { name: "Acme Corp", description: "We build things." } as never
        }
      />,
    );
    expect(screen.getByText("About Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("We build things.")).toBeInTheDocument();
  });

  test("handles undefined companyObj", () => {
    render(<CompanyAbout companyObj={undefined} />);
    expect(screen.getByText(/About/)).toBeInTheDocument();
  });
});
