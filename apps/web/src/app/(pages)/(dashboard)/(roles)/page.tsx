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
import { useCompare } from "~/app/_components/compare/compare-context";
import {
  CompareColumns,
  CompareControls,
} from "~/app/_components/compare/compare-ui";
import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";
import { RoleInfo } from "~/app/_components/reviews/role-info";
import SearchFilter from "~/app/_components/search/search-filter";
import { api } from "~/trpc/react";

export default function Roles() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("id") ?? null;
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
  const rolesAndCompaniesPerPage = 10;

  const rolesAndCompanies = api.roleAndCompany.list.useQuery({
    sortBy: selectedFilter,
    search: searchValue,
    limit: rolesAndCompaniesPerPage,
    offset: (currentPage - 1) * rolesAndCompaniesPerPage,
    type: selectedType,
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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchValue, selectedType]);

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
  }, [resolvedSelection]);

  const selectedCompany = useMemo(() => {
    if (!resolvedSelection) return null;
    return !isRole(resolvedSelection)
      ? (resolvedSelection as CompanyType)
      : null;
  }, [resolvedSelection]);

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
      <div className="bg-cooper-cream-100 border-cooper-gray-150 fixed z-20 w-full self-start border-b-[1px]">
        <div className="flex min-h-[70px] items-center justify-between px-5 py-3">
          <SearchFilter className="w-full md:w-[28%]" />
          {compare.isCompareMode && selectedRole && (
            <div className="hidden items-center gap-2 md:flex">
              <CompareControls anchorRoleId={selectedRole.id} inTopBar />
            </div>
          )}
        </div>
      </div>
      {rolesAndCompanies.isSuccess &&
        rolesAndCompanies.data.items.length > 0 && (
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
              {rolesAndCompanies.data.items.map((item, i) => {
                if (item.type === "role") {
                  const roleItem = item as RoleType;
                  const isAlreadyCompared = isRoleAlreadyCompared(roleItem.id);
                  return (
                    <div
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
                          className="hover:bg-cooper-gray-50 absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-cooper-gray-300 bg-white text-xl text-cooper-gray-400 transition hover:border-cooper-gray-400"
                          onClick={(event) => {
                            event.stopPropagation();
                            compare.enterCompareMode();
                            compare.addRoleId(roleItem.id);
                          }}
                        >
                          +
                        </button>
                      )}
                      <RoleCardPreview
                        roleObj={roleItem}
                        showDragHandle={
                          compare.isCompareMode && !isAlreadyCompared
                        }
                        showFavorite={!compare.isCompareMode}
                        className={cn(
                          "hover:bg-cooper-gray-100",
                          selectedItem
                            ? selectedItem.id === roleItem.id &&
                                "bg-cooper-cream-200 hover:bg-cooper-gray-200"
                            : !i &&
                                "bg-cooper-cream-200 hover:bg-cooper-gray-200",
                        )}
                      />
                    </div>
                  );
                }

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
