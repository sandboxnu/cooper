import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ReviewCard } from "~/app/_components/reviews/review-card";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img src={src} alt={alt} />
  ),
}));

const mockGetById = vi.fn(() => ({ data: null }));
const mockCurrentUser = vi.fn(() => ({ data: null }));
vi.mock("~/trpc/react", () => ({
  api: {
    profile: {
      getCurrentUser: {
        useQuery: () => mockCurrentUser(),
      },
    },
    location: {
      getById: {
        useQuery: () => mockGetById(),
      },
    },
  },
}));

vi.mock("~/app/_components/reviews/delete-review-dialogue", () => ({
  DeleteReviewDialog: () => <span data-testid="delete-dialog">Delete</span>,
}));

describe("ReviewCard", () => {
  const reviewObj = {
    id: "rev-1",
    profileId: "profile-1",
    locationId: "loc-1",
    overallRating: 4.5,
    workTerm: "SUMMER",
    workYear: "2024",
    textReview: "Great experience.",
    workEnvironment: "HYBRID",
    hourlyPay: 25,
    reviewHeadline: null,
    interviewReview: null,
  } as never;

  test("renders overall rating", () => {
    mockGetById.mockReturnValue({ data: null });
    render(<ReviewCard reviewObj={reviewObj} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  test("renders work term and year", () => {
    mockGetById.mockReturnValue({ data: null });
    render(<ReviewCard reviewObj={reviewObj} />);
    expect(screen.getByText(/Summer 2024/)).toBeInTheDocument();
  });

  test("renders text review", () => {
    mockGetById.mockReturnValue({ data: null });
    render(<ReviewCard reviewObj={reviewObj} />);
    expect(screen.getAllByText("Great experience.").length).toBeGreaterThan(0);
  });

  test("renders job type and pay", () => {
    mockGetById.mockReturnValue({ data: null });
    render(<ReviewCard reviewObj={reviewObj} />);
    expect(screen.getByText(/Co-op/)).toBeInTheDocument();
    expect(screen.getByText(/\$25\/hr/)).toBeInTheDocument();
  });

  test("renders location when location data is present", () => {
    mockGetById.mockReturnValue({
      data: {
        city: "Boston",
        state: "MA",
        country: "USA",
      },
    });
    render(<ReviewCard reviewObj={reviewObj} />);
    expect(screen.getByText(/Boston/)).toBeInTheDocument();
  });

  test("does not show delete dialog when user is not author", () => {
    mockGetById.mockReturnValue({ data: null });
    render(<ReviewCard reviewObj={reviewObj} />);
    expect(screen.queryByTestId("delete-dialog")).not.toBeInTheDocument();
  });

  test("shows delete dialog when current user is author", () => {
    mockCurrentUser.mockReturnValue({ data: { id: "profile-1" } });
    mockGetById.mockReturnValue({ data: null });
    render(<ReviewCard reviewObj={reviewObj} />);
    expect(screen.getAllByTestId("delete-dialog").length).toBeGreaterThan(0);
  });
});
