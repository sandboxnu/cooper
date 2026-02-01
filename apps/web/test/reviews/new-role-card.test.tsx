import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import NewRoleCard from "~/app/_components/reviews/new-role-card";

const mockUseQuery = vi.fn(() => ({ data: null }));
vi.mock("~/trpc/react", () => ({
  api: {
    auth: {
      getSession: {
        useQuery: () => mockUseQuery(),
      },
    },
  },
}));

vi.mock("~/app/_components/reviews/new-role-dialogue", () => ({
  default: ({ disabled }: { disabled: boolean }) => (
    <button type="button" disabled={disabled}>
      Create New Role
    </button>
  ),
}));

describe("NewRoleCard", () => {
  test("renders sign in message when not authorized", () => {
    mockUseQuery.mockReturnValue({ data: null });
    render(<NewRoleCard companyId="company-1" />);
    expect(
      screen.getByText("Sign in to create a new role"),
    ).toBeInTheDocument();
  });

  test("renders Create New Role button disabled when not authorized", () => {
    mockUseQuery.mockReturnValue({ data: null });
    render(<NewRoleCard companyId="company-1" />);
    const button = screen.getByRole("button", { name: "Create New Role" });
    expect(button).toBeDisabled();
  });

  test("renders Don't see your role when authorized", () => {
    mockUseQuery.mockReturnValue({ data: { session: { user: {} } } });
    render(<NewRoleCard companyId="company-1" />);
    expect(screen.getByText("Don't see your role?")).toBeInTheDocument();
  });

  test("renders Create New Role button enabled when authorized", () => {
    mockUseQuery.mockReturnValue({ data: { session: { user: {} } } });
    render(<NewRoleCard companyId="company-1" />);
    const button = screen.getByRole("button", { name: "Create New Role" });
    expect(button).not.toBeDisabled();
  });
});
