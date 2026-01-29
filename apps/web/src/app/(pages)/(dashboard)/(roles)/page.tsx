"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import type { CompanyType, RoleType } from "@cooper/db/schema";
import { cn, Pagination } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import { Chip } from "@cooper/ui/chip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";

import { CompanyCardPreview } from "~/app/_components/companies/company-card-preview";
import CompanyInfo from "~/app/_components/companies/company-info";
import { useCompare } from "~/app/_components/compare/compare-context";
import {
  CompareColumns,
  CompareControls,
} from "~/app/_components/compare/compare-ui";
import DropdownFiltersBar from "~/app/_components/filters/dropdown-filters-bar";
import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";
import { RoleInfo } from "~/app/_components/reviews/role-info";
import SearchFilter from "~/app/_components/search/search-filter";
import { api } from "~/trpc/react";

interface FilterState {
  industries: string[];
  locations: string[];
  jobTypes: string[];
  hourlyPay: { min: number; max: number };
  ratings: string[];
}

// Helper function to create URL-friendly slugs (still needed for URL generation)
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove all non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
};

export default function Roles() {
  const searchParams = useSearchParams();
  const companyParam = searchParams.get("company") ?? null;
  const roleParam = searchParams.get("role") ?? null;
  const searchValue = searchParams.get("search") ?? ""; // Get search query from URL
  const router = useRouter();
  const compare = useCompare();

  const [selectedType, setSelectedType] = useState<
    "roles" | "companies" | "all"
  >("all");

  const [selectedFilter, setSelectedFilter] = useState<
    "default" | "rating" | "newest" | "oldest" | undefined
  >("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    industries: [],
    locations: [],
    jobTypes: [],
    hourlyPay: { min: 0, max: 0 },
    ratings: [],
  });
  const rolesAndCompaniesPerPage = 10;

  // Query for specific company or role based on URL params
  const companyBySlug = api.company.getBySlug.useQuery(
    { slug: companyParam ?? "" },
    {
      enabled: !!companyParam && !roleParam,
      retry: false,
      refetchOnWindowFocus: false,
    },
  );

  const roleBySlug = api.role.getByCompanySlugAndRoleSlug.useQuery(
    { companySlug: companyParam ?? "", roleSlug: roleParam ?? "" },
    {
      enabled: !!companyParam && !!roleParam,
      retry: false,
      refetchOnWindowFocus: false,
    },
  );

  // Query to get the page number for the selected item from URL
  const pageNumberQuery = api.roleAndCompany.getPageNumber.useQuery(
    {
      itemId: roleBySlug.data?.id ?? companyBySlug.data?.id ?? "",
      itemType: roleParam ? "role" : "company",
      sortBy: selectedFilter ?? "default",
      search: searchValue,
      type: selectedType,
      limit: rolesAndCompaniesPerPage,
    },
    {
      enabled: (!!roleBySlug.data || !!companyBySlug.data) && !!companyParam,
      retry: false,
      refetchOnWindowFocus: false,
    },
  );

  // Set the page when we get the page number from URL params
  useEffect(() => {
    if (pageNumberQuery.isSuccess && pageNumberQuery.data.found) {
      setCurrentPage(pageNumberQuery.data.page);
    }
  }, [pageNumberQuery.isSuccess, pageNumberQuery.data]);

  // Only fetch the main list after we have the correct page number (if coming from URL)
  const shouldFetchList =
    !companyParam || // No URL params, fetch normally
    pageNumberQuery.isSuccess || // Have page number from URL
    pageNumberQuery.isError; // Query failed, fall back to page 1

  // Convert filter state to backend format
  const backendFilters = useMemo(() => {
    return {
      industries:
        appliedFilters.industries.length > 0
          ? appliedFilters.industries
          : undefined,
      locations:
        appliedFilters.locations.length > 0
          ? appliedFilters.locations
          : undefined,
      jobTypes:
        appliedFilters.jobTypes.length > 0
          ? appliedFilters.jobTypes
          : undefined,
      minPay:
        appliedFilters.hourlyPay.min > 0
          ? appliedFilters.hourlyPay.min
          : undefined,
      maxPay:
        appliedFilters.hourlyPay.max > 0
          ? appliedFilters.hourlyPay.max
          : undefined,
      ratings:
        appliedFilters.ratings.length > 0 ? appliedFilters.ratings : undefined,
    };
  }, [appliedFilters]);

  const rolesAndCompanies = api.roleAndCompany.list.useQuery(
    {
      sortBy: selectedFilter,
      search: searchValue,
      limit: rolesAndCompaniesPerPage,
      offset: (currentPage - 1) * rolesAndCompaniesPerPage,
      type: selectedType,
      filters: backendFilters,
    },
    {
      enabled: shouldFetchList,
    },
  );

  const buttonStyle =
    "bg-white hover:bg-cooper-gray-200 border-white text-black p-2";

  const defaultItem = useMemo(() => {
    // If we have both company and role params, use the role query result
    if (companyParam && roleParam && roleBySlug.isSuccess && roleBySlug.data) {
      return { ...roleBySlug.data, type: "role" as const };
    }

    // If we have only company param, use the company query result
    if (
      companyParam &&
      !roleParam &&
      companyBySlug.isSuccess &&
      companyBySlug.data
    ) {
      return { ...companyBySlug.data, type: "company" as const };
    }

    // Default to first item in list only if no params are set
    if (!companyParam && !roleParam && rolesAndCompanies.isSuccess) {
      if (rolesAndCompanies.data.items.length > 0) {
        return rolesAndCompanies.data.items[0];
      }
    }

    return undefined;
  }, [
    companyParam,
    roleParam,
    roleBySlug.isSuccess,
    roleBySlug.data,
    companyBySlug.isSuccess,
    companyBySlug.data,
    rolesAndCompanies.isSuccess,
    rolesAndCompanies.data,
  ]);
  const isRole = useCallback(
    (item: RoleType | CompanyType): item is RoleType & { type: "role" } => {
      return "type" in item && item.type === "role";
    },
    [],
  );

  const [selectedItem, setSelectedItem] = useState<
    (RoleType | CompanyType) | undefined
  >();

  // Ref to store card refs for scrolling
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hasScrolledToItem = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultItem) {
      setSelectedItem(defaultItem);
    }
  }, [defaultItem]);

  // Scroll to selected item only when coming from direct URL (not user clicks)
  useEffect(() => {
    if (
      selectedItem &&
      rolesAndCompanies.isSuccess &&
      (companyParam || roleParam) &&
      !hasScrolledToItem.current
    ) {
      const cardElement = cardRefs.current[selectedItem.id];
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        hasScrolledToItem.current = true;
      }
    }
  }, [selectedItem, rolesAndCompanies.isSuccess, companyParam, roleParam]);

  // Reset scroll flag when URL params are cleared
  useEffect(() => {
    if (!companyParam && !roleParam) {
      hasScrolledToItem.current = false;
    }
  }, [companyParam, roleParam]);

  useEffect(() => {
    // updates the URL when a role or company is changed
    // Don't update URL if query is still loading (prevents updating with stale data during page changes)
    if (selectedItem && rolesAndCompanies.isSuccess) {
      const params = new URLSearchParams(window.location.search);

      if (isRole(selectedItem)) {
        // For roles, use company and role parameters
        const roleItem = selectedItem as RoleType & {
          companyName?: string;
          slug?: string;
          companySlug?: string;
        };
        const companyName = roleItem.companyName ?? "";
        const companySlug = roleItem.companySlug ?? createSlug(companyName);
        const roleSlug = roleItem.slug;

        if (
          companyName &&
          (companyParam !== companySlug || roleParam !== roleSlug)
        ) {
          // Preserve search param
          const currentSearch = params.get("search");
          params.delete("search");

          params.set("company", companySlug);
          params.set("role", roleSlug);

          // Add search back at the end
          if (currentSearch) {
            params.set("search", currentSearch);
          }

          router.push(`/?${params.toString()}`);
        }
      } else {
        // For companies, use the company parameter with the name
        const companyItem = selectedItem as CompanyType & { slug?: string };
        const companySlug = companyItem.slug;

        if (companyParam !== companySlug || roleParam !== null) {
          // Preserve search param
          const currentSearch = params.get("search");
          params.delete("search");

          params.delete("role");
          params.set("company", companySlug);

          // Add search back at the end
          if (currentSearch) {
            params.set("search", currentSearch);
          }

          router.push(`/?${params.toString()}`);
        }
      }
    }
  }, [
    selectedItem,
    isRole,
    rolesAndCompanies.isSuccess,
  ]);

  //here 
  const [showRoleInfo, setShowRoleInfo] = useState(false); // State for toggling views on mobile

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchValue]);

  // Scroll to top + select first item when page changes (but not when coming from URL)
  useEffect(() => {
    if (
      rolesAndCompanies.isSuccess &&
      rolesAndCompanies.data.items.length > 0 &&
      !companyParam && // Only auto-select if no URL params
      !roleParam
    ) {
      // Scroll sidebar to top
      if (sidebarRef.current) {
        sidebarRef.current.scrollTop = 0;
      }
      // Select first item on the new page
      setSelectedItem(rolesAndCompanies.data.items[0]);
    }
  }, [
    currentPage,
    rolesAndCompanies.isSuccess,
    rolesAndCompanies.data?.items,
    companyParam,
    roleParam,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Clear URL params when changing pages
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");

    // Build new URL with only search param if it exists
    if (searchParam) {
      router.push(`/?search=${searchParam}`);
    } else {
      router.push("/");
    }
  };

  const handleFilterChange = (filters: FilterState) => {
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchValue, selectedType]);

  useEffect(() => {
  if (roleParam) {
    setSelectedType("roles");
  } else if (companyParam) {
    setSelectedType("companies");
  } else {
    setSelectedType("all");
  }
  }, [roleParam, companyParam]);


  const totalPages =
    rolesAndCompanies.data &&
    "totalCount" in rolesAndCompanies.data &&
    rolesAndCompanies.data.totalCount
      ? Math.ceil(rolesAndCompanies.data.totalCount / rolesAndCompaniesPerPage)
      : 0;

  const resolvedSelection =
    selectedItem ??
    (rolesAndCompanies.data?.items.length
      ? rolesAndCompanies.data.items[0]
      : undefined);

  const selectedRole = useMemo(() => {
    if (!resolvedSelection) return null;
    return isRole(resolvedSelection) ? (resolvedSelection as RoleType) : null;
  }, [resolvedSelection, isRole]);

  const selectedCompany = useMemo(() => {
    if (!resolvedSelection) return null;
    return !isRole(resolvedSelection)
      ? (resolvedSelection as CompanyType)
      : null;
  }, [resolvedSelection, isRole]);

  // Helper to check if a role is already being compared
  const isRoleAlreadyCompared = (roleId: string) => {
    return (
      selectedRole?.id === roleId || compare.comparedRoleIds.includes(roleId)
    );
  };

  const handleRoleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    role: RoleType,
  ) => {
    if (!compare.isCompareMode) return;
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/role-id", role.id);
    event.dataTransfer.setData("text/plain", role.id);
    const preview = document.createElement("div");
    preview.style.position = "absolute";
    preview.style.top = "-9999px";
    preview.style.left = "-9999px";
    preview.style.padding = "12px 16px";
    preview.style.border = "1px solid #e5e5e5";
    preview.style.borderRadius = "10px";
    preview.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
    preview.style.background = "white";
    preview.style.fontSize = "15px";
    preview.style.fontWeight = "600";
    preview.style.color = "#141414";
    preview.innerText = role.title;
    document.body.appendChild(preview);
    event.dataTransfer.setDragImage(preview, preview.clientWidth / 2, 20);
    requestAnimationFrame(() => {
      document.body.removeChild(preview);
    });
  };

  return (
    <>
      <div className="bg-cooper-cream-100 border-cooper-gray-150  z-20 flex w-full flex-col items-stretch gap-4 self-start border-b-[1px] py-4 md:flex-row md:items-center md:gap-5">
        <div className="w-full px-5 md:w-[28%]">
          <SearchFilter className="w-full" />
        </div>
        <div className="no-scrollbar w-full flex-1 overflow-x-auto px-5 md:overflow-visible md:pl-0 md:pr-5">
          <DropdownFiltersBar onFilterChange={handleFilterChange} />
        </div>
        {compare.isCompareMode && selectedRole && (
          <div className="hidden items-center gap-2 px-5 md:flex">
            <CompareControls anchorRoleId={selectedRole.id} inTopBar />
          </div>
        )}
      </div>
      {rolesAndCompanies.isSuccess &&
        rolesAndCompanies.data.items.length > 0 && (
          <div className="bg-cooper-cream-100 flex h-[90dvh] w-full ">
            {/* RoleCardPreview List */}
            <div
              ref={sidebarRef}
              className={cn(
                "border-cooper-gray-150 bg-cooper-cream-100 w-full overflow-y-auto border-r-[1px] p-5 xl:rounded-none",
                "md:w-[28%]", // Show as 28% width on md and above
                showRoleInfo && "hidden md:block", // Hide on mobile if RoleInfo is visible
              )}
            >
              <div className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-md mb-2">
                    Sort By{" "}
                    <span className="underline">
                      {selectedFilter &&
                        selectedFilter.charAt(0).toUpperCase() +
                          selectedFilter.slice(1)}
                    </span>
                    <ChevronDown className="inline" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel className="flex flex-col text-center">
                      <Button
                        className={buttonStyle}
                        onClick={() => setSelectedFilter("default")}
                      >
                        Default
                      </Button>
                      <Button
                        className={buttonStyle}
                        onClick={() => setSelectedFilter("newest")}
                      >
                        Newest
                      </Button>
                      <Button
                        className={buttonStyle}
                        onClick={() => setSelectedFilter("oldest")}
                      >
                        Oldest
                      </Button>
                      <Button
                        className={buttonStyle}
                        onClick={() => setSelectedFilter("rating")}
                      >
                        Rating
                      </Button>
                    </DropdownMenuLabel>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex gap-2 py-2">
                  <Chip
                    label="All"
                    onClick={() => setSelectedType("all")}
                    selected={selectedType === "all"}
                  />
                  <Chip
                    onClick={() => setSelectedType("roles")}
                    label={`Jobs (${rolesAndCompanies.data.totalRolesCount})`}
                    selected={selectedType === "roles"}
                  />
                  <Chip
                    onClick={() => setSelectedType("companies")}
                    label={`Companies (${rolesAndCompanies.data.totalCompanyCount})`}
                    selected={selectedType === "companies"}
                  />
                </div>
              </div>
              {rolesAndCompanies.data.items.map((item, i) => {
                if (item.type === "role") {
                  const roleItem = item as RoleType;
                  const isAlreadyCompared = isRoleAlreadyCompared(roleItem.id);
                  return (
                    <div
                      ref={(el) => {
                        cardRefs.current[item.id] = el;
                      }}
                      key={roleItem.id}
                      className={cn(
                        "relative mb-4 rounded-lg",
                        compare.isCompareMode &&
                          !isAlreadyCompared &&
                          "cursor-grab active:cursor-grabbing",
                      )}
                      draggable={compare.isCompareMode && !isAlreadyCompared}
                      onDragStart={
                        compare.isCompareMode && !isAlreadyCompared
                          ? (event) => handleRoleDragStart(event, roleItem)
                          : undefined
                      }
                      onClick={() => {
                        setSelectedItem(roleItem);
                        setShowRoleInfo(true); // Show RoleInfo on mobile
                      }}
                    >
                      {compare.isCompareMode && !isAlreadyCompared && (
                        <button
                          type="button"
                          aria-label="Add to comparison"
                          className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center transition"
                          onClick={(event) => {
                            event.stopPropagation();
                            compare.enterCompareMode();
                            compare.addRoleId(roleItem.id);
                          }}
                        >
                          <svg
                            width="30"
                            height="30"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="10"
                              cy="10"
                              r="8"
                              stroke="#B4B4B4"
                              strokeWidth="2"
                              fill="none"
                            />
                            <path
                              d="M10 6v8M6 10h8"
                              stroke="#B4B4B4"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      )}
                      <RoleCardPreview
                        roleObj={roleItem}
                        showDragHandle={
                          compare.isCompareMode && !isAlreadyCompared
                        }
                        showFavorite={!compare.isCompareMode}
                        className={cn(
                          "hover:bg-cooper-gray-200",
                          selectedItem
                            ? selectedItem.id === item.id &&
                                "bg-cooper-cream-200 hover:bg-cooper-gray-200"
                            : !i &&
                                "bg-cooper-cream-200 hover:bg-cooper-gray-200",
                        )}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={item.id}
                      ref={(el) => {
                        cardRefs.current[item.id] = el;
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedItem(item);
                      }}
                    >
                      <CompanyCardPreview
                        companyObj={item}
                        className={cn(
                          "mb-4 hover:bg-cooper-gray-100",
                          selectedItem
                            ? selectedItem.id === item.id &&
                                "bg-cooper-cream-200"
                            : !i && "bg-cooper-cream-200",
                        )}
                      />
                    </div>
                  );
                }

                // return (
                //   <div
                //     key={item.id}
                //     onClick={() => {
                //       setSelectedItem(item);
                //     }}
                //   >
                //     <CompanyCardPreview
                //       companyObj={item}
                //       className={cn(
                //         "mb-4 hover:bg-cooper-gray-200",
                //         selectedItem
                //           ? selectedItem.id === item.id && "bg-cooper-cream-200"
                //           : !i && "bg-cooper-cream-200",
                //       )}
                //     />
                //   </div>
                // );
              })}

              {/* Pagination */}
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
            <div
              className={cn(
                "col-span-3 w-full overflow-y-auto p-1",
                "md:w-[72%]", // Show as 72% width on md and above
                !showRoleInfo && "hidden md:block", // Hide on mobile if RoleCardPreview is visible
              )}
            >
              {selectedRole && !compare.isCompareMode && (
                <div className="flex w-full items-center justify-end px-4 py-2">
                  <CompareControls anchorRoleId={selectedRole.id} />
                </div>
              )}
              {selectedRole ? (
                compare.isCompareMode ? (
                  <CompareColumns anchorRole={selectedRole} />
                ) : (
                  <RoleInfo
                    roleObj={selectedRole}
                    onBack={() => setShowRoleInfo(false)}
                  />
                )
              ) : (
                selectedCompany && <CompanyInfo companyObj={selectedCompany} />
              )}
            </div>
          </div>
        )}
      {rolesAndCompanies.isSuccess &&
        rolesAndCompanies.data.items.length === 0 && (
          <NoResults className="h-[84dvh]" />
        )}
      {rolesAndCompanies.isPending && <LoadingResults className="h-[84dvh]" />}
    </>
  );
}
