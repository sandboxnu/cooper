"use client";

import { useMemo, useState } from "react";

import { cn } from "@cooper/ui";
import { api } from "~/trpc/react";
import { Eye, Flag } from "lucide-react";
import { Checkbox } from "@cooper/ui/checkbox";

type DashboardCategory = "review" | "role" | "company";

interface DashboardItem {
  id: string;
  category: DashboardCategory;
  title: string;
  subtitle?: string;
  description?: string;
  company?: string;
  location?: string | null;
  createdAt: Date;
}

const TABS = [
  { label: "All", value: "all" as const },
  { label: "Reviews", value: "reviews" as const },
  { label: "Role", value: "role" as const },
  { label: "Company", value: "company" as const },
];

type TabValue = (typeof TABS)[number]["value"];

export function AdminDashboardTable() {
  const { data, isLoading } = api.admin.dashboardItems.useQuery(
    { limitPerType: 50 },
    { staleTime: 60_000 },
  );

  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;

  const items: DashboardItem[] = useMemo(() => {
    if (!data?.items) return [];

    return data.items.map((item) => {
      if (item.type === "review") {
        const text = item.text || item.headline || "";
        return {
          id: item.id,
          category: "review",
          title: text,
          description: item.headline,
          createdAt: new Date(item.createdAt as unknown as string),
        };
      }

      if (item.type === "role") {
        return {
          id: item.id,
          category: "role",
          title: item.title,
          company: item.companyId,
          createdAt: new Date(item.createdAt as unknown as string),
        };
      }

      return {
        id: item.id,
        category: "company",
        title: item.name,
        createdAt: new Date(item.createdAt as unknown as string),
      };
    });
  }, [data]);

  const filteredItems = useMemo(() => {
    let current = items;

    if (activeTab === "reviews") {
      current = current.filter((i) => i.category === "review");
    } else if (activeTab === "role") {
      current = current.filter((i) => i.category === "role");
    } else if (activeTab === "company") {
      current = current.filter((i) => i.category === "company");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      current = current.filter((item) =>
        [
          item.title,
          item.subtitle,
          item.description,
          item.company,
          item.location ?? "",
        ]
          .filter(Boolean)
          .some((v) => v?.toLowerCase().includes(q)),
      );
    }

    return current;
  }, [activeTab, items, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleTabChange = (value: TabValue) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Search for a review, role, company..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-[40%] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:none focus:outline-none focus:ring-1 focus:ring-gray-200"
          />
          <div className="flex items-center gap-2 sm:ml-4">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Filter
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sort
            </button>
          </div>
        </div>

        <nav
          className="mt-4 flex border-b border-gray-200 text-sm font-medium text-gray-500"
          aria-label="Dashboard categories"
        >
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              aria-pressed={activeTab === tab.value}
              className={cn(
                "relative -mb-px flex items-center px-3 pb-2 pt-1",
                activeTab === tab.value
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-900",
              )}
            >
              <span>{tab.label}</span>
              {activeTab === tab.value && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
              )}
            </button>
          ))}
        </nav>

        <div className="overflow-x-auto pt-2">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="w-12 px-4 py-3 text-left">
                  Actions
                </th>
                <th scope="col" className="w-24 px-4 py-3 text-left">
                  Category
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Date Created
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
                    Loading dashboard data…
                  </td>
                </tr>
              )}
              {!isLoading &&
                pageItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <Checkbox />
                        <Flag className="text-cooper-gray-600" />
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {item.category === "review"
                        ? "Review"
                        : item.category === "role"
                          ? "Role"
                          : "Company"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {item.category === "review" ? (
                        <p className="max-w-xl text-sm text-gray-700">
                          {item.title}
                        </p>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-gray-900">
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.company && <span>{item.company} · </span>}
                            {item.location}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-700">
                          {item.createdAt.toLocaleString(undefined, {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <button
                          type="button"
                          className="text-sm text-gray-400 hover:text-gray-700"
                          aria-label="View"
                        >
                          <Eye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!isLoading && pageItems.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No results match your filters.
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
