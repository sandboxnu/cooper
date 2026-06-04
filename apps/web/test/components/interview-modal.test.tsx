import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { InterviewModal } from "~/app/_components/roles/modals/interview-modal";

const roleData = {
  totalReviewsWithRounds: 5,
  roundsMode: 3,
  roundsDistribution: [
    { rounds: 2, count: 2 },
    { rounds: 3, count: 3 },
  ],
  types: [
    {
      type: "behavioral",
      reviewCount: 3,
      dominantDifficulty: "average" as const,
    },
    { type: "technical", reviewCount: 2, dominantDifficulty: "hard" as const },
  ],
  overallDominantDifficulty: "average" as const,
  industryName: "TECHNOLOGY",
};

const distData = {
  roundsMode: 3,
  roundsDistribution: [{ rounds: 3, count: 4 }],
};

describe("InterviewModal", () => {
  test("compact: renders the Interview title and types section", () => {
    render(
      <InterviewModal
        roleData={roleData}
        industryData={distData}
        globalData={distData}
        compact
      />,
    );
    expect(screen.getByText("Interview")).toBeInTheDocument();
    expect(screen.getByText("Interview Types")).toBeInTheDocument();
  });

  test("compact: shows the no-type fallback when there are no rounds", () => {
    render(
      <InterviewModal
        roleData={{
          ...roleData,
          totalReviewsWithRounds: 0,
          types: [],
        }}
        industryData={distData}
        globalData={distData}
        compact
      />,
    );
    expect(screen.getByText("No interview type data")).toBeInTheDocument();
  });

  test("full: renders the rounds panel with the tab toggle", () => {
    render(
      <InterviewModal
        roleData={roleData}
        industryData={distData}
        globalData={distData}
      />,
    );
    expect(screen.getByText("Number of rounds")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Total" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Industry" }),
    ).toBeInTheDocument();
  });
});
