import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import Role from "~/app/(pages)/(dashboard)/(roles)/role/page";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams("id=role-123")),
}));

const mockRole = {
  id: "role-123",
  name: "Software Engineer",
  companyId: "company-1",
  companyName: "Test Co",
  slug: "software-engineer",
  companySlug: "test-co",
} as never;

vi.mock("~/trpc/react", () => ({
  api: {
    role: {
      getById: {
        useQuery: vi.fn((opts: { id: string }) => {
          if (opts.id === "role-123") {
            return {
              isPending: false,
              isSuccess: true,
              data: mockRole,
            };
          }
          return {
            isPending: false,
            isSuccess: false,
            data: undefined,
          };
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
  RoleInfo: ({ roleObj }: { roleObj: unknown }) => (
    <div data-testid="role-info">
      {String((roleObj as { name: string })?.name)}
    </div>
  ),
}));

describe("Role page", () => {
  test("renders RoleInfo when role query succeeds", () => {
    render(<Role />);
    expect(screen.getByTestId("role-info")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });
});
