import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/app/_components/themed/onboarding/input", () => ({
  Input: ({
    variant: _variant,
    onClear: _onClear,
    ...props
  }: Record<string, unknown>) => <input {...props} />,
}));
vi.mock("~/app/_components/roles/role-card-preview", () => ({
  RoleCardPreview: ({ roleObj }: { roleObj: { title: string } }) => (
    <div data-testid="role-card">{roleObj.title}</div>
  ),
}));
vi.mock("@cooper/ui", () => ({
  Pagination: ({
    currentPage,
    totalPages,
  }: {
    currentPage: number;
    totalPages: number;
  }) => (
    <div data-testid="pagination">
      {currentPage}/{totalPages}
    </div>
  ),
}));

import FavoriteRoleSearch from "~/app/_components/profile/favorite-role-search";

const makeRoles = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    companyId: `c${i}`,
    title: i === 0 ? "Designer" : `Engineer ${i}`,
  })) as never[];

describe("FavoriteRoleSearch", () => {
  test("renders a card per role within the first page", () => {
    render(<FavoriteRoleSearch favoriteRoles={makeRoles(3)} />);
    expect(screen.getAllByTestId("role-card")).toHaveLength(3);
  });

  test("paginates to 9 roles per page", () => {
    render(<FavoriteRoleSearch favoriteRoles={makeRoles(12)} />);
    expect(screen.getAllByTestId("role-card")).toHaveLength(9);
    // ceil(12 / 9) = 2 pages
    expect(screen.getByTestId("pagination")).toHaveTextContent("1/2");
  });

  test("filters roles by the typed prefix", () => {
    render(<FavoriteRoleSearch favoriteRoles={makeRoles(3)} />);
    fireEvent.change(
      screen.getByPlaceholderText("Search for a saved role..."),
      { target: { value: "des" } },
    );
    const cards = screen.getAllByTestId("role-card");
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent("Designer");
  });

  test("shows an empty state when nothing matches", () => {
    render(<FavoriteRoleSearch favoriteRoles={makeRoles(3)} />);
    fireEvent.change(
      screen.getByPlaceholderText("Search for a saved role..."),
      { target: { value: "zzz" } },
    );
    expect(screen.getByText("No saved roles found.")).toBeInTheDocument();
  });
});
