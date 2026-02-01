import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import FavoriteRoleSearch from "~/app/_components/profile/favorite-role-search";

vi.mock("~/app/_components/reviews/role-card-preview", () => ({
  RoleCardPreview: ({ roleObj }: { roleObj: { title: string } }) => (
    <div data-testid="role-card">{roleObj.title}</div>
  ),
}));

vi.mock("@cooper/ui", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Pagination: ({
      currentPage,
      totalPages,
      onPageChange,
    }: {
      currentPage: number;
      totalPages: number;
      onPageChange: (page: number) => void;
    }) => (
      <div data-testid="pagination">
        <span data-testid="current">{currentPage}</span>
        <span data-testid="total">{totalPages}</span>
        <button
          type="button"
          onClick={() => onPageChange(2)}
          data-testid="page-2"
        >
          Page 2
        </button>
      </div>
    ),
  };
});

describe("FavoriteRoleSearch", () => {
  test("renders search input with placeholder", () => {
    render(<FavoriteRoleSearch favoriteRoles={[]} />);
    expect(
      screen.getByPlaceholderText("Search for a saved role..."),
    ).toBeInTheDocument();
  });

  test("renders No saved roles found when list is empty", () => {
    render(<FavoriteRoleSearch favoriteRoles={[]} />);
    expect(screen.getByText("No saved roles found.")).toBeInTheDocument();
  });

  test("renders role cards when roles are provided", () => {
    const roles = [
      { id: "r1", title: "Software Engineer" },
      { id: "r2", title: "Data Analyst" },
    ] as never[];
    render(<FavoriteRoleSearch favoriteRoles={roles} />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Data Analyst")).toBeInTheDocument();
    expect(screen.getAllByTestId("role-card")).toHaveLength(2);
  });

  test("renders Pagination with totalPages from role count", () => {
    const roles = Array.from({ length: 10 }, (_, i) => ({
      id: `r${i}`,
      title: `Role ${i}`,
    })) as never[];
    render(<FavoriteRoleSearch favoriteRoles={roles} />);
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
    expect(screen.getByTestId("total")).toHaveTextContent("2");
  });

  test("filters roles by search prefix", () => {
    const roles = [
      { id: "r1", title: "Engineer" },
      { id: "r2", title: "Designer" },
    ] as never[];
    render(<FavoriteRoleSearch favoriteRoles={roles} />);
    const input = screen.getByPlaceholderText("Search for a saved role...");
    fireEvent.change(input, { target: { value: "Eng" } });
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Designer")).not.toBeInTheDocument();
  });
});
