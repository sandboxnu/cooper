import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import NoResults from "~/app/_components/no-results";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/roles",
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (
    <img src="/logo.svg" alt={alt} data-testid="cooper-logo" />
  ),
}));

describe("NoResults", () => {
  test("renders no results message", () => {
    render(<NoResults />);
    expect(screen.getByText("No Results Found")).toBeInTheDocument();
  });

  test("does not show Clear Filters when clearFunction is false", () => {
    render(<NoResults clearFunction={false} />);
    expect(
      screen.queryByRole("button", { name: /clear filters/i }),
    ).not.toBeInTheDocument();
  });

  test("shows Clear Filters when clearFunction is true", () => {
    render(<NoResults clearFunction={true} />);
    expect(
      screen.getByRole("button", { name: /clear filters/i }),
    ).toBeInTheDocument();
  });

  test("Clear Filters calls router.push with pathname", () => {
    render(<NoResults clearFunction={true} />);
    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(mockPush).toHaveBeenCalledWith("/roles");
  });
});
