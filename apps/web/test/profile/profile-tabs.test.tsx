import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ProfileTabs from "~/app/_components/profile/profile-tabs";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/profile",
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams("tab=saved-roles"),
}));

describe("ProfileTabs", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  test("renders Saved roles, Saved companies, My reviews tabs", () => {
    render(<ProfileTabs numReviews={5} />);
    expect(screen.getByRole("button", { name: /saved roles/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /saved companies/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /my reviews \(5\)/i })).toBeInTheDocument();
  });

  test("renders numReviews in My reviews tab", () => {
    render(<ProfileTabs numReviews={12} />);
    expect(screen.getByRole("button", { name: /my reviews \(12\)/i })).toBeInTheDocument();
  });

  test("has nav with aria-label Tabs", () => {
    render(<ProfileTabs numReviews={0} />);
    const nav = screen.getByRole("navigation", { name: /tabs/i });
    expect(nav).toBeInTheDocument();
  });

  test("clicking tab calls router.push with tab param", () => {
    render(<ProfileTabs numReviews={0} />);
    fireEvent.click(screen.getByRole("button", { name: /saved companies/i }));
    expect(mockPush).toHaveBeenCalledWith("/profile?tab=saved-companies");
  });

  test("clicking My reviews calls router.push with my-reviews tab", () => {
    render(<ProfileTabs numReviews={3} />);
    fireEvent.click(screen.getByRole("button", { name: /my reviews \(3\)/i }));
    expect(mockPush).toHaveBeenCalledWith("/profile?tab=my-reviews");
  });
});
