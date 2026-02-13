import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import RenderAllRoles from "~/app/_components/companies/all-company-roles";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    role: {
      getByCompany: {
        useQuery: () => ({
          isPending: true,
          isSuccess: false,
          data: undefined,
        }),
      },
    },
  },
}));

vi.mock("~/app/_components/loading-results", () => ({
  default: () => <div data-testid="loading-results">Loading...</div>,
}));

vi.mock("~/app/_components/reviews/role-card-preview", () => ({
  RoleCardPreview: () => <div>Role</div>,
}));

vi.mock("~/app/_components/reviews/new-role-card", () => ({
  default: () => <div>New Role</div>,
}));

describe("RenderAllRoles loading state", () => {
  test("renders LoadingResults when query is pending", () => {
    render(<RenderAllRoles company={{ id: "c1", name: "Acme" } as never} />);
    expect(screen.getByTestId("loading-results")).toBeInTheDocument();
  });
});
