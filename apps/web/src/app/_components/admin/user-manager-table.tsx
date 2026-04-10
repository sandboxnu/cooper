"use client";

import { useMemo, useRef, useState } from "react";

import { Check, ChevronDown, X } from "lucide-react";

import { cn, useCustomToast } from "@cooper/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";
import { api } from "~/trpc/react";

type RoleFilter = "all" | "ADMIN" | "COORDINATOR" | "DEVELOPER" | "STUDENT";
type SortOption = "joined-desc" | "name-asc";

const ROLE_FILTERS: { label: string; value: RoleFilter }[] = [
  { label: "All roles", value: "all" },
  { label: "Admin", value: "ADMIN" },
  { label: "Coordinator", value: "COORDINATOR" },
  { label: "Developer", value: "DEVELOPER" },
  { label: "Student", value: "STUDENT" },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "", value: "joined-desc" },
  { label: "A-Z", value: "name-asc" },
];

function UserRoleDropdown({
  user,
}: {
  user: { id: string; role: string; isDisabled: boolean };
}) {
  const utils = api.useUtils();
  const { toast } = useCustomToast();
  const dismissToastRef = useRef<(() => void) | undefined>(undefined);

  const updateRole = api.admin.updateUserRole.useMutation({
    onSuccess: () => void utils.admin.userManagerItems.invalidate(),
  });

  const updateDisabled = api.admin.updateUserDisabled.useMutation({
    onSuccess: (_data, variables) => {
      void utils.admin.userManagerItems.invalidate();
      if (variables.isDisabled) {
        const { dismiss } = toast.custom({
          duration: 5000,
          className: "toast-action",
          description: (
            <div className="flex w-full items-center">
              <span>User disabled.</span>
              <button
                onClick={() => {
                  dismissToastRef.current?.();
                  updateDisabled.mutate({ userId: user.id, isDisabled: false });
                }}
                className="ml-48 rounded px-1 py-0 font-medium text-cooper-yellow-500 hover:bg-cooper-yellow-800"
              >
                Undo
              </button>
              <button
                onClick={() => dismissToastRef.current?.()}
                className="ml-4 text-cooper-gray-400 hover:text-cooper-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ),
        });
        dismissToastRef.current = dismiss;
      }
    },
  });

  const isStudent = user.role === "STUDENT";
  const isAdminOrCoordinator =
    user.role === "ADMIN" || user.role === "COORDINATOR";

  if (!isStudent && !isAdminOrCoordinator) {
    return (
      <span className="text-sm text-cooper-gray-400">
        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
      </span>
    );
  }

  const isPending = updateRole.isPending || updateDisabled.isPending;
  const triggerLabel = user.isDisabled
    ? "Disabled"
    : user.role.charAt(0) + user.role.slice(1).toLowerCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className="flex items-center gap-1 text-sm text-cooper-gray-400 focus:outline-none disabled:cursor-wait"
      >
        {triggerLabel}
        <ChevronDown className="h-4 w-4 text-cooper-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[160px] border-none p-2 shadow-lg">
        {isAdminOrCoordinator && (
          <>
            <DropdownMenuItem
              onClick={() => {
                if (user.isDisabled)
                  updateDisabled.mutate({ userId: user.id, isDisabled: false });
                updateRole.mutate({ userId: user.id, role: "ADMIN" });
              }}
              className="flex justify-between px-4 py-2.5 text-sm text-cooper-gray-400"
            >
              Admin
              {user.role === "ADMIN" && !user.isDisabled && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (user.isDisabled)
                  updateDisabled.mutate({ userId: user.id, isDisabled: false });
                updateRole.mutate({ userId: user.id, role: "COORDINATOR" });
              }}
              className="flex justify-between px-4 py-2.5 text-sm text-cooper-gray-400"
            >
              Coordinator
              {user.role === "COORDINATOR" && !user.isDisabled && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          </>
        )}
        {isStudent && (
          <DropdownMenuItem
            disabled={!user.isDisabled}
            onClick={() =>
              user.isDisabled &&
              updateDisabled.mutate({ userId: user.id, isDisabled: false })
            }
            className="flex justify-between px-4 py-2.5 text-sm text-cooper-gray-400 opacity-100"
          >
            Student
            {!user.isDisabled && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            !user.isDisabled &&
            updateDisabled.mutate({ userId: user.id, isDisabled: true })
          }
          className="flex justify-between px-4 py-2.5 text-sm text-cooper-yellow-500 focus:text-cooper-yellow-500"
        >
          Disabled
          {user.isDisabled && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminUserManagerTable() {
  const { data, isLoading } = api.admin.userManagerItems.useQuery({
    limit: 200,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("joined-desc");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;

  const filteredUsers = useMemo(() => {
    const users = [...(data?.items ?? [])];

    const query = searchQuery.trim().toLowerCase();
    let current = users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;

      if (!query) return true;
      return (
        (user.name ?? "").toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    });

    current = current.sort((a, b) => {
      if (sortOption === "name-asc") {
        return (a.name ?? "").localeCompare(b.name ?? "");
      }

      const aTime = new Date(a.createdAt as unknown as string).getTime();
      const bTime = new Date(b.createdAt as unknown as string).getTime();
      return bTime - aTime;
    });

    return current;
  }, [data?.items, roleFilter, searchQuery, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [currentPage, filteredUsers]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Search for admins"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="md:w-[40%] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
          />
          <div className="flex items-center gap-2 sm:ml-4">
            <label className="relative">
              <span className="sr-only">Filter role</span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as RoleFilter);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-md border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-200"
              >
                {ROLE_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
            </label>

            <label className="relative">
              <span className="sr-only">Sort users</span>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-md border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-200"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {`Sort ${option.label}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
            </label>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 text-left">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    Loading users...
                  </td>
                </tr>
              )}
              {!isLoading &&
                pageItems.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-gray-900">
                      {user.name ?? "Unnamed user"}
                    </td>
                    <td className="px-4 py-4 text-gray-700">{user.email}</td>
                    <td className="px-4 py-4">
                      <UserRoleDropdown user={user} />
                    </td>
                    <td className="px-4 py-4 text-right text-gray-500">
                      {`Joined ${new Date(user.createdAt as unknown as string).toLocaleDateString()}`}
                    </td>
                  </tr>
                ))}
              {!isLoading && pageItems.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
            aria-label="Previous page"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1;
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={cn(
                  "h-8 w-8 rounded-md text-sm",
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                {page}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
