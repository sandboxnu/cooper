import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import StarGraph from "~/app/_components/shared/star-graph";

const ratings = [
  { stars: 5, percentage: 50 },
  { stars: 4, percentage: 30 },
  { stars: 3, percentage: 20 },
];

describe("StarGraph", () => {
  test("renders the average rating to one decimal place", () => {
    render(
      <StarGraph
        ratings={ratings}
        averageOverallRating={4.25}
        reviews={10}
        cooperAvg={3.8}
      />,
    );
    expect(screen.getByText("4.3")).toBeInTheDocument();
  });

  test("pluralizes the review count", () => {
    render(
      <StarGraph
        ratings={ratings}
        averageOverallRating={4}
        reviews={10}
        cooperAvg={3.8}
      />,
    );
    expect(screen.getByText("Based on 10 reviews")).toBeInTheDocument();
  });

  test("uses the singular form for a single review", () => {
    render(
      <StarGraph
        ratings={ratings}
        averageOverallRating={4}
        reviews={1}
        cooperAvg={3.8}
      />,
    );
    expect(screen.getByText("Based on 1 review")).toBeInTheDocument();
  });

  test("renders the Cooper average", () => {
    render(
      <StarGraph
        ratings={ratings}
        averageOverallRating={4}
        reviews={10}
        cooperAvg={3.8}
      />,
    );
    expect(screen.getByText("Cooper average: 3.8")).toBeInTheDocument();
  });

  test("renders a row per rating bucket with its computed count", () => {
    render(
      <StarGraph
        ratings={ratings}
        averageOverallRating={4}
        reviews={10}
        cooperAvg={3.8}
      />,
    );
    // 50% of 10 reviews -> 5
    expect(screen.getByText("5")).toBeInTheDocument();
    // 30% of 10 -> 3
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("5 stars")).toBeInTheDocument();
  });
});
