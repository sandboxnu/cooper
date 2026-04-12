"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";
import { Popover, PopoverAnchor, PopoverContent } from "@cooper/ui/popover";
import { Status } from "@cooper/db/schema";
import type { ReviewType } from "@cooper/db/schema";
import { ChevronDown } from "lucide-react";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { calculateRatings } from "~/utils/reviewCountByStars";
import DropdownFilter, {
  FilterPanelContent,
} from "../../filters/dropdown-filter";
import { jobTypeOptions } from "../../onboarding/constants";
import StarGraph from "../../shared/star-graph";
import ModalContainer from "../../reviews/modal";
import { ReviewCard } from "../../reviews/review-card";

interface ReviewModalProps {
  roleId: string;
  isComparing: boolean;
}

export function ReviewModal({ roleId, isComparing }: ReviewModalProps) {
  const [ratingFilter, setRatingFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [locationPrefix, setLocationPrefix] = useState("");
  const [openFilterKey, setOpenFilterKey] = useState<
    "rating" | "location" | "jobType" | null
  >(null);
  const [selectedFilter, setSelectedFilter] = useState<
    "most recent" | "highest rating" | "lowest rating" | undefined
  >("most recent");

  useEffect(() => {
    setLocationPrefix(locationSearchTerm.slice(0, 3));
  }, [locationSearchTerm]);

  const reviews = api.review.getByRole.useQuery({ id: roleId });
  const averages = api.role.getAverageById.useQuery({ roleId });

  const avgs = api.review.list
    .useQuery({})
    .data?.map((review) => review.overallRating ?? 0);
  const cooperAvg =
    Math.round(
      ((avgs ?? []).reduce((a, b) => a + b, 0) / (avgs?.length ?? 1)) * 10,
    ) / 10;

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
  const locationsToUpdate = api.location.getByPopularity.useQuery(
    { prefix: locationPrefix },
    {
      enabled: locationSearchTerm.length >= 3 && locationPrefix.length >= 3,
    },
  );
  const locationOptions = useMemo(() => {
    const fromRole = roleLocationQueries
      .map((q) => q.data)
      .filter((d): d is NonNullable<typeof d> => !!d)
      .map((loc) => ({ id: loc.id, label: prettyLocationName(loc) }));
    const fromSearch =
      locationsToUpdate.data?.map((loc) => ({
        id: loc.id,
        label: prettyLocationName(loc),
      })) ?? [];
    const byId = new Map<string, { id: string; label: string }>();
    for (const o of fromRole) byId.set(o.id, o);
    for (const o of fromSearch) byId.set(o.id, o);
    return [...Array.from(byId.values())];
  }, [roleLocationQueries, locationsToUpdate.data]);

  const jobTypeOptionsWithId = useMemo(
    () =>
      jobTypeOptions.map((j) => ({
        id: j.label,
        label: j.label,
        value: j.value,
      })),
    [],
  );

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
      jobTypeFilter === "all" ||
      review.jobType === jobTypeFilter ||
      (review.jobType === "CO-OP" && jobTypeFilter === "Co-op") ||
      (review.jobType === "INTERNSHIP" && jobTypeFilter === "Internship");
    return ratingMatch && locationMatch && jobTypeMatch;
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

  const setFilterOpen = (key: "rating" | "location" | "jobType") => {
    setOpenFilterKey((prev) => (prev === key ? null : key));
  };
  const wrapAnchor = (
    key: "rating" | "location" | "jobType",
    node: ReactNode,
  ) =>
    openFilterKey === key ? (
      <PopoverAnchor asChild key={key}>
        {node}
      </PopoverAnchor>
    ) : (
      node
    );

  const buttonStyle =
    "bg-white hover:bg-cooper-gray-200 border-white text-cooper-gray-400 p-2";

  return (
    <ModalContainer title="Reviews">
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
          <div className={cn(isComparing ? "w-full" : "md:w-[44%]")}>
            <StarGraph
              ratings={ratings}
              averageOverallRating={averages.data?.averageOverallRating ?? 0}
              reviews={reviews.data.length}
              cooperAvg={cooperAvg}
              isComparing={isComparing}
            />
          </div>

          <div
            className={cn(
              "flex flex-wrap items-center gap-3",
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
                  side="top"
                />,
              )}
              {wrapAnchor(
                "location",
                <DropdownFilter
                  key="location"
                  title="Location"
                  filterType="location"
                  options={locationOptions}
                  selectedOptions={locationFilter}
                  onSelectionChange={(selected) => setLocationFilter(selected)}
                  onSearchChange={(search) => setLocationSearchTerm(search)}
                  triggerOnly
                  open={openFilterKey === "location"}
                  onTriggerClick={() => setFilterOpen("location")}
                  side="top"
                />,
              )}
              {wrapAnchor(
                "jobType",
                <DropdownFilter
                  key="jobType"
                  title="Job type"
                  filterType="checkbox"
                  options={jobTypeOptionsWithId}
                  selectedOptions={
                    jobTypeFilter === "all" ? [] : [jobTypeFilter]
                  }
                  onSelectionChange={(selected) =>
                    setJobTypeFilter(selected[0] ?? "all")
                  }
                  triggerOnly
                  open={openFilterKey === "jobType"}
                  onTriggerClick={() => setFilterOpen("jobType")}
                  side="top"
                />,
              )}
              <PopoverContent
                align="start"
                side="top"
                className="border-0 bg-transparent p-0"
              >
                {openFilterKey === "rating" && (
                  <FilterPanelContent
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
                    title="Location"
                    filterType="location"
                    options={locationOptions}
                    selectedOptions={locationFilter}
                    onSelectionChange={(selected) =>
                      setLocationFilter(selected)
                    }
                    onSearchChange={(search) => setLocationSearchTerm(search)}
                    onClose={() => setOpenFilterKey(null)}
                    isInMenuContent
                  />
                )}
                {openFilterKey === "jobType" && (
                  <FilterPanelContent
                    title="Job type"
                    filterType="checkbox"
                    options={jobTypeOptionsWithId}
                    selectedOptions={
                      jobTypeFilter === "all" ? [] : [jobTypeFilter]
                    }
                    onSelectionChange={(selected) =>
                      setJobTypeFilter(selected[0] ?? "all")
                    }
                    onClose={() => setOpenFilterKey(null)}
                  />
                )}
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-md text-cooper-gray-400">
                Sort By:{" "}
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
                    onClick={() => setSelectedFilter("most recent")}
                  >
                    Most recent
                  </Button>
                  <Button
                    className={buttonStyle}
                    onClick={() => setSelectedFilter("highest rating")}
                  >
                    Highest rating
                  </Button>
                  <Button
                    className={buttonStyle}
                    onClick={() => setSelectedFilter("lowest rating")}
                  >
                    Lowest rating
                  </Button>
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {sortedReviews && sortedReviews.length > 0 ? (
            sortedReviews.map((review: ReviewType) => (
              <ReviewCard
                reviewObj={review}
                key={review.id}
                isComparing={isComparing}
              />
            ))
          ) : (
            <div className="py-8 text-center text-cooper-gray-400">
              {locationFilter.length > 0 ||
              jobTypeFilter ||
              ratingFilter.length > 0
                ? "No reviews found matching your filter criteria."
                : "No reviews found for this rating."}
            </div>
          )}
        </div>
      )}
    </ModalContainer>
  );
}
