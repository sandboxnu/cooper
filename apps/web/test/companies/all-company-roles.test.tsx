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
          isPending: false,
          isSuccess: true,
          data: [
            { id: "role-1", title: "Engineer", companyName: "Acme" },
          ],
        }),
      },
    },
  },
}));

vi.mock("~/app/_components/loading-results", () => ({
  default: () => <div data-testid="loading-results">Loading...</div>,
}));

vi.mock("~/app/_components/reviews/role-card-preview", () => ({
  RoleCardPreview: () => <div data-testid="role-card-preview">Role</div>,
}));

vi.mock("~/app/_components/reviews/new-role-card", () => ({
  default: () => <div data-testid="new-role-card">New Role</div>,
}));

describe("RenderAllRoles", () => {
  test("renders Roles at company name with count", () => {
    render(
      <RenderAllRoles
        company={{ id: "c1", name: "Acme Corp" } as never}
      />,
    );
    expect(
      screen.getByText(/Roles at Acme Corp \(1\)/),
    ).toBeInTheDocument();
  });

  test("renders NewRoleCard when company is provided", () => {
    render(
      <RenderAllRoles
        company={{ id: "c1", name: "Acme" } as never}
      />,
    );
    expect(screen.getByTestId("new-role-card")).toBeInTheDocument();
  });
});
