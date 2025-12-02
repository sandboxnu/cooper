"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import DropdownFiltersBar from "~/app/_components/filters/dropdown-filters-bar";
import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";
import { RoleInfo } from "~/app/_components/reviews/role-info";
import { api } from "~/trpc/react";
import SearchFilter from "~/app/_components/search/search-filter";

interface FilterState {
  industries: string[];
  locations: string[];
  jobTypes: string[];
  hourlyPay: { min: number; max: number };
  ratings: string[];
}

export default function Roles() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("id") ?? null;
  const searchValue = searchParams.get("search") ?? ""; // Get search query from URL
  const router = useRouter();

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

  const rolesAndCompanies = api.roleAndCompany.list.useQuery({
    sortBy: selectedFilter,
    search: searchValue,
    limit: rolesAndCompaniesPerPage,
    offset: (currentPage - 1) * rolesAndCompaniesPerPage,
    type: selectedType,
    filters: backendFilters,
  });

  const buttonStyle =
    "bg-white hover:bg-cooper-gray-200 border-white text-black p-2";

  const defaultItem = useMemo(() => {
    if (rolesAndCompanies.isSuccess) {
      const item = rolesAndCompanies.data.items.find(
        (i) => i.id === queryParam,
      );
      if (item) {
        return item;
      } else if (rolesAndCompanies.data.items.length > 0) {
        return rolesAndCompanies.data.items[0];
      }
    }
  }, [rolesAndCompanies.isSuccess, rolesAndCompanies.data, queryParam]);

  const isRole = (
    item: RoleType | CompanyType,
  ): item is RoleType & { type: "role" } => {
    return "type" in item && item.type === "role";
  };

  const [selectedItem, setSelectedItem] = useState<
    (RoleType | CompanyType) | undefined
  >();

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // initializes the selectedRole to either the role provided by the query params or the first in the role data
    if (defaultItem) {
      setSelectedItem(defaultItem);
    }
  }, [defaultItem]);

  useEffect(() => {
    // updates the URL when a role is changed
    if (selectedItem && queryParam !== selectedItem.id) {
      const params = new URLSearchParams(window.location.search);
      params.set("id", selectedItem.id);
      router.replace(`/?${params.toString()}`);
    }
  }, [selectedItem, router, queryParam]);

  const [showRoleInfo, setShowRoleInfo] = useState(false); // State for toggling views on mobile

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchValue]);

  // Scroll to top and select first item when page changes
  useEffect(() => {
    if (
      rolesAndCompanies.isSuccess &&
      rolesAndCompanies.data.items.length > 0
    ) {
      // Scroll sidebar to top
      if (sidebarRef.current) {
        sidebarRef.current.scrollTop = 0;
      }
      // Select first item on the new page
      setSelectedItem(rolesAndCompanies.data.items[0]);
      setShowRoleInfo(true);
    }
  }, [currentPage, rolesAndCompanies.isSuccess, rolesAndCompanies.data?.items]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (filters: FilterState) => {
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setAppliedFilters({
      industries: [],
      locations: [],
      jobTypes: [],
      hourlyPay: { min: 0, max: 0 },
      ratings: [],
    });
    setSelectedFilter("default");
    setSelectedType("all");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchValue, selectedType]);

  const totalPages =
    rolesAndCompanies.data &&
    "totalCount" in rolesAndCompanies.data &&
    rolesAndCompanies.data.totalCount
      ? Math.ceil(rolesAndCompanies.data.totalCount / rolesAndCompaniesPerPage)
      : 0;

  return (
    <>
      <div className="bg-cooper-cream-100 border-cooper-gray-150 fixed flex w-full flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-5 self-start border-b-[1px] py-4">
        <div className="w-full md:w-[28%] px-5">
          <SearchFilter className="w-full" />
        </div>
        <div className="flex-1 px-5 md:pr-5 md:pl-0">
          <DropdownFiltersBar onFilterChange={handleFilterChange} />
        </div>
      </div>
      {rolesAndCompanies.isSuccess && (
        <div className="bg-cooper-cream-100 flex h-[90dvh] w-full pt-[9.25dvh]">
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
            {rolesAndCompanies.data.items.length === 0 && (
              <div className="mt-6 p-4 text-center text-sm text-cooper-gray-400">
                No results found.
              </div>
            )}

            {rolesAndCompanies.data.items.map((item, i) => {
              if (item.type === "role") {
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setShowRoleInfo(true); // Show RoleInfo on mobile
                    }}
                  >
                    <RoleCardPreview
                      roleObj={item}
                      className={cn(
                        "mb-4 hover:bg-cooper-gray-100",
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
                    onClick={() => {
                      setSelectedItem(item);
                    }}
                  >
                    <CompanyCardPreview
                      companyObj={item}
                      className={cn(
                        "mb-4 hover:bg-cooper-gray-100",
                        selectedItem
                          ? selectedItem.id === item.id &&
                              "bg-cooper-gray-200 hover:bg-cooper-gray-200"
                          : !i && "bg-cooper-gray-200 hover:bg-cooper-gray-200",
                      )}
                    />
                  </div>
                );
              }
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
            {rolesAndCompanies.data.items.length === 0 ? (
              <NoResults clearFunction={false} className="h-[84dvh]" />
            ) : (
              rolesAndCompanies.data.items[0] &&
              (isRole(selectedItem ?? rolesAndCompanies.data.items[0]) ? (
                <RoleInfo
                  roleObj={
                    (selectedItem ??
                      rolesAndCompanies.data.items[0]) as RoleType
                  }
                  onBack={() => setShowRoleInfo(false)}
                />
              ) : (
                <div>
                  <CompanyInfo
                    companyObj={
                      (selectedItem ??
                        rolesAndCompanies.data.items[0]) as CompanyType
                    }
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {rolesAndCompanies.isPending && <LoadingResults className="h-[84dvh]" />}
    </>
  );
}
