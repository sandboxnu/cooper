import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import CompanyStatistics from "~/app/_components/companies/company-statistics";

describe("CompanyStatistics", () => {
  const workModels = [
    { name: "Remote", percentage: 50, count: 5 },
    { name: "Hybrid", percentage: 30, count: 3 },
    { name: "In-person", percentage: 20, count: 2 },
  ];
  const payStats = [
    { pay: "25", percentage: 40, count: 4 },
    { pay: "30", percentage: 60, count: 6 },
  ];
  const payRange = [
    { label: "Low", min: 0, max: 20 },
    { label: "Mid", min: 21, max: 35 },
    { label: "High", min: 36, max: 50 },
  ];

  test("renders Job type section with Co-op", () => {
    render(
      <CompanyStatistics
        workModels={workModels}
        reviews={10}
        payStats={payStats}
        payRange={payRange}
      />,
    );
    expect(screen.getByText("Job type")).toBeInTheDocument();
    expect(screen.getByText("Co-op")).toBeInTheDocument();
  });

  test("renders Work model section with model names", () => {
    render(
      <CompanyStatistics
        workModels={workModels}
        reviews={10}
        payStats={payStats}
        payRange={payRange}
      />,
    );
    expect(screen.getByText("Work model")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(screen.getByText("Hybrid")).toBeInTheDocument();
    expect(screen.getByText("In-person")).toBeInTheDocument();
  });

  test("renders Pay section", () => {
    render(
      <CompanyStatistics
        workModels={workModels}
        reviews={10}
        payStats={payStats}
        payRange={payRange}
      />,
    );
    expect(screen.getByText("Pay")).toBeInTheDocument();
  });
});
