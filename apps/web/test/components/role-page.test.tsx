import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

let roleQuery: {
  isSuccess: boolean;
  isPending: boolean;
  data?: { title: string };
};
let idParam: string | null = "role-1";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => idParam }),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    role: {
      getById: { useQuery: () => roleQuery },
    },
  },
}));

vi.mock("~/app/_components/roles/role-info", () => ({
  RoleInfo: ({ roleObj }: { roleObj: { title: string } }) => (
    <div data-testid="role-info">{roleObj.title}</div>
  ),
}));
vi.mock("~/app/_components/loading-results", () => ({
  default: () => <div data-testid="loading" />,
}));
vi.mock("~/app/_components/no-results", () => ({
  default: () => <div data-testid="no-results" />,
}));

import Role from "~/app/(pages)/(dashboard)/roles/role/page";

describe("Role page", () => {
  beforeEach(() => {
    idParam = "role-1";
    roleQuery = { isSuccess: false, isPending: true };
  });

  test("renders the loading state while pending", () => {
    roleQuery = { isSuccess: false, isPending: true };
    render(<Role />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  test("renders the role info on success", () => {
    roleQuery = {
      isSuccess: true,
      isPending: false,
      data: { title: "Software Engineer" },
    };
    render(<Role />);
    expect(screen.getByTestId("role-info")).toHaveTextContent(
      "Software Engineer",
    );
  });

  test("renders no-results when the query settles without success", () => {
    roleQuery = { isSuccess: false, isPending: false };
    render(<Role />);
    expect(screen.getByTestId("no-results")).toBeInTheDocument();
  });
});
