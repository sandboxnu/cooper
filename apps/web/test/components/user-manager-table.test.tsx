import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const updateRoleMutate = vi.fn();
const updateDisabledMutate = vi.fn();
const invalidate = vi.fn();

let queryResult: {
  data?: { items: unknown[] };
  isLoading: boolean;
} = { data: { items: [] }, isLoading: false };

vi.mock("~/trpc/react", () => ({
  api: {
    useUtils: () => ({
      admin: { userManagerItems: { invalidate } },
    }),
    admin: {
      userManagerItems: {
        useQuery: () => queryResult,
      },
      updateUserRole: {
        useMutation: () => ({ mutate: updateRoleMutate, isPending: false }),
      },
      updateUserDisabled: {
        useMutation: () => ({ mutate: updateDisabledMutate, isPending: false }),
      },
    },
  },
}));

vi.mock("@cooper/ui", () => ({
  cn: (...inputs: unknown[]) => inputs.flat().filter(Boolean).join(" "),
  useCustomToast: () => ({
    toast: { custom: vi.fn().mockReturnValue({ dismiss: vi.fn() }) },
  }),
}));

import { AdminUserManagerTable } from "~/app/_components/admin/user-manager-table";

const users = [
  {
    id: "1",
    name: "Alice Admin",
    email: "alice@husky.neu.edu",
    role: "ADMIN",
    isDisabled: false,
    createdAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "2",
    name: "Bob Student",
    email: "bob@husky.neu.edu",
    role: "STUDENT",
    isDisabled: false,
    createdAt: new Date("2024-02-01").toISOString(),
  },
  {
    id: "3",
    name: "Carol Coordinator",
    email: "carol@husky.neu.edu",
    role: "COORDINATOR",
    isDisabled: true,
    createdAt: new Date("2024-03-01").toISOString(),
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  queryResult = { data: { items: users }, isLoading: false };
});

describe("AdminUserManagerTable", () => {
  test("renders a loading row while loading", () => {
    queryResult = { data: undefined, isLoading: true };
    render(<AdminUserManagerTable />);
    expect(screen.getByText("Loading users...")).toBeInTheDocument();
  });

  test("renders the users", () => {
    render(<AdminUserManagerTable />);
    expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    expect(screen.getByText("Bob Student")).toBeInTheDocument();
  });

  test("filters by search query", () => {
    render(<AdminUserManagerTable />);
    fireEvent.change(screen.getByPlaceholderText("Search for admins"), {
      target: { value: "alice" },
    });
    expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    expect(screen.queryByText("Bob Student")).toBeNull();
  });

  test("filters by role", () => {
    render(<AdminUserManagerTable />);
    fireEvent.change(screen.getByLabelText("Filter role"), {
      target: { value: "STUDENT" },
    });
    expect(screen.getByText("Bob Student")).toBeInTheDocument();
    expect(screen.queryByText("Alice Admin")).toBeNull();
  });

  test("sorts alphabetically", () => {
    render(<AdminUserManagerTable />);
    fireEvent.change(screen.getByLabelText("Sort users"), {
      target: { value: "name-asc" },
    });
    expect(screen.getByText("Alice Admin")).toBeInTheDocument();
  });

  test("shows an empty state when no users match", () => {
    render(<AdminUserManagerTable />);
    fireEvent.change(screen.getByPlaceholderText("Search for admins"), {
      target: { value: "zzzzz" },
    });
    expect(
      screen.getByText("No users match your filters."),
    ).toBeInTheDocument();
  });
});
