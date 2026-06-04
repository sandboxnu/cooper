import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const state: {
  company?: { name: string };
  profile?: { id: string };
  createdRoles: unknown[];
} = { createdRoles: [] };

vi.mock("@cooper/ui/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({ toast: { success: vi.fn(), error: vi.fn() } }),
}));
vi.mock("~/trpc/react", () => ({
  api: {
    company: { getById: { useQuery: () => ({ data: state.company }) } },
    profile: { getCurrentUser: { useQuery: () => ({ data: state.profile }) } },
    role: {
      getByCreatedBy: { useQuery: () => ({ data: state.createdRoles }) },
      create: { useMutation: () => ({ mutateAsync: vi.fn() }) },
    },
  },
}));

import NewRoleDialog from "~/app/_components/roles/new-role-dialogue";

describe("NewRoleDialog", () => {
  beforeEach(() => {
    state.company = { name: "Acme" };
    state.profile = { id: "p1" };
    state.createdRoles = [];
  });

  test("renders the create-role trigger button", () => {
    render(<NewRoleDialog companyId="c1" />);
    expect(screen.getByText("+ Create New Role")).toBeInTheDocument();
  });

  test("opens the create form with company context", () => {
    render(<NewRoleDialog companyId="c1" />);
    fireEvent.click(screen.getByText("+ Create New Role"));
    expect(
      screen.getByRole("heading", { name: "Create New Role" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Request a new role for Acme")).toBeInTheDocument();
    expect(screen.getByText("Role Name")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  test("shows the limit message once the user has created more than 3 roles", () => {
    state.createdRoles = [{}, {}, {}, {}];
    render(<NewRoleDialog companyId="c1" />);
    fireEvent.click(screen.getByText("+ Create New Role"));
    expect(
      screen.getByText("Sorry, you can only create up to 4 roles!"),
    ).toBeInTheDocument();
  });
});
