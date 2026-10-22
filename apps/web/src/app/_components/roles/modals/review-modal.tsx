"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@cooper/ui";
import { Popover, PopoverAnchor, PopoverContent } from "@cooper/ui/popover";
import { Status } from "@cooper/db/schema";
import type { CompanyType, ReviewType } from "@cooper/db/schema";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { averageOfRoleAverages } from "~/utils/ratingHelpers";
import { calculateRatings } from "~/utils/reviewCountByStars";
import { SortDropdown } from "../../filters/sort-dropdown";
import DropdownFilter, {
  FilterPanelContent,
} from "../../filters/dropdown-filter";
import type { CompareSize } from "../../compare/compare-context";
import {
  CompareSection,
  CompareSectionTitle,
} from "../../compare/compare-section";
import { jobTypeOptions } from "../../onboarding/constants";
import { RatingSummary } from "../../shared/rating-summary";
import StarGraph from "../../shared/star-graph";
import ModalContainer from "../../reviews/modal";
import { ReviewCard } from "../../reviews/review-card";

const REVIEW_SORT_OPTIONS = [
  { value: "most recent", label: "Most recent" },
  { value: "highest rating", label: "Highest rating" },
  { value: "lowest rating", label: "Lowest rating" },
] as const satisfies { value: string; label: string }[];

interface ReviewModalProps {
  // Reviews for one job, or with `company` for every job at that company
  roleId?: string;
  company?: CompanyType;
  isComparing: boolean;
  compareSize?: CompareSize;
}

export function ReviewModal({
  roleId,
  company,
  isComparing,
  compareSize,
}: ReviewModalProps) {
  const [ratingFilter, setRatingFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [jobTypeFilter, setJobTypeFilter] = useState<string[]>([]);
  // Company page only: which jobs' reviews to show
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [openFilterKey, setOpenFilterKey] = useState<
    "rating" | "location" | "jobType" | "role" | null
  >(null);
  const [selectedFilter, setSelectedFilter] = useState<
    "most recent" | "highest rating" | "lowest rating" | undefined
  >("most recent");

  const roleReviews = api.review.getByRole.useQuery(
    { id: roleId ?? "" },
    { enabled: !company },
  );
  const companyReviews = api.review.getByCompany.useQuery(
    { id: company?.id ?? "" },
    { enabled: !!company },
  );
  const reviews = company ? companyReviews : roleReviews;
  const averages = api.role.getAverageById.useQuery(
    { roleId: roleId ?? "" },
    { enabled: !company },
  );
  // Company reviews link back to the job each came from
  const companyRoles = api.role.getByCompany.useQuery(
    { companyId: company?.id ?? "", onlyWithReviews: true },
    { enabled: !!company },
  );
  const rolesById = useMemo(
    () => new Map((companyRoles.data ?? []).map((role) => [role.id, role])),
    [companyRoles.data],
  );

  const companyAverageRating = useMemo(
    () => averageOfRoleAverages(companyReviews.data ?? []),
    [companyReviews.data],
  );
  const averageOverallRating = company
    ? companyAverageRating
    : (averages.data?.averageOverallRating ?? 0);

  const { data: profile } = api.profile.getCurrentUser.useQuery();
  const profileId = profile?.id;
  const usersReviews = api.review.getByProfile.useQuery(
    { id: profileId ?? "" },
    { enabled: !!profileId },
  );
  const publishedUserReviewCount = useMemo(
    () =>
      (usersReviews.data ?? []).filter((r) => r.status === Status.PUBLISHED)
        .length,
    [usersReviews.data],
  );

  const roleLocationIds = useMemo(
    () =>
      Array.from(
        new Set(
          (reviews.data ?? [])
            .map((r) => r.locationId)
            .filter((id): id is string => !!id),
        ),
      ),
    [reviews.data],
  );
  const roleLocationQueries = api.useQueries((t) =>
    roleLocationIds.map((id) => t.location.getById({ id }, { enabled: !!id })),
  );
  // Only locations and job types that appear in these reviews
  const locationOptions = useMemo(
    () =>
      roleLocationQueries
        .map((q) => q.data)
        .filter((d): d is NonNullable<typeof d> => !!d)
        .map((loc) => ({ id: loc.id, label: prettyLocationName(loc) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [roleLocationQueries],
  );

  const jobTypeOptionsWithId = useMemo(() => {
    const reviewJobTypes = new Set((reviews.data ?? []).map((r) => r.jobType));
    return jobTypeOptions
      .filter(
        (j) =>
          reviewJobTypes.has(j.value) ||
          (j.label === "Co-op" && reviewJobTypes.has("CO-OP")) ||
          (j.label === "Internship" && reviewJobTypes.has("INTERNSHIP")),
      )
      .map((j) => ({
        id: j.label,
        label: j.label,
        value: j.value,
      }));
  }, [reviews.data]);

  const filteredReviews = reviews.data?.filter((review) => {
    const ratingMatch =
      ratingFilter.length === 0 ||
      (() => {
        const r = Math.round(review.overallRating ?? 0);
        const min = Math.min(...ratingFilter.map(Number));
        const max = Math.max(...ratingFilter.map(Number));
        return r >= min && r <= max;
      })();
    const locationMatch =
      locationFilter.length === 0 ||
      (!!review.locationId && locationFilter.includes(review.locationId));
    const jobTypeMatch =
      jobTypeFilter.length === 0 ||
      (!!review.jobType && jobTypeFilter.includes(review.jobType)) ||
      (review.jobType === "CO-OP" && jobTypeFilter.includes("Co-op")) ||
      (review.jobType === "INTERNSHIP" &&
        jobTypeFilter.includes("Internship"));
    const roleMatch =
      roleFilter.length === 0 ||
      (!!review.roleId && roleFilter.includes(review.roleId));
    return ratingMatch && locationMatch && jobTypeMatch && roleMatch;
  });

  const sortedReviews = useMemo(() => {
    if (!filteredReviews) return undefined;
    const list = [...filteredReviews];
    switch (selectedFilter) {
      case "highest rating":
        return list.sort(
          (a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0),
        );
      case "lowest rating":
        return list.sort(
          (a, b) => (a.overallRating ?? 0) - (b.overallRating ?? 0),
        );
      case "most recent":
      default: {
        const termOrder: Record<string, number> = {
          SPRING: 1,
          SUMMER: 2,
          FALL: 3,
        };
        return list.sort((a, b) => {
          const yearDiff = (b.workYear ?? 0) - (a.workYear ?? 0);
          if (yearDiff !== 0) return yearDiff;
          return (
            (termOrder[b.workTerm ?? 0] ?? 0) -
            (termOrder[a.workTerm ?? 0] ?? 0)
          );
        });
      }
    }
  }, [filteredReviews, selectedFilter]);

  const ratings = calculateRatings(reviews.data ?? []);

  const roleOptions = useMemo(
    () =>
      (companyRoles.data ?? []).map((role) => ({
        id: role.id,
        label: role.title,
      })),
    [companyRoles.data],
  );

  const setFilterOpen = (key: "rating" | "location" | "jobType" | "role") => {
    setOpenFilterKey((prev) => (prev === key ? null : key));
  };
  const wrapAnchor = (
    key: "rating" | "location" | "jobType" | "role",
    node: ReactNode,
  ) =>
    openFilterKey === key ? (
      <PopoverAnchor asChild key={key}>
        {node}
      </PopoverAnchor>
    ) : (
      node
    );

  if (compareSize) {
    // Single grid row; see COMPARE_ROWS.reviews
    return (
      <CompareSection
        section="reviews"
        className={cn(compareSize === "sm" && "px-5 py-4")}
      >
        <div>
          <CompareSectionTitle>Overall rating</CompareSectionTitle>
          {reviews.isSuccess && reviews.data.length > 0 ? (
            <RatingSummary
              ratings={ratings}
              averageRating={averageOverallRating}
              reviewCount={reviews.data.length}
              caption={`${reviews.data.length} ${reviews.data.length === 1 ? "review" : "reviews"}`}
              className={cn(
                compareSize === "sm" && "flex-col gap-5",
                compareSize === "md" && "justify-between gap-5",
                compareSize === "lg" && "gap-10",
              )}
            />
          ) : (
            reviews.isSuccess && (
              <p className="text-[14px] leading-normal text-cooper-gray-400">
                No reviews yet
              </p>
            )
          )}
        </div>
      </CompareSection>
    );
  }

  return (
    <ModalContainer
      title={
        company ? (
          <>
            Reviews for roles at{" "}
            <span className="font-semibold">{company.name}</span>
          </>
        ) : (
          "Reviews"
        )
      }
    >
      {reviews.isSuccess && reviews.data.length === 0 && (
        <div className="flex h-full w-full flex-col items-center justify-center text-cooper-gray-400">
          <p>No reviews yet</p>
          {usersReviews.isSuccess && publishedUserReviewCount < 5 && (
            <Link href="/review-form" className="ml-2 underline">
              Add one!
            </Link>
          )}
        </div>
      )}
      {reviews.isSuccess && reviews.data.length > 0 && (
        <div className="flex h-full flex-col gap-5">
          <div className={cn(isComparing ? "w-full" : "md:w-fit md:max-w-full")}>
            <StarGraph
              ratings={ratings}
              averageOverallRating={averageOverallRating}
              reviews={reviews.data.length}
              isComparing={isComparing}
            />
          </div>

          <div
            className={cn(
              "mb-2 flex flex-wrap items-center gap-2",
              !isComparing && "md:pt-6",
            )}
          >
            <Popover
              open={openFilterKey !== null}
              onOpenChange={(open) => !open && setOpenFilterKey(null)}
            >
              {wrapAnchor(
                "rating",
                <DropdownFilter
                  key="rating"
                  title="Overall rating"
                  filterType="rating"
                  options={[]}
                  selectedOptions={ratingFilter}
                  onSelectionChange={(selected) => setRatingFilter(selected)}
                  triggerOnly
                  open={openFilterKey === "rating"}
                  onTriggerClick={() => setFilterOpen("rating")}
                />,
              )}
              {wrapAnchor(
                "location",
                <DropdownFilter
                  key="location"
                  title="Location"
                  filterType="checkbox"
                  options={locationOptions}
                  selectedOptions={locationFilter}
                  onSelectionChange={(selected) => setLocationFilter(selected)}
                  triggerOnly
                  open={openFilterKey === "location"}
                  onTriggerClick={() => setFilterOpen("location")}
                />,
              )}
              {wrapAnchor(
                "jobType",
                <DropdownFilter
                  key="jobType"
                  title="Job type"
                  filterType="checkbox"
                  options={jobTypeOptionsWithId}
                  selectedOptions={jobTypeFilter}
                  onSelectionChange={(selected) => setJobTypeFilter(selected)}
                  triggerOnly
                  open={openFilterKey === "jobType"}
                  onTriggerClick={() => setFilterOpen("jobType")}
                />,
              )}
              {company &&
                wrapAnchor(
                  "role",
                  <DropdownFilter
                    key="role"
                    title="Role"
                    filterType="checkbox"
                    options={roleOptions}
                    selectedOptions={roleFilter}
                    onSelectionChange={(selected) => setRoleFilter(selected)}
                    triggerOnly
                    open={openFilterKey === "role"}
                    onTriggerClick={() => setFilterOpen("role")}
                  />,
                )}
              <PopoverContent
                align="start"
                className="border-0 bg-transparent p-0 shadow-none"
              >
                {openFilterKey === "rating" && (
                  <FilterPanelContent
                    variant="menu"
                    title="Overall rating"
                    filterType="rating"
                    options={[]}
                    selectedOptions={ratingFilter}
                    onSelectionChange={(selected) => setRatingFilter(selected)}
                    onClose={() => setOpenFilterKey(null)}
                  />
                )}
                {openFilterKey === "location" && (
                  <FilterPanelContent
                    variant="menu"
                    title="Location"
                    filterType="checkbox"
                    options={locationOptions}
                    selectedOptions={locationFilter}
                    onSelectionChange={(selected) =>
                      setLocationFilter(selected)
                    }
                    onClose={() => setOpenFilterKey(null)}
                    searchable={false}
                  />
                )}
                {openFilterKey === "jobType" && (
                  <FilterPanelContent
                    variant="menu"
                    title="Job type"
                    filterType="checkbox"
                    options={jobTypeOptionsWithId}
                    selectedOptions={jobTypeFilter}
                    onSelectionChange={(selected) => setJobTypeFilter(selected)}
                    onClose={() => setOpenFilterKey(null)}
                    searchable={false}
                  />
                )}
                {openFilterKey === "role" && (
                  <FilterPanelContent
                    variant="menu"
                    title="Role"
                    filterType="checkbox"
                    options={roleOptions}
                    selectedOptions={roleFilter}
                    onSelectionChange={(selected) => setRoleFilter(selected)}
                    onClose={() => setOpenFilterKey(null)}
                  />
                )}
              </PopoverContent>
            </Popover>
            <SortDropdown
              options={REVIEW_SORT_OPTIONS}
              value={selectedFilter}
              onChange={setSelectedFilter}
              className="ml-2"
            />
          </div>

          {sortedReviews && sortedReviews.length > 0 ? (
            <div className="flex flex-col divide-y divide-cooper-gray-150">
              {sortedReviews.map((review: ReviewType) => {
                const role =
                  company && review.roleId
                    ? rolesById.get(review.roleId)
                    : null;
                return (
                  <ReviewCard
                    reviewObj={review}
                    key={review.id}
                    isComparing={isComparing}
                    roleLink={
                      role && company
                        ? {
                            title: role.title,
                            href: `/roles/?company=${company.slug}&type=roles&role=${role.slug}`,
                          }
                        : undefined
                    }
                    className="py-5 first:pt-0 last:pb-0"
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-cooper-gray-400">
              {locationFilter.length > 0 ||
              jobTypeFilter.length > 0 ||
              ratingFilter.length > 0 ||
              roleFilter.length > 0
                ? "No reviews found matching your filter criteria."
                : "No reviews found for this rating."}
            </div>
          )}
        </div>
      )}
    </ModalContainer>
  );
}
