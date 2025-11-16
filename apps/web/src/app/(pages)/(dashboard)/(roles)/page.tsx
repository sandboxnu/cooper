"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Chip } from "@cooper/ui/chip";

import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";
import { RoleInfo } from "~/app/_components/reviews/role-info";
import { api } from "~/trpc/react";
import { CompanyCardPreview } from "~/app/_components/companies/company-card-preview";
import CompanyInfo from "~/app/_components/companies/company-info";

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

  // Query for specific company or role based on URL params
  const companyBySlug = api.company.getBySlug.useQuery(
    { slug: companyParam ?? "" },
    { enabled: !!companyParam && !roleParam, retry: false, refetchOnWindowFocus: false },
  );

  const roleBySlug = api.role.getByCompanySlugAndRoleSlug.useQuery(
    { companySlug: companyParam ?? "", roleSlug: roleParam ?? "" },
    { enabled: !!companyParam && !!roleParam, retry: false, refetchOnWindowFocus: false },
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

  useEffect(() => {
    if (defaultItem) {
      setSelectedItem(defaultItem);
    }
  }, [defaultItem]);

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
  }, [selectedItem, router, companyParam, roleParam, isRole, rolesAndCompanies.isSuccess]);
  const [showRoleInfo, setShowRoleInfo] = useState(false); // State for toggling views on mobile

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
      {rolesAndCompanies.isSuccess &&
        rolesAndCompanies.data.items.length > 0 && (
          <div className="bg-cooper-cream-100 flex h-[81.5dvh] w-full lg:h-[90dvh]">
            {" "}
            {/* hardcoded sad face */}
            {/* RoleCardPreview List */}
            <div
              className={cn(
                "w-full overflow-y-auto border-r-[0.75px] border-t-[0.75px] border-cooper-gray-300 bg-cooper-cream-100 p-5 md:rounded-tr-lg xl:rounded-none",
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
