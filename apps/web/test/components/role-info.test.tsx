import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const state: {
  reviews: { data: unknown[]; isSuccess: boolean };
  company?: { id: string; name: string; industry: string };
  averages?: { averageOverallRating: number };
  location: { isSuccess: boolean; data?: unknown };
  compareMode: boolean;
} = {
  reviews: { data: [], isSuccess: false },
  location: { isSuccess: false },
  compareMode: false,
};

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
vi.mock("~/trpc/react", () => {
  const q = (data: unknown) => ({ useQuery: () => ({ data }) });
  return {
    api: {
      review: {
        getByRole: {
          useQuery: () => ({
            data: state.reviews.data,
            isSuccess: state.reviews.isSuccess,
          }),
        },
        getInterviewDataByIndustry: q(undefined),
        getInterviewDataGlobal: q(undefined),
        getPayDataGlobal: q(undefined),
        getPayDataByIndustry: q(undefined),
        getByCompany: q([]),
      },
      location: { getById: { useQuery: () => state.location } },
      company: { getById: { useQuery: () => ({ data: state.company }) } },
      role: {
        getAverageById: { useQuery: () => ({ data: state.averages }) },
        getInterviewDataById: q(undefined),
      },
      useQueries: () => [],
    },
  };
});
vi.mock("~/app/_components/compare/compare-context", () => ({
  useCompare: () => ({
    isCompareMode: state.compareMode,
    comparedRoleIds: [],
    isDragging: false,
    removeRoleId: vi.fn(),
  }),
}));
vi.mock("~/app/_components/shared/favorite-button", () => ({
  FavoriteButton: () => <div data-testid="favorite-button" />,
}));
vi.mock("~/app/_components/shared/report-button", () => ({
  ReportButton: () => <div data-testid="report-button" />,
}));
vi.mock("~/app/_components/companies/company-popup", () => ({
  CompanyPopup: ({ trigger }: { trigger: React.ReactNode }) => (
    <div data-testid="company-popup">{trigger}</div>
  ),
}));
vi.mock("~/app/_components/companies/company-card-preview", () => ({
  CompanyCardPreview: ({ companyObj }: { companyObj: { name: string } }) => (
    <div data-testid="company-card">{companyObj.name}</div>
  ),
}));
vi.mock("~/app/_components/roles/modals/interview-modal", () => ({
  InterviewModal: () => <div data-testid="interview-modal" />,
}));
vi.mock("~/app/_components/roles/modals/on-the-job-modal", () => ({
  OnTheJobModal: () => <div data-testid="on-the-job-modal" />,
}));
vi.mock("~/app/_components/roles/modals/pay-modal", () => ({
  PayModal: () => <div data-testid="pay-modal" />,
}));
vi.mock("~/app/_components/roles/modals/review-modal", () => ({
  ReviewModal: () => <div data-testid="review-modal" />,
}));

import { RoleInfo } from "~/app/_components/roles/role-info";

const roleObj = {
  id: "r1",
  companyId: "c1",
  title: "Software Engineer",
} as never;

describe("RoleInfo", () => {
  beforeEach(() => {
    state.reviews = { data: [{ locationId: "l1" }], isSuccess: true };
    state.company = { id: "c1", name: "Acme", industry: "TECHNOLOGY" };
    state.averages = { averageOverallRating: 4.2 };
    state.location = {
      isSuccess: true,
      data: { city: "Boston", state: "MA", country: "USA" },
    };
    state.compareMode = false;
  });

  test("renders the role title and favorite/report controls", () => {
    render(<RoleInfo roleObj={roleObj} />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByTestId("favorite-button")).toBeInTheDocument();
    expect(screen.getByTestId("report-button")).toBeInTheDocument();
  });

  test("renders the on-the-job, interview, pay, and review modals", () => {
    render(<RoleInfo roleObj={roleObj} />);
    // Each section renders a mobile and a desktop variant.
    expect(screen.getAllByTestId("on-the-job-modal").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("interview-modal").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("pay-modal").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("review-modal").length).toBeGreaterThan(0);
  });

  test("renders the average rating and review count", () => {
    render(<RoleInfo roleObj={roleObj} />);
    expect(screen.getByText("4.2")).toBeInTheDocument();
    expect(screen.getByText(/1 review/)).toBeInTheDocument();
  });

  test("renders a back control when onBack is provided", () => {
    const onBack = vi.fn();
    const { container } = render(
      <RoleInfo roleObj={roleObj} onBack={onBack} />,
    );
    // The back affordance is an inline svg with an onClick handler.
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
