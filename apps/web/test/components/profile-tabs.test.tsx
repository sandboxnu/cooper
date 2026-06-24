import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const push = vi.fn();
let sessionData: { user: { role: string } } | undefined;
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/profile",
  useSearchParams: () => searchParams,
}));

vi.mock("~/trpc/react", () => ({
  api: {
    auth: {
      getSession: { useQuery: () => ({ data: sessionData }) },
    },
  },
}));

import ProfileTabs from "~/app/_components/profile/profile-tabs";

describe("ProfileTabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParams = new URLSearchParams();
    sessionData = { user: { role: "STUDENT" } };
  });

  test("shows the My reviews tab for students", () => {
    render(<ProfileTabs numReviews={3} />);
    expect(screen.getByText("Saved roles")).toBeInTheDocument();
    expect(screen.getByText("Saved companies")).toBeInTheDocument();
    expect(screen.getByText(/My reviews/)).toBeInTheDocument();
  });

  test("includes the review count on the My reviews tab", () => {
    render(<ProfileTabs numReviews={7} />);
    expect(screen.getByText(/My reviews \(7\)/)).toBeInTheDocument();
  });

  test("hides the My reviews tab for non-student roles", () => {
    sessionData = { user: { role: "EMPLOYER" } };
    render(<ProfileTabs numReviews={3} />);
    expect(screen.queryByText(/My reviews/)).not.toBeInTheDocument();
  });

  test("clicking a tab pushes the tab query param", () => {
    render(<ProfileTabs numReviews={0} />);
    fireEvent.click(screen.getByText("Saved companies"));
    expect(push).toHaveBeenCalledWith("/profile?tab=saved-companies");
  });

  test("preserves existing query params when switching tabs", () => {
    searchParams = new URLSearchParams("foo=bar");
    render(<ProfileTabs numReviews={0} />);
    fireEvent.click(screen.getByText("Saved companies"));
    expect(push).toHaveBeenCalledWith("/profile?foo=bar&tab=saved-companies");
  });
});
