import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import StarGraph from "~/app/_components/shared/star-graph";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test mock
    <img src="/star.svg" alt={alt} data-testid="star-icon" />
  ),
}));

describe("StarGraph", () => {
  const defaultRatings = [
    { stars: 5, percentage: 40 },
    { stars: 4, percentage: 30 },
    { stars: 3, percentage: 20 },
    { stars: 2, percentage: 10 },
    { stars: 1, percentage: 0 },
  ];

  test("renders overall rating heading", () => {
    render(
      <StarGraph
        ratings={defaultRatings}
        averageOverallRating={4.2}
        reviews={10}
        cooperAvg={4.0}
      />,
    );
    expect(screen.getByText("Overall rating")).toBeInTheDocument();
  });

  test("renders average rating", () => {
    render(
      <StarGraph
        ratings={defaultRatings}
        averageOverallRating={4.2}
        reviews={10}
        cooperAvg={4.0}
      />,
    );
    expect(screen.getByText("4.2")).toBeInTheDocument();
  });

  test("renders review count singular", () => {
    render(
      <StarGraph
        ratings={defaultRatings}
        averageOverallRating={5}
        reviews={1}
        cooperAvg={4.0}
      />,
    );
    expect(screen.getByText("Based on 1 review")).toBeInTheDocument();
  });

  test("renders review count plural", () => {
    render(
      <StarGraph
        ratings={defaultRatings}
        averageOverallRating={4}
        reviews={5}
        cooperAvg={4.0}
      />,
    );
    expect(screen.getByText("Based on 5 reviews")).toBeInTheDocument();
  });

  test("renders Cooper average", () => {
    render(
      <StarGraph
        ratings={defaultRatings}
        averageOverallRating={4}
        reviews={5}
        cooperAvg={4.0}
      />,
    );
    expect(screen.getByText("Cooper average: 4")).toBeInTheDocument();
  });

  test("renders star bars for each rating", () => {
    render(
      <StarGraph
        ratings={defaultRatings}
        averageOverallRating={4}
        reviews={5}
        cooperAvg={4.0}
      />,
    );
    expect(screen.getByText("5 stars")).toBeInTheDocument();
    expect(screen.getByText("4 stars")).toBeInTheDocument();
    expect(screen.getByText("3 stars")).toBeInTheDocument();
    expect(screen.getByText("2 stars")).toBeInTheDocument();
    expect(screen.getByText("1 stars")).toBeInTheDocument();
  });
});
