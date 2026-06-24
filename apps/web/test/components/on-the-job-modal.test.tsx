import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { OnTheJobModal } from "~/app/_components/roles/modals/on-the-job-modal";

const averages = {
  averageCultureRating: 4,
  averageSupervisorRating: 4,
  federalHolidays: 0.8,
  drugTest: 0.2,
  freeLunch: 0.5,
  freeMerch: 0.5,
  travelBenefits: 0.3,
  snackBar: 0.4,
  pto: 0.5,
  totalReviews: 10,
  workEnvironmentMode: "Hybrid",
  workEnvironmentAlerts: [],
  jobLengthMin: 4,
  jobLengthMax: 6,
  workHoursMin: 40,
  workHoursMax: 40,
  overtimeCount: 2,
  accessibleByTransportation: 0.7,
  teamOutingsCount: 5,
  coffeeChatCount: 3,
  constructiveFeedbackCount: 7,
  onboarding: 0.9,
  workStructure: 0.6,
  careerGrowth: 0.8,
  tools: ["React", "Figma"],
};

describe("OnTheJobModal", () => {
  test("renders the section title and KPI tiles when comparing", () => {
    render(<OnTheJobModal averages={averages} isComparing />);
    expect(screen.getByText("On the Job")).toBeInTheDocument();
    expect(screen.getByText("Work model")).toBeInTheDocument();
    expect(screen.getByText("Hybrid")).toBeInTheDocument();
    expect(screen.getByText("Job length")).toBeInTheDocument();
    expect(screen.getByText("4-6 months")).toBeInTheDocument();
  });

  test("renders the benefits table rows", () => {
    render(<OnTheJobModal averages={averages} isComparing />);
    expect(screen.getByText("Work Schedule")).toBeInTheDocument();
    expect(screen.getByText("40 hours per week")).toBeInTheDocument();
    expect(screen.getByText("Transportation")).toBeInTheDocument();
    expect(
      screen.getByText("Accessible by transportation"),
    ).toBeInTheDocument();
    expect(screen.getByText("Drug test")).toBeInTheDocument();
    expect(screen.getByText("Tools & software")).toBeInTheDocument();
    expect(screen.getByText("React, Figma")).toBeInTheDocument();
  });

  test("renders the culture and support cards", () => {
    render(<OnTheJobModal averages={averages} isComparing />);
    expect(screen.getByText("Company culture")).toBeInTheDocument();
    expect(screen.getByText("Co-op support")).toBeInTheDocument();
    expect(screen.getByText("Onboarding")).toBeInTheDocument();
    // onboarding 0.9 -> 90% agree
    expect(screen.getByText("90% agree")).toBeInTheDocument();
  });

  test("shows No data fallbacks when there are no reviews", () => {
    render(
      <OnTheJobModal
        averages={{
          ...averages,
          totalReviews: 0,
          tools: [],
          workHoursMin: null,
          workHoursMax: null,
        }}
        isComparing
      />,
    );
    expect(screen.getAllByText("No data").length).toBeGreaterThan(0);
  });
});
