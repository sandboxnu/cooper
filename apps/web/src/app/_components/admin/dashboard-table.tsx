"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@cooper/ui";
import { Checkbox } from "@cooper/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@cooper/ui/dialog";
import { ChevronDown, ChevronRight, Eye, EyeOff, Flag } from "lucide-react";
import { api } from "~/trpc/react";

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
  flagged: boolean;
  hidden: boolean;
}

interface OptimisticItemState {
  flagged?: boolean;
  hidden?: boolean;
}

const TABS = [
  { label: "All", value: "all" as const },
  { label: "Reviews", value: "reviews" as const },
  { label: "Role", value: "role" as const },
  { label: "Company", value: "company" as const },
];

type TabValue = (typeof TABS)[number]["value"];

function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  isLoading,
  pageItems,
  totalPages,
  currentPage,
  onPageChange,
  onToggleFlag,
  onToggleHidden,
  isUpdatingFlag,
  isUpdatingHidden,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  isLoading: boolean;
  pageItems: DashboardItem[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onToggleFlag: (item: DashboardItem) => void;
  onToggleHidden: (item: DashboardItem) => void;
  isUpdatingFlag?: boolean;
  isUpdatingHidden?: boolean;
}) {
  return (
    <div className="mt-4 min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50"
      >
        {isOpen ? (
          <ChevronDown className="size-4 shrink-0 text-gray-500" aria-hidden />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-gray-500" aria-hidden />
        )}
        {title}
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 min-w-0">
          <div className="min-w-0 w-full overflow-x-auto overscroll-x-contain border-t border-gray-100 [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[720px] table-fixed divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th
                    scope="col"
                    className="w-24 whitespace-nowrap px-4 py-3 text-left"
                  >
                    Actions
                  </th>
                  <th
                    scope="col"
                    className="w-24 whitespace-nowrap px-4 py-3 text-left"
                  >
                    Category
                  </th>
                  <th scope="col" className="min-w-0 px-4 py-3 text-left">
                    Name
                  </th>
                  <th
                    scope="col"
                    className="w-[220px] min-w-[220px] px-4 py-3 text-left"
                  >
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
                  pageItems.map((item) => {
                    const rowKey = `${item.category}:${String(item.id)}`;
                    const isFlagged = item.flagged;
                    const isEyeClosed = item.hidden;

                    return (
                      <tr key={rowKey} className="hover:bg-gray-50">
                        <td className="w-12 px-4 py-3 align-top whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Checkbox />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleFlag(item);
                              }}
                              disabled={isUpdatingFlag}
                              aria-label={
                                isFlagged ? "Remove flag" : "Flag item"
                              }
                              aria-pressed={isFlagged}
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-cooper-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                            >
                              <Flag
                                className={cn(
                                  "size-[1.125rem] shrink-0",
                                  isFlagged && "text-amber-600",
                                )}
                                fill={isFlagged ? "currentColor" : "none"}
                                strokeWidth={isFlagged ? 1.25 : 2}
                                aria-hidden
                              />
                            </button>
                          </div>
                        </td>
                        <td className="w-24 px-4 py-3 align-top text-gray-700 whitespace-nowrap">
                          {item.category === "review"
                            ? "Review"
                            : item.category === "role"
                              ? "Role"
                              : "Company"}
                        </td>
                        <td className="min-w-0 px-4 py-3 align-top">
                          {item.category === "review" ? (
                            <p className="break-words text-sm leading-relaxed text-gray-700">
                              {item.title}
                            </p>
                          ) : item.category === "company" ? (
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">
                                {item.title.charAt(0)}
                              </div>
                              <div className="min-w-0 space-y-0.5">
                                <p className="text-sm font-medium text-gray-900">
                                  {item.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {item.location?.trim()
                                    ? item.location.trim()
                                    : "—"}
                                </p>
                              </div>
                            </div>
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
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-sm tabular-nums text-gray-700">
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
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleHidden(item);
                              }}
                              disabled={isUpdatingHidden}
                              className={cn(
                                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
                                isEyeClosed
                                  ? "text-gray-900 hover:bg-gray-100"
                                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-700",
                              )}
                              aria-label={
                                isEyeClosed ? "Show content" : "Hide content"
                              }
                              aria-pressed={isEyeClosed}
                            >
                              {isEyeClosed ? (
                                <EyeOff
                                  className="size-[1.125rem]"
                                  aria-hidden
                                />
                              ) : (
                                <Eye className="size-[1.125rem]" aria-hidden />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {!isLoading && pageItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No results in this section.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center gap-2 border-t border-gray-100 px-4 py-3">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
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
                  onClick={() => onPageChange(page)}
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
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardTable() {
  const utils = api.useUtils();
  const { data: mostRecentItemsData, isLoading: isLoadingMostRecent } =
    api.admin.dashboardItems.useQuery(
      { limitPerType: 50 },
      { staleTime: 60_000 },
    );

  const { data: flaggedData, isLoading: isLoadingFlagged } =
    api.admin.flaggedDashboardItems.useQuery(
      { limitPerType: 100 },
      { staleTime: 60_000 },
    );

  const { data: hiddenData, isLoading: isLoadingHidden } =
    api.admin.hiddenDashboardItems.useQuery(
      { limitPerType: 100 },
      { staleTime: 60_000 },
    );

  const { data: reportedData, isLoading: isLoadingReported } =
    api.admin.reportedDashboardItems.useQuery(
      { limitPerType: 100 },
      { staleTime: 60_000 },
    );

  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mostRecentOpen, setMostRecentOpen] = useState(true);
  const [reportedOpen, setReportedOpen] = useState(true);
  const [hiddenOpen, setHiddenOpen] = useState(true);
  const [flaggedOpen, setFlaggedOpen] = useState(true);
  const [currentPageRecent, setCurrentPageRecent] = useState(1);
  const [currentPageFlagged, setCurrentPageFlagged] = useState(1);
  const [currentPageHidden, setCurrentPageHidden] = useState(1);
  const [currentPageReported, setCurrentPageReported] = useState(1);
  const [confirmHideOpen, setConfirmHideOpen] = useState(false);
  const [confirmHideItem, setConfirmHideItem] = useState<DashboardItem | null>(
    null,
  );
  const [confirmFlagOpen, setConfirmFlagOpen] = useState(false);
  const [confirmFlagItem, setConfirmFlagItem] = useState<DashboardItem | null>(
    null,
  );
  const [flagReason, setFlagReason] = useState("");
  const [optimisticItemState, setOptimisticItemState] = useState<
    Record<string, OptimisticItemState>
  >({});

  const getItemKey = (item: Pick<DashboardItem, "category" | "id">) =>
    `${item.category}:${item.id}`;

  const setItemOptimisticState = (
    item: Pick<DashboardItem, "category" | "id">,
    partial: OptimisticItemState,
  ) => {
    const itemKey = getItemKey(item);
    setOptimisticItemState((prev) => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        ...partial,
      },
    }));
  };

  const clearItemOptimisticState = (
    item: Pick<DashboardItem, "category" | "id">,
  ) => {
    const itemKey = getItemKey(item);
    setOptimisticItemState((prev) => {
      if (!(itemKey in prev)) return prev;
      const next = { ...prev };
      delete next[itemKey];
      return next;
    });
  };

  const setFlaggedStatusMutation = api.admin.setFlaggedStatus.useMutation({
    onMutate: (variables) => {
      setItemOptimisticState(
        { category: variables.entityType, id: variables.entityId },
        { flagged: variables.flagged },
      );
    },
    onError: (_error, variables) => {
      clearItemOptimisticState({
        category: variables.entityType,
        id: variables.entityId,
      });
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        utils.admin.dashboardItems.invalidate(),
        utils.admin.flaggedDashboardItems.invalidate(),
      ]);
      clearItemOptimisticState({
        category: variables.entityType,
        id: variables.entityId,
      });
    },
  });

  const setHiddenStatusMutation = api.admin.setHiddenStatus.useMutation({
    onMutate: (variables) => {
      setItemOptimisticState(
        { category: variables.entityType, id: variables.entityId },
        { hidden: variables.hidden },
      );
    },
    onError: (_error, variables) => {
      clearItemOptimisticState({
        category: variables.entityType,
        id: variables.entityId,
      });
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        utils.admin.dashboardItems.invalidate(),
        utils.admin.hiddenDashboardItems.invalidate(),
      ]);
      clearItemOptimisticState({
        category: variables.entityType,
        id: variables.entityId,
      });
    },
  });

  const pageSize = 5;

  const mapItems = (rawItems: unknown) => {
    if (!Array.isArray(rawItems)) return [];

    interface RawDashboardItem {
      type?: unknown;
      id?: unknown;
      createdAt?: unknown;
      flagged?: unknown;
      hidden?: unknown;
      // review
      text?: unknown;
      headline?: unknown;
      // role
      title?: unknown;
      companyId?: unknown;
      // company
      name?: unknown;
    }

    const isRecord = (value: unknown): value is RawDashboardItem =>
      typeof value === "object" && value !== null;

    const asString = (value: unknown): string | null =>
      typeof value === "string" ? value : null;

    const asBoolean = (value: unknown): boolean =>
      typeof value === "boolean" ? value : false;

    const asDate = (value: unknown): Date => {
      if (value instanceof Date) return value;
      const s = asString(value);
      return s ? new Date(s) : new Date(0);
    };

    const getType = (value: RawDashboardItem) => {
      const t = value.type;
      return t === "review" || t === "role" || t === "company" ? t : null;
    };

    const items: DashboardItem[] = [];

    for (const raw of rawItems) {
      if (!isRecord(raw)) continue;
      const type = getType(raw);
      if (!type) continue;

      if (type === "review") {
        const id = asString(raw.id);
        if (!id) continue;
        const text = asString(raw.text);
        const headline = asString(raw.headline);
        items.push({
          id,
          category: "review",
          title: (text ?? headline ?? "").toString(),
          description: headline ?? undefined,
          createdAt: asDate(raw.createdAt),
          flagged: asBoolean(raw.flagged),
          hidden: asBoolean(raw.hidden),
        });
        continue;
      }

      if (type === "role") {
        const id = asString(raw.id);
        const title = asString(raw.title);
        if (!id || !title) continue;
        const companyId = asString(raw.companyId);
        items.push({
          id,
          category: "role",
          title,
          company: companyId ?? undefined,
          createdAt: asDate(raw.createdAt),
          flagged: asBoolean(raw.flagged),
          hidden: asBoolean(raw.hidden),
        });
        continue;
      }

      // company
      const id = asString(raw.id);
      const name = asString(raw.name);
      if (!id || !name) continue;
      items.push({
        id,
        category: "company",
        title: name,
        createdAt: asDate(raw.createdAt),
        flagged: asBoolean(raw.flagged),
        hidden: asBoolean(raw.hidden),
      });
    }

    return items;
  };

  const mostRecentItems: DashboardItem[] = useMemo(
    () =>
      mapItems(mostRecentItemsData?.items).map((item) => {
        const optimistic = optimisticItemState[getItemKey(item)];
        return optimistic
          ? {
              ...item,
              flagged: optimistic.flagged ?? item.flagged,
              hidden: optimistic.hidden ?? item.hidden,
            }
          : item;
      }),
    [mostRecentItemsData, optimisticItemState],
  );
  const flaggedItems: DashboardItem[] = useMemo(
    () =>
      mapItems(flaggedData?.items).map((item) => {
        const optimistic = optimisticItemState[getItemKey(item)];
        return optimistic
          ? {
              ...item,
              flagged: optimistic.flagged ?? item.flagged,
              hidden: optimistic.hidden ?? item.hidden,
            }
          : item;
      }),
    [flaggedData, optimisticItemState],
  );
  const hiddenItems: DashboardItem[] = useMemo(
    () =>
      mapItems(hiddenData?.items).map((item) => {
        const optimistic = optimisticItemState[getItemKey(item)];
        return optimistic
          ? {
              ...item,
              flagged: optimistic.flagged ?? item.flagged,
              hidden: optimistic.hidden ?? item.hidden,
            }
          : item;
      }),
    [hiddenData, optimisticItemState],
  );
  const reportedItems: DashboardItem[] = useMemo(
    () =>
      mapItems(reportedData?.items).map((item) => {
        const optimistic = optimisticItemState[getItemKey(item)];
        return optimistic
          ? {
              ...item,
              flagged: optimistic.flagged ?? item.flagged,
              hidden: optimistic.hidden ?? item.hidden,
            }
          : item;
      }),
    [reportedData, optimisticItemState],
  );

  const filterItems = useCallback(
    (current: DashboardItem[]) => {
      let result = current;

      if (activeTab === "reviews") {
        result = result.filter((i) => i.category === "review");
      } else if (activeTab === "role") {
        result = result.filter((i) => i.category === "role");
      } else if (activeTab === "company") {
        result = result.filter((i) => i.category === "company");
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter((item) =>
          [
            item.title,
            item.subtitle,
            item.description,
            item.company,
            item.location,
          ]
            .filter(Boolean)
            .some((v) => v?.toLowerCase().includes(q)),
        );
      }

      return result;
    },
    [activeTab, searchQuery],
  );

  const filteredMostRecentItems = useMemo(
    () => filterItems(mostRecentItems),
    [mostRecentItems, filterItems],
  );
  const filteredFlaggedItems = useMemo(
    () => filterItems(flaggedItems),
    [flaggedItems, filterItems],
  );
  const filteredHiddenItems = useMemo(
    () => filterItems(hiddenItems),
    [hiddenItems, filterItems],
  );
  const filteredReportedItems = useMemo(
    () => filterItems(reportedItems),
    [reportedItems, filterItems],
  );

  const totalPagesRecent = Math.max(
    1,
    Math.ceil(filteredMostRecentItems.length / pageSize),
  );
  const totalPagesFlagged = Math.max(
    1,
    Math.ceil(filteredFlaggedItems.length / pageSize),
  );
  const totalPagesHidden = Math.max(
    1,
    Math.ceil(filteredHiddenItems.length / pageSize),
  );
  const totalPagesReported = Math.max(
    1,
    Math.ceil(filteredReportedItems.length / pageSize),
  );

  const pageItemsRecent = useMemo(() => {
    const start = (currentPageRecent - 1) * pageSize;
    return filteredMostRecentItems.slice(start, start + pageSize);
  }, [filteredMostRecentItems, currentPageRecent]);

  const pageItemsFlagged = useMemo(() => {
    const start = (currentPageFlagged - 1) * pageSize;
    return filteredFlaggedItems.slice(start, start + pageSize);
  }, [filteredFlaggedItems, currentPageFlagged]);

  const pageItemsHidden = useMemo(() => {
    const start = (currentPageHidden - 1) * pageSize;
    return filteredHiddenItems.slice(start, start + pageSize);
  }, [filteredHiddenItems, currentPageHidden]);

  const pageItemsReported = useMemo(() => {
    const start = (currentPageReported - 1) * pageSize;
    return filteredReportedItems.slice(start, start + pageSize);
  }, [filteredReportedItems, currentPageReported]);

  useEffect(() => {
    const clampPage = (currentPage: number, totalPages: number) =>
      Math.min(currentPage, totalPages);

    setCurrentPageRecent((p) => clampPage(p, totalPagesRecent));
    setCurrentPageFlagged((p) => clampPage(p, totalPagesFlagged));
    setCurrentPageHidden((p) => clampPage(p, totalPagesHidden));
    setCurrentPageReported((p) => clampPage(p, totalPagesReported));
  }, [
    totalPagesRecent,
    totalPagesFlagged,
    totalPagesHidden,
    totalPagesReported,
  ]);

  const handleTabChange = (value: TabValue) => {
    setActiveTab(value);
    setCurrentPageRecent(1);
    setCurrentPageFlagged(1);
    setCurrentPageHidden(1);
    setCurrentPageReported(1);
  };

  const handlePageChangeRecent = (page: number) => {
    if (page < 1 || page > totalPagesRecent) return;
    setCurrentPageRecent(page);
  };

  const handlePageChangeFlagged = (page: number) => {
    if (page < 1 || page > totalPagesFlagged) return;
    setCurrentPageFlagged(page);
  };

  const handlePageChangeHidden = (page: number) => {
    if (page < 1 || page > totalPagesHidden) return;
    setCurrentPageHidden(page);
  };

  const handlePageChangeReported = (page: number) => {
    if (page < 1 || page > totalPagesReported) return;
    setCurrentPageReported(page);
  };

  const handleToggleFlag = (item: DashboardItem) => {
    if (item.flagged === false) {
      setConfirmFlagItem(item);
      setFlagReason("");
      setConfirmFlagOpen(true);
      return;
    }

    // Unflag immediately
    setFlaggedStatusMutation.mutate({
      entityType: item.category,
      entityId: item.id,
      flagged: false,
    });
  };

  const handleToggleHidden = (item: DashboardItem) => {
    if (item.hidden === false) {
      setConfirmHideItem(item);
      setConfirmHideOpen(true);
      return;
    }

    // Unhide immediately
    setHiddenStatusMutation.mutate({
      entityType: item.category,
      entityId: item.id,
      hidden: false,
    });
  };

  return (
    <div className="flex min-h-0 h-full w-full flex-col gap-4 overflow-y-auto">
      <Dialog
        open={confirmHideOpen}
        onOpenChange={(open) => {
          setConfirmHideOpen(open);
          if (!open) setConfirmHideItem(null);
        }}
      >
        <DialogContent className="w-[min(92vw,520px)] p-6">
          <DialogHeader>
            <DialogTitle>Hide this item?</DialogTitle>
            <DialogDescription>
              Are you sure you want to hide this{" "}
              {confirmHideItem?.category ?? "item"}? You can unhide it later.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
            <button
              type="button"
              onClick={() => {
                setConfirmHideOpen(false);
                setConfirmHideItem(null);
              }}
              className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!confirmHideItem || setHiddenStatusMutation.isPending}
              onClick={() => {
                if (!confirmHideItem) return;
                setHiddenStatusMutation.mutate({
                  entityType: confirmHideItem.category,
                  entityId: confirmHideItem.id,
                  hidden: true,
                });
                setConfirmHideOpen(false);
                setConfirmHideItem(null);
              }}
              className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Hide
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmFlagOpen}
        onOpenChange={(open) => {
          setConfirmFlagOpen(open);
          if (!open) {
            setConfirmFlagItem(null);
            setFlagReason("");
          }
        }}
      >
        <DialogContent className="w-[min(92vw,520px)] p-6">
          <DialogHeader>
            <DialogTitle>Flag this item?</DialogTitle>
            <DialogDescription>
              Add a reason for flagging this{" "}
              {confirmFlagItem?.category ?? "item"}.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <label
              htmlFor="flag-reason"
              className="block text-sm font-medium text-gray-900"
            >
              Reason
            </label>
            <textarea
              id="flag-reason"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Enter a reason..."
              rows={4}
              className="mt-2 w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
            />
          </div>

          <DialogFooter className="mt-6">
            <button
              type="button"
              onClick={() => {
                setConfirmFlagOpen(false);
                setConfirmFlagItem(null);
                setFlagReason("");
              }}
              className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={
                !confirmFlagItem ||
                setFlaggedStatusMutation.isPending ||
                !flagReason.trim()
              }
              onClick={() => {
                if (!confirmFlagItem) return;
                const reason = flagReason.trim();
                if (!reason) return;

                setFlaggedStatusMutation.mutate({
                  entityType: confirmFlagItem.category,
                  entityId: confirmFlagItem.id,
                  flagged: true,
                  description: reason,
                });

                setConfirmFlagOpen(false);
                setConfirmFlagItem(null);
                setFlagReason("");
              }}
              className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Flag
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Search for a review, role, company..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPageRecent(1);
              setCurrentPageHidden(1);
              setCurrentPageFlagged(1);
              setCurrentPageReported(1);
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

        <CollapsibleSection
          title="New this week"
          isOpen={mostRecentOpen}
          onToggle={() => setMostRecentOpen((o) => !o)}
          isLoading={isLoadingMostRecent}
          pageItems={pageItemsRecent}
          totalPages={totalPagesRecent}
          currentPage={currentPageRecent}
          onPageChange={handlePageChangeRecent}
          onToggleFlag={handleToggleFlag}
          onToggleHidden={handleToggleHidden}
          isUpdatingFlag={setFlaggedStatusMutation.isPending}
          isUpdatingHidden={setHiddenStatusMutation.isPending}
        />

        <CollapsibleSection
          title="Reported"
          isOpen={reportedOpen}
          onToggle={() => setReportedOpen((o) => !o)}
          isLoading={isLoadingReported}
          pageItems={pageItemsReported}
          totalPages={totalPagesReported}
          currentPage={currentPageReported}
          onPageChange={handlePageChangeReported}
          onToggleFlag={handleToggleFlag}
          onToggleHidden={handleToggleHidden}
          isUpdatingFlag={setFlaggedStatusMutation.isPending}
          isUpdatingHidden={setHiddenStatusMutation.isPending}
        />

        <CollapsibleSection
          title="Flagged"
          isOpen={flaggedOpen}
          onToggle={() => setFlaggedOpen((o) => !o)}
          isLoading={isLoadingFlagged}
          pageItems={pageItemsFlagged}
          totalPages={totalPagesFlagged}
          currentPage={currentPageFlagged}
          onPageChange={handlePageChangeFlagged}
          onToggleFlag={handleToggleFlag}
          onToggleHidden={handleToggleHidden}
          isUpdatingFlag={setFlaggedStatusMutation.isPending}
          isUpdatingHidden={setHiddenStatusMutation.isPending}
        />

        <CollapsibleSection
          title="Hidden"
          isOpen={hiddenOpen}
          onToggle={() => setHiddenOpen((o) => !o)}
          isLoading={isLoadingHidden}
          pageItems={pageItemsHidden}
          totalPages={totalPagesHidden}
          currentPage={currentPageHidden}
          onPageChange={handlePageChangeHidden}
          onToggleFlag={handleToggleFlag}
          onToggleHidden={handleToggleHidden}
          isUpdatingFlag={setFlaggedStatusMutation.isPending}
          isUpdatingHidden={setHiddenStatusMutation.isPending}
        />
      </div>
    </div>
  );
}
