import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { CompanyType } from "@cooper/db/schema";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

let rolesQuery: {
  data?: { id: string; slug: string }[];
  isPending: boolean;
  isSuccess: boolean;
};

vi.mock("~/trpc/react", () => ({
  api: {
    role: {
      getByCompany: { useQuery: () => rolesQuery },
    },
  },
}));

vi.mock("@cooper/ui", () => ({
  cn: (...inputs: unknown[]) => inputs.flat().filter(Boolean).join(" "),
}));

vi.mock("~/app/_components/loading-results", () => ({
  default: () => <div data-testid="loading" />,
}));

vi.mock("~/app/_components/roles/role-card-preview", () => ({
  RoleCardPreview: ({ roleObj }: { roleObj: { slug: string } }) => (
    <div data-testid="role-card">{roleObj.slug}</div>
  ),
}));

import RenderAllRoles from "~/app/_components/companies/all-company-roles";

const company = {
  id: "c1",
  name: "Acme Corp",
  slug: "acme",
} as unknown as CompanyType;

beforeEach(() => {
  vi.clearAllMocks();
  rolesQuery = {
    data: [
      { id: "r1", slug: "engineer" },
      { id: "r2", slug: "designer" },
    ],
    isPending: false,
    isSuccess: true,
  };
});

describe("RenderAllRoles", () => {
  test("renders heading with company name and role count", () => {
    render(<RenderAllRoles company={company} />);
    expect(screen.getByText(/Roles at Acme Corp/)).toBeInTheDocument();
    expect(screen.getAllByTestId("role-card")).toHaveLength(2);
  });

  test("shows loading state while pending", () => {
    rolesQuery = { data: undefined, isPending: true, isSuccess: false };
    render(<RenderAllRoles company={company} />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  test("renders no cards when there are no roles", () => {
    rolesQuery = { data: [], isPending: false, isSuccess: true };
    render(<RenderAllRoles company={company} />);
    expect(screen.queryByTestId("role-card")).toBeNull();
  });

  test("navigates and calls onClose when a role is clicked", () => {
    const onClose = vi.fn();
    render(<RenderAllRoles company={company} onClose={onClose} />);
    fireEvent.click(screen.getByText("engineer"));
    expect(onClose).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith(
      "/roles/?company=acme&type=roles&role=engineer",
    );
  });

  test("handles a null company without crashing", () => {
    rolesQuery = { data: [], isPending: false, isSuccess: true };
    render(<RenderAllRoles company={null} />);
    expect(screen.getByText(/Roles at/)).toBeInTheDocument();
  });
});
