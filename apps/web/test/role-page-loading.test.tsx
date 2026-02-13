import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import Role from "~/app/(pages)/(dashboard)/(roles)/role/page";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    role: {
      getById: {
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

vi.mock("~/app/_components/no-results", () => ({
  default: () => <div data-testid="no-results">No results</div>,
}));

vi.mock("~/app/_components/reviews/role-info", () => ({
  RoleInfo: () => <div data-testid="role-info">RoleInfo</div>,
}));

describe("Role page loading and error states", () => {
  test("renders LoadingResults when query is pending", () => {
    render(<Role />);
    expect(screen.getByTestId("loading-results")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
