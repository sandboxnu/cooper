import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/app/_components/admin/dashboard-table", () => ({
  AdminDashboardTable: () => <div data-testid="dashboard-table" />,
}));
vi.mock("~/app/_components/admin/create-user-form", () => ({
  CreateUserForm: () => <div data-testid="create-user-form" />,
}));
vi.mock("~/app/_components/admin/user-manager-table", () => ({
  AdminUserManagerTable: () => <div data-testid="user-manager-table" />,
}));

import AdminDashboardPage from "~/app/(pages)/(protected)/admin/dashboard/page";
import AdminUserManagerPage from "~/app/(pages)/(protected)/admin/user-manager/page";

describe("AdminDashboardPage", () => {
  test("renders the dashboard table", () => {
    render(<AdminDashboardPage />);
    expect(screen.getByTestId("dashboard-table")).toBeInTheDocument();
  });
});

describe("AdminUserManagerPage", () => {
  test("renders the create-user form and the user-manager table", () => {
    render(<AdminUserManagerPage />);
    expect(screen.getByTestId("create-user-form")).toBeInTheDocument();
    expect(screen.getByTestId("user-manager-table")).toBeInTheDocument();
  });
});
