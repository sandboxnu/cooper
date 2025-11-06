"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import type { CompanyType, RoleType } from "@cooper/db/schema";
import { cn, Pagination } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";

import { CompanyCardPreview } from "~/app/_components/companies/company-card-preview";
import CompanyInfo from "~/app/_components/companies/company-info";
import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";
import { RoleInfo } from "~/app/_components/reviews/role-info";
import { api } from "~/trpc/react";

export default function Roles() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("id") ?? null;
  const searchValue = searchParams.get("search") ?? ""; // Get search query from URL
  const router = useRouter();

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

  const totalPages =
    rolesAndCompanies.data &&
    "totalCount" in rolesAndCompanies.data &&
    rolesAndCompanies.data.totalCount
      ? Math.ceil(rolesAndCompanies.data.totalCount / rolesAndCompaniesPerPage)
      : 0;

  return (
    <>
      {rolesAndCompanies.isSuccess &&
        rolesAndCompanies.data.items.length > 0 && (
          <div className="bg-cooper-cream-100 flex h-[81.5dvh] w-full lg:h-[90dvh]">
            {" "}
            {/* hardcoded sad face */}
            {/* RoleCardPreview List */}
            <div
              ref={sidebarRef}
              className={cn(
                "bg-cooper-cream-100 w-full overflow-y-auto border-r-[0.75px] border-t-[0.75px] border-cooper-gray-300 p-5 md:rounded-tr-lg xl:rounded-none",
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
              </div>
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
                            : !i &&
                                "bg-cooper-gray-200 hover:bg-cooper-gray-200",
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
              {rolesAndCompanies.data.items.length > 0 &&
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
                    />{" "}
                  </div>
                ))}
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
