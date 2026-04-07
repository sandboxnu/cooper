import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@cooper/ui";
import { CardContent, CardHeader, CardTitle } from "@cooper/ui/card";
import Logo from "@cooper/ui/logo";
import { Popover, PopoverAnchor, PopoverContent } from "@cooper/ui/popover";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { calculateRatings } from "~/utils/reviewCountByStars";
import { CompanyPopup } from "../companies/company-popup";
import DropdownFilter, { FilterPanelContent } from "../filters/dropdown-filter";
import { jobTypeOptions } from "../onboarding/constants";
import StarGraph from "../shared/star-graph";
import BarGraph from "./bar-graph";
import { InterviewModal } from "./interview-modal";
import ModalContainer from "./modal";
import { ReviewCard } from "./review-card";
import RoundBarGraph from "./round-bar-graph";
import type { ReviewType, RoleType } from "@cooper/db/schema";
import { Status } from "@cooper/db/schema";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenu,
} from "@cooper/ui/dropdown-menu";
import { Button } from "@cooper/ui/button";
import { ChevronDown } from "lucide-react";
import { ReportButton } from "../shared/report-button";
import { CompanyCardPreview } from "../companies/company-card-preview";
import { FavoriteButton } from "../shared/favorite-button";
import { useCompare } from "../compare/compare-context";

interface RoleCardProps {
  className?: string;
  roleObj: RoleType;
  onBack?: () => void;
}

export function RoleInfo({ className, roleObj, onBack }: RoleCardProps) {
  const [ratingFilter, setRatingFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [locationPrefix, setLocationPrefix] = useState("");
  const [openFilterKey, setOpenFilterKey] = useState<
    "rating" | "location" | "jobType" | null
  >(null);
  const reviews = api.review.getByRole.useQuery({ id: roleObj.id });
  const compare = useCompare();

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

  useEffect(() => {
    const first = locationSearchTerm.slice(0, 3);
    setLocationPrefix(first);
  }, [locationSearchTerm]);
  const buttonStyle =
    "bg-white hover:bg-cooper-gray-200 border-white text-cooper-gray-400 p-2";

  const firstLocationId = reviews.data?.[0]?.locationId;

  const location = api.location.getById.useQuery(
    { id: firstLocationId ?? "" },
    {
      enabled: !!firstLocationId,
    },
  );

  const ratings = calculateRatings(reviews.data ?? []);
  const [selectedFilter, setSelectedFilter] = useState<
    "most recent" | "highest rating" | "lowest rating" | undefined
  >("most recent");

  const companyQuery = api.company.getById.useQuery(
    { id: roleObj.companyId },
    { enabled: !!reviews.data?.[0]?.companyId },
  );

  // ===== ROLE DATA ===== //
  const companyData = companyQuery.data;
  const averages = api.role.getAverageById.useQuery({ roleId: roleObj.id });
  const interviewData = api.role.getInterviewDataById.useQuery({
    roleId: roleObj.id,
  });
  const industryInterviewData = api.review.getInterviewDataByIndustry.useQuery(
    { industry: companyData?.industry ?? "" },
    { enabled: !!companyData?.industry },
  );
  const companyReviews = api.review.getByCompany.useQuery(
    {
      id: companyData?.id ?? "",
    },
    {
      enabled: !!companyData?.id,
    },
  );

  const uniqueLocationIds = Array.from(
    new Set(
      (companyReviews.data ?? [])
        .map((review) => review.locationId)
        .filter((id): id is string => !!id),
    ),
  );

  const locationQueries = api.useQueries((t) =>
    uniqueLocationIds.map((id) =>
      t.location.getById({ id }, { enabled: !!id }),
    ),
  );

  const finalLocations = locationQueries
    .map((query) => (query.data ? prettyLocationName(query.data) : null))
    .filter((loc): loc is string => !!loc);

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

  const avgs = api.review.list
    .useQuery({})
    .data?.map((review) => review.overallRating ?? 0);
  const cooperAvg: number =
    Math.round(
      ((avgs ?? []).reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0) /
        (avgs?.length ?? 1)) *
        10,
    ) / 10;

  const perks = averages.data && {
    "Federal holidays off": averages.data.federalHolidays,
    "Drug test": averages.data.drugTest,
    "Lunch provided": averages.data.freeLunch,
    "Free merch": averages.data.freeMerch,
    "Travel benefits": averages.data.travelBenefits,
    "Snack bar": averages.data.snackBar,
  };

  // ====== Ensure User Is Logged In + Hasn't Made Too Many Reviews ====== //
  const { data: profile } = api.profile.getCurrentUser.useQuery();
  const profileId = profile?.id;

  const usersReviews = api.review.getByProfile.useQuery(
    { id: profileId ?? "" },
    { enabled: !!profileId },
  );

  const publishedUserReviewCount = useMemo(
    () =>
      (usersReviews.data ?? []).filter(
        (review) => review.status === Status.PUBLISHED,
      ).length,
    [usersReviews.data],
  );

  // Filter reviews based on selected rating and search term
  const filteredReviews = reviews.data?.filter((review) => {
    // Filter by rating (empty = all; otherwise range min–max inclusive)
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

  const jobTypesFromReviews = [
    ...new Set(
      (reviews.data ?? [])
        .map((r) => r.jobType)
        .filter(Boolean)
        .map((job) => (job === "CO-OP" ? "Co-op" : job)),
    ),
  ] as string[];
  const jobTypeLabel =
    jobTypesFromReviews.length === 0
      ? null
      : jobTypesFromReviews.length === 1
        ? jobTypesFromReviews[0]
        : jobTypesFromReviews.sort().join(" / ");

  const isComparing =
    compare.isCompareMode &&
    (compare.comparedRoleIds.length >= 1 || compare.isDragging);

  const averageStarRating = (
    <CardContent className="grid gap-2">
      {reviews.isSuccess &&
        reviews.data.length > 0 &&
        (() => {
          return (
            <div className="align-center flex gap-2 text-cooper-gray-400">
              <Image
                src="/svg/star.svg"
                alt="Star icon"
                width={20}
                height={20}
              />
              <div>
                {Math.round(Number(averages.data?.averageOverallRating) * 100) /
                  100}
              </div>
              ({reviews.data.length} review
              {reviews.data.length !== 1 && "s"})
            </div>
          );
        })()}
    </CardContent>
  );
  return (
    <div
      className={cn(
        "flex h-fit w-[100%] flex-col justify-between scroll-smooth rounded-lg border-none pb-5",
        className,
      )}
    >
      {onBack && (
        <svg
          width="14"
          height="12"
          viewBox="0 0 14 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="m-4 block min-w-3 hover:cursor-pointer md:hidden"
          onClick={onBack}
        >
          <path
            d="M13.41 10.59L12 12L6 6L12 0L13.41 1.41L8.83 6L13.41 10.59ZM7.41 10.59L6 12L0 6L6 0L7.41 1.41L2.83 6L7.41 10.59Z"
            fill="#5A5A5A"
          />
        </svg>
      )}
      <div
        className={cn(
          "flex w-full items-start py-5 lg:pl-6 lg:pr-6",
          compare.isCompareMode && "lg:pl-4 lg:pr-4",
        )}
      >
        <CardHeader className="mx-0 w-full">
          <div className="flex items-start space-x-2">
            {compare.isCompareMode ? (
              companyData ? (
                <CompanyPopup
                  trigger={
                    <Logo
                      company={companyData}
                      className="min-h-[82px] min-w-[82px] "
                    />
                  }
                  company={companyData}
                  locations={finalLocations}
                />
              ) : (
                <div className="w-20 rounded-lg border bg-cooper-blue-200"></div>
              )
            ) : null}
            <div className="flex flex-col w-full px-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-row gap-2 items-start">
                  <CardTitle>
                    <div
                      className={cn(
                        "flex items-center gap-3 text-lg md:text-2xl",
                        compare.isCompareMode &&
                          compare.comparedRoleIds.length === 2 &&
                          "md:text-xl",
                      )}
                    >
                      <div>{roleObj.title}</div>
                    </div>
                  </CardTitle>
                  {!compare.isCompareMode && (
                    <ReportButton
                      entityId={roleObj.id}
                      entityType="company"
                      iconOnly={true}
                      className="pt-2"
                    />
                  )}
                </div>
                <div
                  className={cn(
                    "flex ml-5",
                    compare.isCompareMode && "flex-row gap-3 items-center",
                  )}
                >
                  <FavoriteButton objId={roleObj.id} objType="role" />
                  {compare.isCompareMode && (
                    <button
                      type="button"
                      aria-label="Remove from comparison"
                      onClick={() => compare.removeRoleId(roleObj.id)}
                      className="hover:shadow-[0px_0px_0px_12px_rgb(231,231,231)] hover:bg-cooper-gray-150 rounded-full transition"
                    >
                      <Image
                        src="/svg/exitComparisonButton.svg"
                        width={14}
                        height={14}
                        alt="Remove from comparison"
                        style={{ minHeight: "14px", minWidth: "14px" }}
                      />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between text-cooper-gray-400">
                {location.isSuccess && location.data && (
                  <div>
                    {jobTypeLabel} • {prettyLocationName(location.data)}
                  </div>
                )}
                {!compare.isCompareMode && (
                  <div className="flex flex-col items-end gap-2">
                    {averageStarRating}
                  </div>
                )}
              </div>
              {compare.isCompareMode && averageStarRating}
            </div>
          </div>
        </CardHeader>
      </div>
      <div className="flex w-[100%] justify-between">
        <div
          className={cn(
            "grid w-full grid-cols-2 gap-5 px-3 lg:pl-6 lg:pr-6",
            compare.isCompareMode && "lg:pl-4 lg:pr-4",
          )}
        >
          {companyData && !compare.isCompareMode && (
            <CompanyCardPreview
              companyObj={companyData}
              className="col-span-2 hover:bg-white hover:cursor-default"
            />
          )}
          <div className="col-span-2" id="on-the-job">
            <ModalContainer title={"On the job"}>
              {averages.data && (
                <div
                  className={cn(
                    "flex flex-wrap gap-10 overflow-auto xl:flex-nowrap",
                    isComparing &&
                      "flex-col gap-6 overflow-visible xl:flex-col",
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-wrap gap-10 lg:flex-nowrap",
                      isComparing && "flex-col gap-6 lg:flex-col",
                    )}
                  >
                    <BarGraph
                      title={"Company culture rating"}
                      maxValue={5}
                      value={averages.data.averageCultureRating}
                    />
                    <BarGraph
                      title={"Supervisor rating"}
                      maxValue={5}
                      value={averages.data.averageSupervisorRating}
                    />
                  </div>

                  <div
                    className={cn(
                      "flex flex-wrap gap-x-6",
                      isComparing && "gap-y-3",
                    )}
                  >
                    {perks &&
                      Object.entries(perks).map(
                        ([perk, value]: [string, number]) => (
                          <div
                            key={perk}
                            className={`flex items-center gap-2 ${value > 0.5 ? "text-[#141414]" : "text-[#7d7d7d]"}`}
                          >
                            {value > 0.5 ? (
                              <Image
                                src="svg/perkCheck.svg"
                                alt="check mark"
                                width={12}
                                height={9}
                              />
                            ) : (
                              <Image
                                src="svg/perkCross.svg"
                                alt="x mark"
                                height={11}
                                width={11}
                              />
                            )}

                            {perk}
                          </div>
                        ),
                      )}
                  </div>
                </div>
              )}
            </ModalContainer>
          </div>

          {averages.data && (
            <div className="col-span-2" id="pay">
              <ModalContainer title={"Pay"}>
                <div className="flex flex-col justify-between gap-3 md:flex-row">
                  <div className="flex flex-col gap-2 md:w-[30%] md:gap-5">
                    <div className="text-cooper-gray-400">Pay range</div>
                    {averages.data.minPay !== averages.data.maxPay ? (
                      <div className="flex flex-col gap-5">
                        <div className="pl-1 text-4xl text-[#141414]">
                          ${averages.data.minPay}-{averages.data.maxPay} / hr
                        </div>
                        <RoundBarGraph
                          maxValue={Math.max(averages.data.maxPay, 45)}
                          minValue={Math.min(averages.data.minPay, 15)}
                          lowValue={averages.data.minPay}
                          highValue={averages.data.maxPay}
                        />
                      </div>
                    ) : (
                      <div className="pl-1 text-4xl text-[#141414]">
                        ${averages.data.maxPay} / hr
                      </div>
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex flex-col justify-between gap-2 md:w-[30%] md:gap-5",
                      isComparing && "w-full md:w-full",
                    )}
                  >
                    <div className="text-cooper-gray-400">Overtime work</div>
                    <div className="flex items-center gap-2 pl-1">
                      <div className="text-4xl text-[#141414]">
                        {Math.round(
                          Number(averages.data.overtimeNormal.toPrecision(2)) *
                            100,
                        )}
                        %
                      </div>
                      <div className="flex flex-wrap text-sm text-[#141414]">
                        said working overtime was normal
                      </div>
                    </div>
                    <RoundBarGraph
                      maxValue={100}
                      highValue={
                        Number(averages.data.overtimeNormal.toPrecision(2)) *
                        100
                      }
                    />
                  </div>
                  <div
                    className={cn(
                      "flex flex-col justify-between gap-2 md:w-[30%] md:gap-5",
                      isComparing && "w-full md:w-full",
                    )}
                  >
                    <div className="text-cooper-gray-400">
                      Paid time off (PTO)
                    </div>
                    <div className="flex items-center gap-2 pl-1">
                      <div className="text-4xl text-[#141414]">
                        {Number(averages.data.pto.toPrecision(2)) * 100}%
                      </div>
                      <div className="flex flex-wrap text-sm text-[#141414]">
                        received PTO
                      </div>
                    </div>
                    <RoundBarGraph
                      maxValue={100}
                      highValue={Number(averages.data.pto.toPrecision(2)) * 100}
                    />
                  </div>
                </div>
              </ModalContainer>
            </div>
          )}
          <div className="col-span-2" id="interview">
            <div className="xl:hidden">
              <InterviewModal
                roleData={interviewData.data}
                industryData={industryInterviewData.data}
                compact
              />
            </div>
            <div className="hidden xl:block">
              <InterviewModal
                roleData={interviewData.data}
                industryData={industryInterviewData.data}
                compact={compare.isCompareMode}
              />
            </div>
          </div>
          <div className="col-span-2" id="reviews">
            <ModalContainer title="Reviews">
              {reviews.isSuccess && reviews.data.length === 0 && (
                <div className="flex h-full w-full flex-col items-center justify-center text-[#5a5a5a]">
                  <p>No reviews yet</p>
                  {usersReviews.isSuccess && publishedUserReviewCount < 5 && (
                    <Link href={`/review-form`} className="ml-2 underline">
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
                      averageOverallRating={
                        averages.data?.averageOverallRating ?? 0
                      }
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
                          onSelectionChange={(selected) =>
                            setRatingFilter(selected)
                          }
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
                          onSelectionChange={(selected) =>
                            setLocationFilter(selected)
                          }
                          onSearchChange={(search) =>
                            setLocationSearchTerm(search)
                          }
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
                            onSelectionChange={(selected) =>
                              setRatingFilter(selected)
                            }
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
                            onSearchChange={(search) =>
                              setLocationSearchTerm(search)
                            }
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
                    sortedReviews.map((review: ReviewType) => {
                      return (
                        <ReviewCard
                          reviewObj={review}
                          key={review.id}
                          isComparing={isComparing}
                        />
                      );
                    })
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
          </div>
        </div>
      </div>
    </div>
  );
}
