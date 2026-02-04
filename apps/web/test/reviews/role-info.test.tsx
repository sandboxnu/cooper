import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { RoleInfo } from "~/app/_components/reviews/role-info";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test mock
    <img alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("~/trpc/react", () => ({
  api: {
    review: {
      getByRole: {
        useQuery: () => ({
          data: [],
          isSuccess: true,
        }),
      },
      getByCompany: {
        useQuery: () => ({ data: [] }),
      },
      getByProfile: {
        useQuery: () => ({ data: [], isSuccess: true }),
      },
      list: {
        useQuery: () => ({ data: [] }),
      },
    },
    location: {
      getById: {
        useQuery: () => ({ data: null, isSuccess: false }),
      },
    },
    company: {
      getById: {
        useQuery: () => ({
          data: {
            id: "company-1",
            name: "Acme Corp",
            description: "A great company",
          },
        }),
      },
    },
    role: {
      getAverageById: {
        useQuery: () => ({
          data: {
            averageOverallRating: 4.2,
            averageCultureRating: 4,
            averageSupervisorRating: 4.5,
            minPay: 20,
            maxPay: 30,
            overtimeNormal: 0.5,
            pto: 0.8,
            averageInterviewRating: 4,
            averageInterviewDifficulty: 3,
            federalHolidays: 1,
            drugTest: 0,
            freeLunch: 0.5,
            freeMerch: 0.5,
            travelBenefits: 0,
            snackBar: 0.5,
          },
        }),
      },
    },
    profile: {
      getCurrentUser: {
        useQuery: () => ({ data: null }),
      },
    },
    useQueries: () => [],
  },
}));

vi.mock("~/app/_components/companies/company-popup", () => ({
  CompanyPopup: ({
    trigger,
    company,
  }: {
    trigger: React.ReactNode;
    company: { name: string };
  }) => (
    <div data-testid="company-popup">
      {trigger}
      <span>{company.name}</span>
    </div>
  ),
}));

vi.mock("~/app/_components/reviews/review-card", () => ({
  ReviewCard: () => <div data-testid="review-card">Review</div>,
}));

describe("RoleInfo", () => {
  const roleObj = {
    id: "role-1",
    companyId: "company-1",
    title: "Software Co-op",
    description: "Build software.",
  } as never;

  test("renders role title", () => {
    render(<RoleInfo roleObj={roleObj} />);
    expect(screen.getByText("Software Co-op")).toBeInTheDocument();
  });

  test("renders company name", () => {
    render(<RoleInfo roleObj={roleObj} />);
    expect(screen.getAllByText("Acme Corp").length).toBeGreaterThan(0);
  });

  test("renders Job Description section", () => {
    render(<RoleInfo roleObj={roleObj} />);
    expect(screen.getByText("Job Description")).toBeInTheDocument();
  });

  test("renders role description in Job Description", () => {
    render(<RoleInfo roleObj={roleObj} />);
    expect(screen.getByText("Build software.")).toBeInTheDocument();
  });

  test("renders On the job section", () => {
    render(<RoleInfo roleObj={roleObj} />);
    expect(screen.getByText("On the job")).toBeInTheDocument();
  });

  test("renders Pay section", () => {
    render(<RoleInfo roleObj={roleObj} />);
    expect(screen.getByText("Pay")).toBeInTheDocument();
  });

  test("renders Interview section", () => {
    render(<RoleInfo roleObj={roleObj} />);
    expect(screen.getByText("Interview")).toBeInTheDocument();
  });

  test("renders Reviews section", () => {
    render(<RoleInfo roleObj={roleObj} />);
    expect(screen.getByText("Reviews")).toBeInTheDocument();
  });

  test("renders No reviews yet when no reviews", () => {
    render(<RoleInfo roleObj={roleObj} />);
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
  });

  test("renders back button when onBack provided and calls onBack when clicked", () => {
    const onBack = vi.fn();
    const { container } = render(
      <RoleInfo roleObj={roleObj} onBack={onBack} />,
    );
    const backSvg = container.querySelector('svg[viewBox="0 0 14 12"]');
    expect(backSvg).toBeInTheDocument();
    if (backSvg) fireEvent.click(backSvg);
    expect(onBack).toHaveBeenCalled();
  });
});
