import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import InfoCard from "~/app/_components/reviews/info-card";

describe("InfoCard", () => {
  test("renders title", () => {
    render(
      <InfoCard title="Job Description">
        <p>Description text</p>
      </InfoCard>,
    );
    expect(screen.getByText("Job Description")).toBeInTheDocument();
  });

  test("renders children", () => {
    render(
      <InfoCard title="Section">
        <p>Child content</p>
      </InfoCard>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  test("applies title in header and content in body", () => {
    render(
      <InfoCard title="About Company">
        <span data-testid="body">Body content</span>
      </InfoCard>,
    );
    expect(screen.getByText("About Company")).toBeInTheDocument();
    expect(screen.getByTestId("body")).toBeInTheDocument();
  });
});
