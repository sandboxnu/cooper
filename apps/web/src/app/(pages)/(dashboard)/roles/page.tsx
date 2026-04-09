"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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

import type { FilterState } from "~/app/_components/filters/types";
import { CompanyCardPreview } from "~/app/_components/companies/company-card-preview";
import CompanyInfo from "~/app/_components/companies/company-info";
import { useCompare } from "~/app/_components/compare/compare-context";
import {
  CompareColumns,
  CompareControls,
} from "~/app/_components/compare/compare-ui";
import DropdownFiltersBar from "~/app/_components/filters/dropdown-filters-bar";
import RoleTypeSelector from "~/app/_components/filters/role-type-selector";
import SidebarFilter from "~/app/_components/filters/sidebar-filter";
import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleCardPreview } from "~/app/_components/roles/role-card-preview";
import { RoleInfo } from "~/app/_components/roles/role-info";
import SearchFilter from "~/app/_components/search/search-filter";
import { api } from "~/trpc/react";

// Helper function to create URL-friendly slugs (still needed for URL generation)
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove all non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
};

const isSelectedType = (
  value: string | null,
): value is "roles" | "companies" | "all" =>
  value === "roles" || value === "companies" || value === "all";

const getCompanySlug = (companySlug?: string, companyName?: string): string => {
  return companySlug ?? createSlug(companyName ?? "");
};

const buildRolesSearchParams = (
  currentSearch: string,
  companySlug: string,
  roleSlug?: string,
): URLSearchParams => {
  const params = new URLSearchParams(currentSearch);
  const preservedSearch = params.get("search");

  params.delete("search");
  params.set("company", companySlug);

  if (roleSlug) {
    params.set("role", roleSlug);
  } else {
    params.delete("role");
  }

  if (preservedSearch) {
    params.set("search", preservedSearch);
  }

  return params;
};

export default function Roles() {
  const searchParams = useSearchParams();
  const urlCompanyParam = searchParams.get("company") ?? null;
  const urlRoleParam = searchParams.get("role") ?? null;
  const searchValue = searchParams.get("search") ?? "";
  const router = useRouter();
  const compare = useCompare();
  const { exitCompareMode } = compare;
  const [companyParam, setCompanyParam] = useState(urlCompanyParam);
  const [roleParam, setRoleParam] = useState(urlRoleParam);
  const [currentAnchorRoleId, setCurrentAnchorRoleId] = useState<string | null>(
    null,
  );
  // Refs to track compare mode state across renders without causing re-renders
  const wasCompareModeRef = useRef(false);
  const shouldRestoreAnchorPageRef = useRef(false);
  const [pendingAnchorRestore, setPendingAnchorRestore] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const typeParam = searchParams.get("type");

  const [selectedType, setSelectedType] = useState<
    "roles" | "companies" | "all"
  >(() => {
    if (isSelectedType(typeParam)) {
      return typeParam;
    }
    return "all";
  });

  useEffect(() => {
    setCompanyParam(urlCompanyParam);
    setRoleParam(urlRoleParam);
  }, [urlCompanyParam, urlRoleParam]);

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
    workModels: [],
    overtimeWork: [],
    companyCulture: [],
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
    pageNumberQuery.isError; // Query failed, fall back to page 1.

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
      workModels:
        appliedFilters.workModels.length > 0
          ? appliedFilters.workModels
          : undefined,
      overtimeWork: appliedFilters.overtimeWork.length > 0 ? true : undefined,
      companyCulture:
        appliedFilters.companyCulture.length > 0
          ? appliedFilters.companyCulture
          : undefined,
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
      return rolesAndCompanies.data.items[0] ?? null;
    }

    return null;
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
    (RoleType | CompanyType) | null
  >(null);
  const [cachedAnchorRole, setCachedAnchorRole] = useState<AnchorRole | null>(
    null,
  );

  // Ref to store card refs for scrolling
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hasScrolledToItem = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultItem) {
      setSelectedItem((prev) =>
        prev?.id === defaultItem.id ? prev : defaultItem,
      );
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

  type AnchorRole = RoleType & {
    type: "role";
    companyName?: string;
    companySlug?: string;
  };

  const currentAnchorRolePageQuery = api.roleAndCompany.getPageNumber.useQuery(
    {
      itemId: currentAnchorRoleId ?? "",
      itemType: "role",
      sortBy: selectedFilter ?? "default",
      search: searchValue,
      type: selectedType,
      limit: rolesAndCompaniesPerPage,
    },
    {
      enabled: !!currentAnchorRoleId,
      retry: false,
      refetchOnWindowFocus: false,
    },
  );

  const currentAnchorRoleWithCompanyQuery =
    api.role.getByIdWithCompany.useQuery(
      { id: currentAnchorRoleId ?? "" },
      {
        enabled: !!currentAnchorRoleId,
        retry: false,
        refetchOnWindowFocus: false,
      },
    );

  const selectedRole = useMemo(() => {
    if (compare.isCompareMode) return null;

    if (!selectedItem) return null;
    return isRole(selectedItem) ? selectedItem : null;
  }, [compare.isCompareMode, selectedItem, isRole]);

  const compareAnchorRole = useMemo(() => {
    if (!compare.isCompareMode) return null;

    const anchorRoleId = compare.anchorRoleId ?? currentAnchorRoleId;

    const anchorRoleFromList =
      rolesAndCompanies.data?.items.find(
        (item) => item.type === "role" && item.id === anchorRoleId,
      ) ?? null;

    if (anchorRoleFromList) {
      return anchorRoleFromList as RoleType & {
        type: "role";
        slug?: string;
        companySlug?: string;
        companyName?: string;
      };
    }

    if (
      selectedItem &&
      isRole(selectedItem) &&
      selectedItem.id === anchorRoleId
    ) {
      return selectedItem;
    }

    if (
      cachedAnchorRole &&
      anchorRoleId &&
      cachedAnchorRole.id === anchorRoleId
    ) {
      return cachedAnchorRole;
    }

    return null;
  }, [
    compare.isCompareMode,
    compare.anchorRoleId,
    currentAnchorRoleId,
    rolesAndCompanies.data?.items,
    selectedItem,
    isRole,
    cachedAnchorRole,
  ]);

  const currentAnchorRoleFromSources = useMemo<AnchorRole | null>(() => {
    if (!currentAnchorRoleId) return null;

    const roleFromCurrentList =
      currentAnchorRoleWithCompanyQuery.data?.id === currentAnchorRoleId
        ? (currentAnchorRoleWithCompanyQuery.data as AnchorRole)
        : null;

    const roleFromSelectedItem =
      selectedItem &&
      isRole(selectedItem) &&
      selectedItem.id === currentAnchorRoleId
        ? (selectedItem as AnchorRole)
        : null;

    return roleFromCurrentList ?? roleFromSelectedItem;
  }, [
    currentAnchorRoleWithCompanyQuery.data,
    selectedItem,
    isRole,
    currentAnchorRoleId,
  ]);

  useEffect(() => {
    if (!compare.isCompareMode) {
      if (cachedAnchorRole !== null) {
        setCachedAnchorRole(null);
      }
      return;
    }

    if (currentAnchorRoleFromSources) {
      setCachedAnchorRole((prev) =>
        prev &&
        prev.id === currentAnchorRoleFromSources.id &&
        prev.slug === currentAnchorRoleFromSources.slug
          ? prev
          : currentAnchorRoleFromSources,
      );
    }
  }, [
    compare.isCompareMode,
    currentAnchorRoleId,
    currentAnchorRoleFromSources,
    cachedAnchorRole,
  ]);

  const selectedCompany = useMemo(() => {
    if (compare.isCompareMode) return null;
    if (!selectedItem) return null;
    return !isRole(selectedItem) ? (selectedItem as CompanyType) : null;
  }, [compare.isCompareMode, selectedItem, isRole]);

  useEffect(() => {
    if (!selectedRole && !selectedCompany && selectedItem !== null) {
      setSelectedItem(null);
    }
  }, [selectedRole, selectedCompany, selectedItem]);

  // Keep URL/page state tied to sidebar selection only when not comparing.
  // In compare mode, the anchor role can live on a different page and should
  // not force pagination or sidebar list selection.
  const urlSelectedItem = compare.isCompareMode ? null : selectedItem;

  useEffect(() => {
    if (compare.isCompareMode && compare.anchorRoleId) {
      setCurrentAnchorRoleId((prev) =>
        prev === compare.anchorRoleId ? prev : compare.anchorRoleId,
      );
    }
  }, [compare.isCompareMode, compare.anchorRoleId]);

  useEffect(() => {
    const wasCompareMode = wasCompareModeRef.current;
    if (wasCompareMode && !compare.isCompareMode) {
      setPendingAnchorRestore(true);
      shouldRestoreAnchorPageRef.current = true;
    }
    wasCompareModeRef.current = compare.isCompareMode;
  }, [compare.isCompareMode]);

  useEffect(() => {
    if (!shouldRestoreAnchorPageRef.current) return;
    if (compare.isCompareMode) return;
    if (!currentAnchorRolePageQuery.isSuccess) return;

    if (currentAnchorRolePageQuery.data.found) {
      setCurrentPage((prev) =>
        prev === currentAnchorRolePageQuery.data.page
          ? prev
          : currentAnchorRolePageQuery.data.page,
      );
    }

    shouldRestoreAnchorPageRef.current = false;
  }, [
    compare.isCompareMode,
    currentAnchorRolePageQuery.isSuccess,
    currentAnchorRolePageQuery.data,
  ]);
  useEffect(() => {
    if (!pendingAnchorRestore || !currentAnchorRoleId) return;

    const roleFromCurrentList =
      rolesAndCompanies.data?.items.find(
        (item) => item.type === "role" && item.id === currentAnchorRoleId,
      ) ?? null;

    const roleFromCached =
      cachedAnchorRole && cachedAnchorRole.id === currentAnchorRoleId
        ? cachedAnchorRole
        : null;

    const roleToRestore =
      (roleFromCurrentList as
        | (RoleType & {
            type: "role";
            slug?: string;
            companySlug?: string;
            companyName?: string;
          })
        | null) ?? roleFromCached;

    if (!roleToRestore) return;

    setSelectedItem((prev) =>
      prev?.id === roleToRestore.id ? prev : roleToRestore,
    );

    const roleSlug = roleToRestore.slug;
    const companySlug = getCompanySlug(
      roleToRestore.companySlug,
      roleToRestore.companyName,
    );

    if (roleSlug && companySlug) {
      const params = buildRolesSearchParams(
        window.location.search,
        companySlug,
        roleSlug,
      );

      params.set("type", selectedType);

      const nextSearch = params.toString();
      const currentSearchString = window.location.search.replace(/^\?/, "");
      if (nextSearch !== currentSearchString) {
        router.push(`/roles/?${nextSearch}`);
        const nextParams = new URLSearchParams(nextSearch);
        setCompanyParam(nextParams.get("company"));
        setRoleParam(nextParams.get("role"));
      }
    }

    setPendingAnchorRestore(false);
  }, [
    pendingAnchorRestore,
    currentAnchorRoleId,
    rolesAndCompanies.data?.items,
    cachedAnchorRole,
    selectedType,
    router,
  ]);

  useEffect(() => {
    // updates the URL when a role or company is changed
    // Don't update URL if query is still loading (prevents updating with stale data during page changes)
    if (compare.isCompareMode) return;

    if (urlSelectedItem && rolesAndCompanies.isSuccess) {
      const currentUrl = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );
      const urlCompany = currentUrl.get("company");
      const urlRole = currentUrl.get("role");
      // Don't overwrite URL if it has a role but selectedItem is a company (would clear role)
      if (urlRole && !isRole(urlSelectedItem)) return;
      // Skip URL update only when the URL already matches the selected item
      if (urlCompany && urlRole && isRole(urlSelectedItem)) {
        const r = urlSelectedItem as RoleType & {
          slug?: string;
          companySlug?: string;
          companyName?: string;
        };
        const itemCompanySlug = getCompanySlug(r.companySlug, r.companyName);
        if (r.slug === urlRole && itemCompanySlug === urlCompany) {
          return;
        }
      }

      if (isRole(urlSelectedItem)) {
        // For roles, use company and role parameters
        const roleItem = urlSelectedItem as RoleType & {
          companyName?: string;
          slug?: string;
          companySlug?: string;
        };
        const companySlug = getCompanySlug(
          roleItem.companySlug,
          roleItem.companyName,
        );
        const roleSlug = roleItem.slug;

        // Don't push if we don't have a valid role slug (would clear role param)
        if (!roleSlug) return;

        const params = buildRolesSearchParams(
          window.location.search,
          companySlug,
          roleSlug,
        );

        params.set("type", selectedType);

        router.push(`/roles/?${params.toString()}`);
      } else {
        // For companies, use the company parameter with the name
        const companyItem = urlSelectedItem as CompanyType & { slug?: string };
        const companySlug = companyItem.slug;

        const params = buildRolesSearchParams(
          window.location.search,
          companySlug,
        );
        params.set("type", selectedType);

        router.push(`/roles/?${params.toString()}`);
      }
    }
  }, [
    compare.isCompareMode,
    urlSelectedItem,
    router,
    companyParam,
    roleParam,
    isRole,
    selectedType,
    rolesAndCompanies.isSuccess,
  ]);
  const [showRoleInfo, setShowRoleInfo] = useState(false); // State for toggling views on mobile
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  // Reset compare mode when navigating away from page
  useEffect(() => {
    return () => {
      exitCompareMode();
    };
  }, [exitCompareMode]);

  // Reset to page 1 when filter, search, or type changes
  // Scroll to top + select first item when page changes (but not when coming from URL)
  useEffect(() => {
    if (
      rolesAndCompanies.isSuccess &&
      rolesAndCompanies.data.items.length > 0 &&
      !companyParam && // Only auto-select if no URL params
      !roleParam &&
      !pendingAnchorRestore
    ) {
      // Scroll sidebar to top
      if (sidebarRef.current) {
        sidebarRef.current.scrollTop = 0;
      }
      // Select first item on the new page
      const firstItem = rolesAndCompanies.data.items[0] ?? null;
      setSelectedItem(firstItem);
    }
  }, [
    currentPage,
    rolesAndCompanies.isSuccess,
    rolesAndCompanies.data?.items,
    companyParam,
    roleParam,
    pendingAnchorRestore,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Clear URL params when changing pages
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");

    // Build new URL with only search param if it exists
    if (searchParam) {
      router.push(`/roles/?search=${searchParam}`);
    } else {
      router.push("/roles");
    }
  };

  const handleFilterChange = (filters: FilterState) => {
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const isFiltering = useMemo(() => {
    return (
      appliedFilters.industries.length > 0 ||
      appliedFilters.locations.length > 0 ||
      appliedFilters.jobTypes.length > 0 ||
      appliedFilters.workModels.length > 0 ||
      appliedFilters.overtimeWork.length > 0 ||
      appliedFilters.companyCulture.length > 0
    );
  }, [appliedFilters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchValue, selectedType]);

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (isSelectedType(typeParam)) {
      setSelectedType(typeParam);
    }
  }, [searchParams]);

  const totalPages =
    rolesAndCompanies.data && "totalCount" in rolesAndCompanies.data
      ? Math.ceil(
          (selectedType === "roles"
            ? rolesAndCompanies.data.totalRolesCount
            : selectedType === "companies"
              ? rolesAndCompanies.data.totalCompanyCount
              : rolesAndCompanies.data.totalCount) / rolesAndCompaniesPerPage,
        )
      : 0;

  const sidebarListKey = useMemo(() => {
    const itemKey = (rolesAndCompanies.data?.items ?? [])
      .map((item) => `${item.type}-${item.id}`)
      .join("|");

    return [
      currentPage,
      selectedFilter ?? "default",
      selectedType,
      searchValue,
      itemKey,
    ].join("::");
  }, [
    rolesAndCompanies.data?.items,
    currentPage,
    selectedFilter,
    selectedType,
    searchValue,
  ]);

  const controlsAnchorRoleId = compare.isCompareMode
    ? (compare.anchorRoleId ?? currentAnchorRoleId)
    : (selectedRole?.id ?? null);

  // Helper to check if a role is already being compared
  const isRoleAlreadyCompared = (roleId: string) => {
    const anchorRoleId = compare.anchorRoleId ?? currentAnchorRoleId;
    return (
      (compare.isCompareMode && anchorRoleId === roleId) ||
      compare.comparedRoleIds.includes(roleId)
    );
  };

  const roleInfoScrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!compare.isCompareMode && selectedRole) {
      if (selectedItem?.id !== selectedRole.id) {
        setSelectedItem(selectedRole);
      }
      roleInfoScrollRef.current?.scrollTo({ top: 0 });
    }
  }, [compare.isCompareMode, selectedRole, selectedItem?.id]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="bg-cooper-cream-100 border-cooper-gray-150 sticky top-0 z-20 flex w-full flex-shrink-0 flex-col items-stretch gap-4 border-b-[1px] py-4 md:flex-row md:items-center md:gap-5">
        <div className="w-full px-5 md:w-[28%]">
          <SearchFilter className="w-full" />
        </div>
        <div className="no-scrollbar flex w-full flex-1 gap-2 overflow-x-auto px-5 md:pr-0">
          <div className="hidden md:block">
            <DropdownFiltersBar
              filters={appliedFilters}
              onFilterChange={handleFilterChange}
            />
          </div>
          <Button
            className={cn(
              "border-cooper-gray-150 flex h-9 items-center gap-[10px] whitespace-nowrap rounded-lg border px-[14px] py-2 text-sm font-normal text-cooper-gray-400 outline-none focus:outline-none focus-visible:ring-0",
              isFiltering
                ? "border-cooper-gray-600 bg-cooper-gray-700 hover:bg-cooper-gray-200"
                : "hover:bg-cooper-gray-150 bg-white",
            )}
            onClick={() => setIsSidebarOpen(true)}
          >
            <Image
              src="/svg/sidebarFilter.svg"
              width={16}
              height={16}
              alt="Sidebar filters icon"
            />
            Filters
          </Button>
        </div>
        {controlsAnchorRoleId && (
          <div className="hidden items-center gap-4 pr-5 md:flex">
            <span className="h-6 border rounded-lg border-[#D9D9D9]" />
            <CompareControls anchorRoleId={controlsAnchorRoleId} />
          </div>
        )}
      </div>
      {rolesAndCompanies.isSuccess &&
        rolesAndCompanies.data.items.length > 0 && (
          <div className="bg-cooper-cream-100 flex min-h-0 w-full flex-1">
            {/* RoleCardPreview List */}
            <div
              ref={sidebarRef}
              className={cn(
                "border-cooper-gray-150 bg-cooper-cream-100 no-scrollbar w-full overflow-y-auto border-r-[1px] p-5 xl:rounded-none",
                "md:w-[28%]", // Show as 28% width on md and above
                (showRoleInfo || showCompanyInfo) && "hidden md:block", // Hide on mobile if RoleInfo is visible
                compare.isCompareMode && "border-transparent",
              )}
            >
              <div key={sidebarListKey}>
                <div className="pb-2 text-right">
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
                  <RoleTypeSelector
                    onSelectedTypeChange={setSelectedType}
                    selectedType={selectedType}
                  />
                </div>
                {rolesAndCompanies.data.items.map((item, i) => {
                  if (item.type === "role") {
                    const roleItem = item as RoleType;
                    const isAlreadyCompared = isRoleAlreadyCompared(
                      roleItem.id,
                    );
                    return (
                      <div
                        ref={(el) => {
                          cardRefs.current[item.id] = el;
                        }}
                        key={`role-${roleItem.id}`}
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
                          if (isAlreadyCompared) return;
                          setSelectedItem(roleItem);
                          setShowRoleInfo(true); // Show RoleInfo on mobile
                        }}
                      >
                        <RoleCardPreview
                          roleObj={roleItem}
                          showDragHandle={
                            compare.isCompareMode && !isAlreadyCompared
                          }
                          showFavorite={!compare.isCompareMode}
                          className={cn(
                            !isAlreadyCompared && " hover:cursor-pointer",
                            compare.isCompareMode &&
                              isRoleAlreadyCompared(item.id) &&
                              "bg-cooper-gray-50",
                            !compare.isCompareMode &&
                              (selectedItem
                                ? selectedItem.id === item.id &&
                                  "bg-cooper-gray-50 "
                                : !i && "bg-cooper-gray-50 "),
                          )}
                          isAlreadyCompared={isAlreadyCompared}
                          currentlySelectedRoleId={selectedRole?.id ?? null}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={`company-${item.id}`}
                        ref={(el) => {
                          cardRefs.current[item.id] = el;
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedItem(item);
                          setShowCompanyInfo(true);
                        }}
                      >
                        <CompanyCardPreview
                          companyObj={item}
                          className={cn(
                            "mb-4 hover:bg-cooper-gray-200 hover:cursor-pointer",
                            selectedItem
                              ? selectedItem.id === item.id &&
                                  "bg-cooper-gray-50"
                              : !i && "bg-cooper-gray-50",
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
            </div>
            <div
              ref={roleInfoScrollRef}
              className={cn(
                "no-scrollbar col-span-3 w-full overflow-y-auto p-1",
                "md:w-[72%]", // Show as 72% width on md and above
                !showRoleInfo && !showCompanyInfo && "hidden md:block", // Hide on mobile if RoleCardPreview is visible
              )}
            >
              {compare.isCompareMode ? (
                compareAnchorRole ? (
                  <CompareColumns anchorRole={compareAnchorRole} />
                ) : (
                  <LoadingResults className="h-[84dvh]" />
                )
              ) : selectedRole ? (
                <RoleInfo
                  roleObj={selectedRole}
                  onBack={() => setShowRoleInfo(false)}
                />
              ) : (
                selectedCompany && (
                  <CompanyInfo
                    companyObj={selectedCompany}
                    onBack={() => setShowCompanyInfo(false)}
                  />
                )
              )}
            </div>
          </div>
        )}
      {rolesAndCompanies.isSuccess &&
        rolesAndCompanies.data.items.length === 0 && (
          <NoResults className="h-[84dvh]" />
        )}
      {rolesAndCompanies.isPending && <LoadingResults className="h-[84dvh]" />}

      <SidebarFilter
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        filters={appliedFilters}
        onFilterChange={handleFilterChange}
        selectedType={selectedType}
        onSelectedTypeChange={setSelectedType}
      />
    </div>
  );
}
