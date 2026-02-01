import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import Role from "~/app/(pages)/(dashboard)/(roles)/role/page";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams("id=missing")),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    role: {
      getById: {
        useQuery: () => ({
          isPending: false,
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

describe("Role page no results state", () => {
  test("renders NoResults when query is not pending and not success", () => {
    render(<Role />);
    expect(screen.getByTestId("no-results")).toBeInTheDocument();
  });
});
