import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const replace = vi.fn();
let sessionQuery: {
  data?: { user: { role: string } };
  isLoading: boolean;
  error: null;
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    auth: {
      getSession: { useQuery: () => sessionQuery },
    },
  },
}));

import AdminLayout from "~/app/(pages)/(protected)/admin/layout";

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionQuery = { data: undefined, isLoading: true, error: null };
  });

  test("renders nav links and children for an admin", () => {
    sessionQuery = {
      data: { user: { role: "ADMIN" } },
      isLoading: false,
      error: null,
    };
    render(
      <AdminLayout>
        <div data-testid="child" />
      </AdminLayout>,
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("User Manager")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  test("renders for a developer without redirecting", () => {
    sessionQuery = {
      data: { user: { role: "DEVELOPER" } },
      isLoading: false,
      error: null,
    };
    render(
      <AdminLayout>
        <div data-testid="child" />
      </AdminLayout>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  test("redirects non-admins to /404", () => {
    sessionQuery = {
      data: { user: { role: "STUDENT" } },
      isLoading: false,
      error: null,
    };
    const { container } = render(
      <AdminLayout>
        <div data-testid="child" />
      </AdminLayout>,
    );
    expect(replace).toHaveBeenCalledWith("/404");
    expect(container).toBeEmptyDOMElement();
  });

  test("does not redirect while the session is still loading", () => {
    sessionQuery = { data: undefined, isLoading: true, error: null };
    render(
      <AdminLayout>
        <div data-testid="child" />
      </AdminLayout>,
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
