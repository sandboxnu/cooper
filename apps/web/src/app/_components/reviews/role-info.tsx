import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { ReviewType, RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { CardContent, CardHeader, CardTitle } from "@cooper/ui/card";
import Logo from "@cooper/ui/logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cooper/ui/select";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { calculateRatings } from "~/utils/reviewCountByStars";
import { CompanyPopup } from "../companies/company-popup";
import { useCompare } from "../compare/compare-context";
import { CompareControls } from "../compare/compare-ui";
import DropdownFilter from "../filters/dropdown-filter";
import StarGraph from "../shared/star-graph";
import BarGraph from "./bar-graph";
import CollapsableInfoCard from "./collapsable-info";
import InfoCard from "./info-card";
import { ReviewCard } from "./review-card";
import RoundBarGraph from "./round-bar-graph";
import { Button } from "node_modules/@cooper/ui/src/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "node_modules/@cooper/ui/src/dropdown-menu";
import { ChevronDown } from "lucide-react";

const RATING_OPTIONS = [
  { value: "all", label: "All ratings" },
  ...([5, 4, 3, 2, 1] as const).map((n) => ({
    value: String(n),
    label: `${n} star${n === 1 ? "" : "s"}`,
  })),
] as const;

interface RoleCardProps {
  className?: string;
  roleObj: RoleType;
  onBack?: () => void;
}

export function RoleInfo({ className, roleObj, onBack }: RoleCardProps) {
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [locationPrefix, setLocationPrefix] = useState("");
  const reviews = api.review.getByRole.useQuery({ id: roleObj.id });

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

  const compare = useCompare();

  // ===== ROLE DATA ===== //
  const companyData = companyQuery.data;
  const averages = api.role.getAverageById.useQuery({ roleId: roleObj.id });
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
    return [
      { id: "all", label: "All locations" },
      ...Array.from(byId.values()),
    ];
  }, [roleLocationQueries, locationsToUpdate.data]);

  const avgs = api.review.list
    .useQuery({})
    .data?.map((review) => review.overallRating);
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

  // Filter reviews based on selected rating and search term
  const filteredReviews = reviews.data?.filter((review) => {
    // Filter by rating
    const ratingMatch =
      ratingFilter === "all" ||
      Math.round(review.overallRating) === parseInt(ratingFilter);

    const locationMatch =
      locationFilter === "all" ||
      !locationFilter ||
      review.locationId === locationFilter;

    const jobTypeMatch =
      jobTypeFilter === "all" ||
      review.jobType === jobTypeFilter ||
      (review.jobType === "CO-OP" && jobTypeFilter === "Co-op");

    return ratingMatch && locationMatch && jobTypeMatch;
  });

  const sortedReviews = useMemo(() => {
    if (!filteredReviews) return undefined;
    const list = [...filteredReviews];
    switch (selectedFilter) {
      case "highest rating":
        return list.sort((a, b) => b.overallRating - a.overallRating);
      case "lowest rating":
        return list.sort((a, b) => a.overallRating - b.overallRating);
      case "most recent":
      default:
        return list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
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
      <div className="flex w-full flex-wrap items-start justify-between py-5 lg:pl-6 lg:pr-6">
        <CardHeader className="mx-0">
          <div className="flex items-center justify-start space-x-4">
            {companyData ? (
              <CompanyPopup
                trigger={<Logo company={companyData} />}
                company={companyData}
                locations={finalLocations}
              />
            ) : (
              <div className="h-20 w-20 rounded-lg border bg-cooper-blue-200"></div>
            )}
            <div className="flex h-20 flex-col justify-center">
              <CardTitle>
                <div className="flex items-center gap-3 text-lg md:text-2xl">
                  <div>{roleObj.title}</div>
                  <div className="hidden text-sm font-normal text-cooper-gray-400 sm:block">
                    {jobTypeLabel}
                  </div>
                </div>
              </CardTitle>
              <div className="align-center flex gap-2 text-cooper-gray-400">
                {companyData?.name && (
                  <CompanyPopup
                    trigger={companyData.name}
                    company={companyData}
                    locations={finalLocations}
                  />
                )}
                {location.isSuccess && location.data && (
                  <> • {prettyLocationName(location.data)}</>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <div className="mr-6 flex flex-col items-end gap-2">
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
                      {Math.round(
                        Number(averages.data?.averageOverallRating) * 100,
                      ) / 100}
                    </div>
                    ({reviews.data.length} review
                    {reviews.data.length !== 1 && "s"})
                  </div>
                );
              })()}
          </CardContent>
          {!compare.isCompareMode && (
            <CompareControls anchorRoleId={roleObj.id} />
          )}
        </div>
      </div>
      <div className="flex w-[100%] justify-between">
        <div className="grid w-full grid-cols-2 gap-5 px-3 lg:pl-6 lg:pr-6">
          <div className="col-span-2 h-full md:col-span-1" id="job-description">
            <InfoCard title={"Job Description"}>
              <div className="flex h-28 overflow-y-auto pr-4 text-[#5a5a5a] md:h-40">
                {roleObj.description}
              </div>
            </InfoCard>
          </div>
          {companyData && (
            <div className="col-span-2 h-full md:col-span-1" id="company">
              <InfoCard title={`About ${companyData.name}`}>
                <div className="flex gap-4 text-[#5a5a5a]">
                  <Logo company={companyData} />
                  <p className="h-28 overflow-y-auto md:h-40">
                    {companyData.description}
                  </p>
                </div>
              </InfoCard>
            </div>
          )}

          <div className="col-span-2" id="on-the-job">
            <CollapsableInfoCard title={"On the job"}>
              {averages.data && (
                <div className="flex flex-wrap gap-10 overflow-auto xl:flex-nowrap">
                  <div className="flex flex-wrap gap-10 lg:flex-nowrap">
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

                  <div className="flex flex-wrap gap-x-6">
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
            </CollapsableInfoCard>
          </div>
          {averages.data && (
            <div className="col-span-2" id="pay">
              <CollapsableInfoCard title={"Pay"}>
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
                  <div className="flex flex-col justify-between gap-2 md:w-[30%] md:gap-5">
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
                  <div className="flex flex-col justify-between gap-2 md:w-[30%] md:gap-5">
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
              </CollapsableInfoCard>
            </div>
          )}
          <div className="col-span-2" id="interview">
            <CollapsableInfoCard title="Interview">
              {averages.data && (
                <div className="flex flex-wrap gap-10">
                  <BarGraph
                    title="Interview rating"
                    value={averages.data.averageInterviewRating}
                    maxValue={5}
                  />
                  <BarGraph
                    title="Interview difficulty"
                    value={averages.data.averageInterviewDifficulty}
                    maxValue={5}
                  />
                </div>
              )}
            </CollapsableInfoCard>
          </div>
          <div className="col-span-2" id="reviews">
            <CollapsableInfoCard title="Reviews">
              {reviews.isSuccess && reviews.data.length === 0 && (
                <div className="flex h-full w-full flex-col items-center justify-center text-[#5a5a5a]">
                  <p>No reviews yet</p>
                  {usersReviews.isSuccess && usersReviews.data.length < 5 && (
                    <Link href={`/review-form`} className="ml-2 underline">
                      Add one!
                    </Link>
                  )}
                </div>
              )}
              {reviews.isSuccess && reviews.data.length > 0 && (
                <div className="flex h-full flex-col gap-5">
                  <div className="w-[44%]">
                    <StarGraph
                      ratings={ratings}
                      averageOverallRating={
                        averages.data?.averageOverallRating ?? 0
                      }
                      reviews={reviews.data.length}
                      cooperAvg={cooperAvg}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <Select
                      value={ratingFilter}
                      onValueChange={setRatingFilter}
                    >
                      <SelectTrigger className="w-[120px] h-[36px] border-[1px] border-cooper-gray-150 bg-white focus:ring-0 focus:ring-cooper-gray-150 focus:ring-offset-0 text-cooper-gray-400">
                        <SelectValue placeholder="All ratings" />
                      </SelectTrigger>
                      <SelectContent>
                        {RATING_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <DropdownFilter
                      title="Location"
                      filterType="location"
                      options={locationOptions}
                      selectedOptions={
                        locationFilter === "all" || !locationFilter
                          ? []
                          : [locationFilter]
                      }
                      onSelectionChange={(selected) =>
                        setLocationFilter(selected[0] ?? "all")
                      }
                      onSearchChange={(search) => setLocationSearchTerm(search)}
                      side="top"
                    />
                    <Select
                      value={jobTypeFilter}
                      onValueChange={setJobTypeFilter}
                    >
                      <SelectTrigger className="w-[120px] h-[36px] border-[1px] border-cooper-gray-150 bg-white focus:ring-0 focus:ring-cooper-gray-150 focus:ring-offset-0 text-cooper-gray-400">
                        <SelectValue placeholder="All ratings" />
                      </SelectTrigger>
                      <SelectContent side="top">
                        <SelectItem value="all">All job types</SelectItem>
                        <SelectItem value="Co-op">Co-op</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
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
                      return <ReviewCard reviewObj={review} key={review.id} />;
                    })
                  ) : (
                    <div className="py-8 text-center text-cooper-gray-400">
                      {locationFilter || jobTypeFilter || ratingFilter !== "all"
                        ? "No reviews found matching your filter criteria."
                        : "No reviews found for this rating."}
                    </div>
                  )}
                </div>
              )}
            </CollapsableInfoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
