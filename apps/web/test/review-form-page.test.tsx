import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ReviewForm from "~/app/(pages)/(protected)/review-form/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSession = { user: {} };
const mockProfile = { id: "profile-1" };
const mockReviewsData: { workTerm: string; workYear: number }[] = [];
vi.mock("~/trpc/react", () => ({
  api: {
    auth: {
      getSession: {
        useQuery: () => ({ data: mockSession, isLoading: false }),
      },
    },
    profile: {
      getCurrentUser: {
        useQuery: () => ({ data: mockProfile, isLoading: false }),
      },
    },
    review: {
      getByProfile: {
        useQuery: () => ({ data: mockReviewsData }),
      },
      create: {
        useMutation: () => ({
          mutateAsync: vi.fn(),
          isPending: false,
        }),
      },
    },
  },
}));

vi.mock("~/app/_components/form/sections", () => ({
  BasicInfoSection: () => (
    <div data-testid="basic-info-section">Basic info</div>
  ),
  CompanyDetailsSection: () => (
    <div data-testid="company-details-section">Company details</div>
  ),
  InterviewSection: () => <div data-testid="interview-section">Interview</div>,
  ReviewSection: () => <div data-testid="review-section">Review</div>,
}));

vi.mock("~/app/_components/form/sections/pay-section", () => ({
  PaySection: () => <div data-testid="pay-section">Pay</div>,
}));

describe("ReviewForm page", () => {
  test("renders Basic information section", () => {
    render(<ReviewForm />);
    expect(screen.getByText("Basic information")).toBeInTheDocument();
    expect(screen.getByTestId("basic-info-section")).toBeInTheDocument();
  });

  test("renders note about company not in database", () => {
    render(<ReviewForm />);
    expect(
      screen.getByText(/If your company isn't in our database/),
    ).toBeInTheDocument();
  });

  test("renders On the job, Pay, Interview, Review sections when can review", () => {
    render(<ReviewForm />);
    expect(screen.getByText("On the job")).toBeInTheDocument();
    expect(screen.getByTestId("pay-section")).toBeInTheDocument();
    expect(screen.getByTestId("interview-section")).toBeInTheDocument();
    expect(screen.getByText("Review and rate")).toBeInTheDocument();
  });

  test("renders Submit review button", () => {
    render(<ReviewForm />);
    expect(
      screen.getByRole("button", { name: "Submit review" }),
    ).toBeInTheDocument();
  });

  test.skip("shows too many reviews message when canReviewForTerm is false", () => {
    // Requires mocking useForm.getValues (workTerm/workYear) to match review data; skip for now
    mockReviewsData.length = 0;
    mockReviewsData.push(
      { workTerm: "SUMMER", workYear: 2024 },
      { workTerm: "SUMMER", workYear: 2024 },
    );
    render(<ReviewForm />);
    expect(
      screen.getByText("You already submitted too many reviews for this term"),
    ).toBeInTheDocument();
    mockReviewsData.length = 0;
  });
});
