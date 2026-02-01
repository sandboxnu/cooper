import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import NewRoleDialog from "~/app/_components/reviews/new-role-dialogue";

vi.mock("~/trpc/react", () => ({
  api: {
    company: {
      getById: {
        useQuery: () => ({ data: { name: "Acme Corp" } }),
      },
    },
    profile: {
      getCurrentUser: {
        useQuery: () => ({ data: { id: "profile-1" } }),
      },
    },
    role: {
      getByCreatedBy: {
        useQuery: () => ({ data: [] }),
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

vi.mock("@cooper/ui/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({ toast: { error: vi.fn(), success: vi.fn() } }),
}));

vi.stubGlobal(
  "setTimeout",
  vi.fn((fn: () => void) => fn()),
);

describe("NewRoleDialog", () => {
  test("renders trigger button", () => {
    render(<NewRoleDialog companyId="company-1" />);
    expect(
      screen.getByRole("button", { name: /Create New Role/i }),
    ).toBeInTheDocument();
  });

  test("trigger is disabled when disabled prop is true", () => {
    render(<NewRoleDialog companyId="company-1" disabled />);
    expect(
      screen.getByRole("button", { name: /Create New Role/i }),
    ).toBeDisabled();
  });

  test("opens dialog with title when trigger clicked", () => {
    render(<NewRoleDialog companyId="company-1" />);
    fireEvent.click(screen.getByRole("button", { name: /Create New Role/i }));
    expect(screen.getByText("Create New Role")).toBeInTheDocument();
    expect(
      screen.getByText(/Request a new role for Acme Corp/),
    ).toBeInTheDocument();
  });

  test("shows Role Name and Description fields", () => {
    render(<NewRoleDialog companyId="company-1" />);
    fireEvent.click(screen.getByRole("button", { name: /Create New Role/i }));
    expect(screen.getByText("Role Name")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  test("shows Submit button in dialog", () => {
    render(<NewRoleDialog companyId="company-1" />);
    fireEvent.click(screen.getByRole("button", { name: /Create New Role/i }));
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });
});
