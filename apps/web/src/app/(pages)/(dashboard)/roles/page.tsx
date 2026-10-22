"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import type { CompanyType, RoleType } from "@cooper/db/schema";
import { cn, Pagination } from "@cooper/ui";
import { Button } from "@cooper/ui/button";

import type { FilterState } from "~/app/_components/filters/types";
import { CompanyCardPreview } from "~/app/_components/companies/company-card-preview";
import { CompanyPopup } from "~/app/_components/companies/company-popup";
import CompanyInfo from "~/app/_components/companies/company-info";
import { useCompare } from "~/app/_components/compare/compare-context";
import {
  CompareColumns,
  CompareControls,
  getCompareColumnsMinWidth,
} from "~/app/_components/compare/compare-ui";
import DropdownFiltersBar from "~/app/_components/filters/dropdown-filters-bar";
import RoleTypeSelector from "~/app/_components/filters/role-type-selector";
import SidebarFilter from "~/app/_components/filters/sidebar-filter";
import { SortDropdown } from "~/app/_components/filters/sort-dropdown";
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

// Updates the URL for a selection change without a Next.js navigation (which
// refetches the page from the server); useSearchParams stays in sync with
// history.pushState
const pushRolesUrl = (search: string) => {
  window.history.pushState(null, "", `/roles/?${search}`);
};

const ROLE_SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "rating", label: "Rating" },
] as const satisfies { value: string; label: string }[];

// md:w-[360px] on the role card sidebar
const SIDEBAR_WIDTH = 360;

const EMPTY_FILTERS: FilterState = {
  industries: [],
  locations: [],
  jobTypes: [],
  hourlyPay: { min: 0, max: 0 },
  ratings: [],
  workModels: [],
  overtimeWork: [],
  workHours: { min: 0, max: 0 },
  federalHolidays: [],
  transportation: [],
  drugTest: [],
  benefits: [],
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
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(EMPTY_FILTERS);
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
    // The on-the-job checkboxes all go to the API as one list of option ids
    const onTheJobFilters = [
      ...appliedFilters.federalHolidays,
      ...appliedFilters.transportation,
      ...appliedFilters.drugTest,
      ...appliedFilters.benefits,
    ];
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
      minHours:
        appliedFilters.workHours.min > 0
          ? appliedFilters.workHours.min
          : undefined,
      maxHours:
        appliedFilters.workHours.max > 0
          ? appliedFilters.workHours.max
          : undefined,
      onTheJob: onTheJobFilters.length > 0 ? onTheJobFilters : undefined,
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
      // Keep showing the current results while a filter, page or type change
      // loads, instead of blanking the list and job panel
      placeholderData: (previousData) => previousData,
    },
  );

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
        ? currentAnchorRoleWithCompanyQuery.data
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
        prev?.id === currentAnchorRoleFromSources.id &&
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
      cachedAnchorRole?.id === currentAnchorRoleId ? cachedAnchorRole : null;

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
        pushRolesUrl(nextSearch);
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

  // The URL this effect last pushed or confirmed, to tell a URL change made
  // elsewhere apart from a selection change made here
  const lastSyncedSearchRef = useRef<string | null>(null);
  useEffect(() => {
    // updates the URL when a role or company is changed
    // Don't update URL if query is still loading (prevents updating with stale data during page changes)
    if (compare.isCompareMode) return;

    if (urlSelectedItem && rolesAndCompanies.isSuccess) {
      const search = window.location.search;
      const currentUrl = new URLSearchParams(search);
      const urlCompany = currentUrl.get("company");
      const urlRole = currentUrl.get("role");

      const selectionMatchesUrlRole = (() => {
        if (!isRole(urlSelectedItem)) return false;
        const r = urlSelectedItem as RoleType & {
          slug?: string;
          companySlug?: string;
          companyName?: string;
        };
        return (
          r.slug === urlRole &&
          getCompanySlug(r.companySlug, r.companyName) === urlCompany
        );
      })();

      const selectionMatchesUrlCompany =
        !urlRole &&
        !isRole(urlSelectedItem) &&
        (urlSelectedItem as CompanyType).slug === urlCompany;

      // Skip URL update only when the URL already matches the selected item
      if (
        urlCompany &&
        (urlRole ? selectionMatchesUrlRole : selectionMatchesUrlCompany)
      ) {
        lastSyncedSearchRef.current = search;
        return;
      }

      // The URL changed from somewhere other than this effect (a role card on
      // the company page, the company popup's "See full details") and the
      // selection hasn't caught up yet: wait for it rather than pushing the
      // old selection back over the new URL. Stops waiting if what the URL
      // points at turns out not to exist.
      const urlChangedElsewhere =
        lastSyncedSearchRef.current !== null &&
        search !== lastSyncedSearchRef.current;
      const urlRoleMissing =
        roleBySlug.isError || (roleBySlug.isSuccess && !roleBySlug.data);
      const urlCompanyMissing =
        companyBySlug.isError ||
        (companyBySlug.isSuccess && !companyBySlug.data);
      if (urlChangedElsewhere && urlRole && !urlRoleMissing) return;
      if (urlChangedElsewhere && !urlRole && urlCompany && !urlCompanyMissing)
        return;

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

        lastSyncedSearchRef.current = `?${params.toString()}`;
        pushRolesUrl(params.toString());
      } else {
        // For companies, use the company parameter with the name
        const companyItem = urlSelectedItem as CompanyType & { slug?: string };
        const companySlug = companyItem.slug;

        const params = buildRolesSearchParams(
          window.location.search,
          companySlug,
        );
        params.set("type", selectedType);

        lastSyncedSearchRef.current = `?${params.toString()}`;
        pushRolesUrl(params.toString());
      }
    }
  }, [
    compare.isCompareMode,
    urlSelectedItem,
    router,
    isRole,
    selectedType,
    rolesAndCompanies.isSuccess,
    roleBySlug.isError,
    roleBySlug.isSuccess,
    roleBySlug.data,
    companyBySlug.isError,
    companyBySlug.isSuccess,
    companyBySlug.data,
  ]);
  const [showRoleInfo, setShowRoleInfo] = useState(false); // State for toggling views on mobile
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  // Reset compare mode when navigating away from page
  useEffect(() => {
    return () => {
      exitCompareMode();
    };
  }, [exitCompareMode]);

  // Below md only the search results show, so leave compare mode instead of
  // keeping it open out of sight
  const { isCompareMode } = compare;
  useEffect(() => {
    if (!isCompareMode) return;
    const belowMd = window.matchMedia("(max-width: 767px)");
    const exitIfBelowMd = () => {
      if (belowMd.matches) exitCompareMode();
    };
    exitIfBelowMd();
    belowMd.addEventListener("change", exitIfBelowMd);
    return () => belowMd.removeEventListener("change", exitIfBelowMd);
  }, [isCompareMode, exitCompareMode]);

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
      appliedFilters.federalHolidays.length > 0 ||
      appliedFilters.transportation.length > 0 ||
      appliedFilters.drugTest.length > 0 ||
      appliedFilters.benefits.length > 0
    );
  }, [appliedFilters]);

  // Any filter at all, including pay and rating, so Clear shows whenever it
  // would do something
  const hasAnyFilter =
    isFiltering ||
    appliedFilters.ratings.length > 0 ||
    appliedFilters.hourlyPay.min > 0 ||
    appliedFilters.hourlyPay.max > 0 ||
    appliedFilters.workHours.min > 0 ||
    appliedFilters.workHours.max > 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchValue, selectedType]);

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (isSelectedType(typeParam)) {
      setSelectedType(typeParam);
    }
  }, [searchParams]);

  const totalResults =
    rolesAndCompanies.data && "totalCount" in rolesAndCompanies.data
      ? selectedType === "roles"
        ? rolesAndCompanies.data.totalRolesCount
        : selectedType === "companies"
          ? rolesAndCompanies.data.totalCompanyCount
          : rolesAndCompanies.data.totalCount
      : 0;

  const totalPages = Math.ceil(totalResults / rolesAndCompaniesPerPage);

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

  // Hide the sidebar in compare mode when the cards (and drop slot) can't all
  // fit at their minimum width beside it
  const [contentRowWidth, setContentRowWidth] = useState(0);
  const contentRowObserverRef = useRef<ResizeObserver | null>(null);
  const contentRowRef = useCallback((el: HTMLDivElement | null) => {
    contentRowObserverRef.current?.disconnect();
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setContentRowWidth(entry.contentRect.width);
    });
    observer.observe(el);
    contentRowObserverRef.current = observer;
  }, []);
  const compareCardCount =
    1 +
    compare.comparedRoleIds.filter((id) => id !== compare.anchorRoleId).length;
  // Hide the sidebar when the compared cards don't fit beside it
  const hideSidebarForCompare =
    compare.isCompareMode &&
    contentRowWidth > 0 &&
    contentRowWidth - SIDEBAR_WIDTH <
      getCompareColumnsMinWidth(compareCardCount, false);
  // Only offer the drop slot when one more card would still fit beside the
  // sidebar (the list you drag from)
  const hasRoomForAnotherCard =
    compareCardCount < compare.maxColumns &&
    contentRowWidth - SIDEBAR_WIDTH >=
      getCompareColumnsMinWidth(compareCardCount + 1, false);
  // Compare needs room for two cards without the sidebar, and for one card
  // plus the drop slot beside it
  const canCompare =
    contentRowWidth > 0 &&
    contentRowWidth >= getCompareColumnsMinWidth(2, false) &&
    contentRowWidth - SIDEBAR_WIDTH >= getCompareColumnsMinWidth(1, true);

  const handleRoleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    role: RoleType,
  ) => {
    if (!compare.isCompareMode) return;
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/role-id", role.id);
    event.dataTransfer.setData("text/plain", role.id);
    // Drag a copy of the job card, held where the cursor grabbed it. The copy
    // is clipped to rounded corners, since the browser snapshots a rectangle
    // and would otherwise include what's behind the card's corners.
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const preview = card.cloneNode(true) as HTMLElement;
    // The card is hovered while dragging; leave its add button off the copy
    preview
      .querySelectorAll('[aria-label="Add to comparison"]')
      .forEach((button) => button.remove());
    Object.assign(preview.style, {
      position: "fixed",
      top: "-10000px",
      left: "-10000px",
      width: `${rect.width}px`,
      margin: "0",
      borderRadius: "8px",
      overflow: "hidden",
      pointerEvents: "none",
    });
    document.body.appendChild(preview);
    event.dataTransfer.setDragImage(
      preview,
      event.clientX - rect.left,
      event.clientY - rect.top,
    );
    requestAnimationFrame(() => {
      preview.remove();
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

  const showCompareControls =
    !!controlsAnchorRoleId && (compare.isCompareMode || canCompare);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="bg-cooper-cream-100 border-cooper-gray-150 sticky top-0 z-20 flex w-full flex-shrink-0 flex-col items-stretch gap-4 border-b-[1px] py-4 md:flex-row md:items-center md:gap-2 lg:gap-5">
        <div className="w-full px-5 md:w-[360px] md:flex-shrink-0 md:pr-0 lg:pr-5">
          <SearchFilter className="w-full" />
        </div>
        <div
          className={cn(
            // md: only the header's gap-2 (same as between filters) separates
            // the search box from the filters
            "no-scrollbar flex w-full flex-1 gap-2 overflow-x-auto px-5 md:pl-0 lg:pl-5",
            // Compare controls supply the right padding when they're shown
            showCompareControls && "md:pr-0",
          )}
        >
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
                : "hover:bg-[#F6F6F6] bg-white",
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
          {hasAnyFilter && (
            <button
              type="button"
              className="whitespace-nowrap px-2 text-sm text-cooper-gray-400 hover:text-cooper-gray-600"
              onClick={() => handleFilterChange(EMPTY_FILTERS)}
            >
              Clear
            </button>
          )}
        </div>
        {/* Hidden with its divider when there's no room to enter compare */}
        {showCompareControls && (
          // md:pl-3 keeps 20px before the divider despite the header's gap-2
          <div className="hidden items-center gap-4 pr-5 md:flex md:pl-3 lg:pl-0">
            <span className="h-6 border rounded-lg border-[#D9D9D9]" />
            <CompareControls
              anchorRoleId={controlsAnchorRoleId}
              canCompare={canCompare}
            />
          </div>
        )}
      </div>
      {rolesAndCompanies.isSuccess &&
        rolesAndCompanies.data.items.length > 0 && (
          <div
            ref={contentRowRef}
            className="bg-cooper-cream-100 flex min-h-0 w-full flex-1"
          >
            {/* RoleCardPreview List */}
            <div
              ref={sidebarRef}
              className={cn(
                // pb-7 + the last card's mb-2 leaves 36px below the results
                "border-cooper-gray-150 bg-cooper-cream-100 no-scrollbar w-full overflow-y-auto border-r-[1px] px-6 pb-7 pt-5 xl:rounded-none",
                "md:w-[360px] md:flex-shrink-0", // Fixed 360px width on md and above
                (showRoleInfo || showCompanyInfo) && "hidden md:block", // Hide on mobile if RoleInfo is visible
                hideSidebarForCompare && "md:hidden",
              )}
            >
              <div key={sidebarListKey}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm text-cooper-gray-400">
                    {totalResults}{" "}
                    {totalResults === 1 ? "result" : "results"}
                  </p>
                  <SortDropdown
                    options={ROLE_SORT_OPTIONS}
                    value={selectedFilter}
                    onChange={setSelectedFilter}
                  />
                </div>
                <div className="mb-2">
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
                          "relative mb-2 rounded-lg",
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
                        // Gap below on the wrapper, like job cards
                        className="mb-2"
                        ref={(el) => {
                          cardRefs.current[item.id] = el;
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          // While comparing, the card opens the company popup
                          // instead (companies can't be compared)
                          if (compare.isCompareMode) return;
                          setSelectedItem(item);
                          setShowCompanyInfo(true);
                        }}
                      >
                        {compare.isCompareMode ? (
                          <CompanyPopup
                            company={item}
                            trigger={
                              <div>
                                {/* Tinted and muted like compared job
                                    cards; companies can't be compared */}
                                <CompanyCardPreview
                                  companyObj={item}
                                  muted
                                  className="bg-cooper-gray-50 hover:cursor-pointer"
                                />
                              </div>
                            }
                          />
                        ) : (
                          <CompanyCardPreview
                            companyObj={item}
                            className={cn(
                              "hover:cursor-pointer",
                              selectedItem
                                ? selectedItem.id === item.id &&
                                    "bg-cooper-gray-50"
                                : !i && "bg-cooper-gray-50",
                            )}
                          />
                        )}
                      </div>
                    );
                  }
                })}

                {/* Pagination; no wrapper on one page so its margin doesn't
                    add space under the last card */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            </div>
            <div
              ref={roleInfoScrollRef}
              className={cn(
                // pb-4 + RoleInfo's pb-5 leaves 36px, matching the sidebar
                "no-scrollbar col-span-3 w-full overflow-y-auto p-1 pb-4",
                "md:w-auto md:min-w-0 md:flex-1", // Fill remaining width on md and above
                compare.isCompareMode && "pb-0", // Compare cards run to the bottom edge
                !showRoleInfo && !showCompanyInfo && "hidden md:block", // Hide on mobile if RoleCardPreview is visible
              )}
            >
              {compare.isCompareMode ? (
                compareAnchorRole ? (
                  <CompareColumns
                    anchorRole={compareAnchorRole}
                    canAddCards={
                      !hideSidebarForCompare && hasRoomForAnotherCard
                    }
                  />
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
