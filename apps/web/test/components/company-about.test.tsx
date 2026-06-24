import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import type { CompanyType } from "@cooper/db/schema";

import { CompanyAbout } from "~/app/_components/companies/company-about";

const company = {
  id: "c1",
  name: "Acme Corp",
  description: "We build anvils.",
} as unknown as CompanyType;

describe("CompanyAbout", () => {
  test("renders the company name and description", () => {
    render(<CompanyAbout companyObj={company} />);
    expect(screen.getByText("About Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("We build anvils.")).toBeInTheDocument();
  });

  test("renders gracefully when companyObj is undefined", () => {
    render(<CompanyAbout companyObj={undefined} />);
    // "About " with no name still renders the heading text node.
    expect(screen.getByText(/About/)).toBeInTheDocument();
  });
});
