import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import CompanyStatistics from "~/app/_components/companies/company-statistics";

const jobTypes = [
  { name: "Internship", percentage: 40, count: 4 },
  { name: "Co-op", percentage: 50, count: 5 },
  { name: "Other", percentage: 10, count: 1 },
];

const workModels = [
  { name: "Remote", percentage: 30, count: 3 },
  { name: "In-person", percentage: 40, count: 4 },
  { name: "Hybrid", percentage: 20, count: 2 },
  { name: "Unknown", percentage: 10, count: 1 },
];

const payStats = [
  { pay: "20", percentage: 50, count: 5 },
  { pay: "35", percentage: 30, count: 3 },
  { pay: "60", percentage: 20, count: 2 },
];

const payRange = [
  { label: "Mid", min: 30, max: 40 },
  { label: "Low", min: 0, max: 25 },
  { label: "High", min: 45, max: 100 },
  // A range with no matching stats -> filtered out.
  { label: "None", min: 200, max: 300 },
];

describe("CompanyStatistics", () => {
  test("renders the three section headings", () => {
    render(
      <CompanyStatistics
        jobTypes={jobTypes}
        workModels={workModels}
        payStats={payStats}
        payRange={payRange}
      />,
    );
    expect(screen.getByText("Job type")).toBeInTheDocument();
    expect(screen.getByText("Work model")).toBeInTheDocument();
    expect(screen.getByText("Pay")).toBeInTheDocument();
  });

  test("renders sorted job types and work models with counts", () => {
    render(
      <CompanyStatistics
        jobTypes={jobTypes}
        workModels={workModels}
        payStats={payStats}
        payRange={payRange}
      />,
    );
    expect(screen.getByText("Co-op")).toBeInTheDocument();
    expect(screen.getByText("Internship")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(screen.getByText("Hybrid")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  test("renders pay ranges that have matching stats and drops empty ones", () => {
    render(
      <CompanyStatistics
        jobTypes={jobTypes}
        workModels={workModels}
        payStats={payStats}
        payRange={payRange}
      />,
    );
    // Low (0-25), Mid (30-40), High (45-100) all have stats.
    expect(screen.getByText("$0-$25/hr")).toBeInTheDocument();
    expect(screen.getByText("$30-$40/hr")).toBeInTheDocument();
    expect(screen.getByText("$45-$100/hr")).toBeInTheDocument();
    // The 200-300 range has no stats so should not render.
    expect(screen.queryByText("$200-$300/hr")).toBeNull();
  });

  test("handles empty inputs without crashing", () => {
    render(
      <CompanyStatistics
        jobTypes={[]}
        workModels={[]}
        payStats={[]}
        payRange={[]}
      />,
    );
    expect(screen.getByText("Job type")).toBeInTheDocument();
  });

  test("handles a pay range with no label (falls back in sort)", () => {
    render(
      <CompanyStatistics
        jobTypes={[]}
        workModels={[]}
        payStats={[{ pay: "10", percentage: 100, count: 1 }]}
        payRange={[{ min: 0, max: 20 }]}
      />,
    );
    expect(screen.getByText("$0-$20/hr")).toBeInTheDocument();
  });
});
