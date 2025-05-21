import Image from "next/image";
import Link from "next/link";

import type { ReviewType, RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { CardContent, CardHeader, CardTitle } from "@cooper/ui/card";
import Logo from "@cooper/ui/logo";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { calculateRatings } from "~/utils/reviewCountByStars";
import StarGraph from "../shared/star-graph";
import BarGraph from "./bar-graph";
import CollapsableInfoCard from "./collapsable-info";
import InfoCard from "./info-card";
import { ReviewCard } from "./review-card";
import RoundBarGraph from "./round-bar-graph";

interface RoleCardProps {
  className?: string;
  roleObj: RoleType;
  onBack?: () => void;
}

export function RoleInfo({ className, roleObj, onBack }: RoleCardProps) {
  const reviews = api.review.getByRole.useQuery({ id: roleObj.id });

  const firstLocationId = reviews.data?.[0]?.locationId;

  const location = api.location.getById.useQuery(
    { id: firstLocationId ?? "" },
    {
      enabled: !!firstLocationId,
    },
  );

  const ratings = calculateRatings(reviews.data ?? []);

  const companyQuery = api.company.getById.useQuery(
    { id: roleObj.companyId },
    { enabled: !!reviews.data?.[0]?.companyId },
  );

  // ===== ROLE DATA ===== //
  const companyData = companyQuery.data;
  const averages = api.role.getAverageById.useQuery({ roleId: roleObj.id });

  const perks = averages.data && {
    "Federal holidays off": averages.data.federalHolidays,
    "Drug test": averages.data.drugTest,
    "Lunch provided": averages.data.freeLunch,
    "Free merch": averages.data.freeMerch,
    "Transportation covered": averages.data.freeTransportation,
  };

  // ====== Ensure User Is Logged In + Hasn't Made Too Many Reviews ====== //
  const { data: profile } = api.profile.getCurrentUser.useQuery();
  const profileId = profile?.id;

  const usersReviews = api.review.getByProfile.useQuery(
    { id: profileId ?? "" },
    { enabled: !!profileId },
  );

  return (
    <div
      className={cn(
        "flex h-fit w-[100%] flex-col justify-between scroll-smooth rounded-lg border-none",
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
          className="m-4 block min-w-3 md:hidden hover:cursor-pointer"
          onClick={onBack}
        >
          <path
            d="M13.41 10.59L12 12L6 6L12 0L13.41 1.41L8.83 6L13.41 10.59ZM7.41 10.59L6 12L0 6L6 0L7.41 1.41L2.83 6L7.41 10.59Z"
            fill="#5A5A5A"
          />
        </svg>
      )}
      <div className="flex w-full flex-wrap items-center justify-between">
        <CardHeader className="mx-0 pb-3">
          <div className="flex items-center justify-start space-x-4">
            {companyData ? (
              <Logo company={companyData} />
            ) : (
              <div className="h-20 w-20 rounded-lg border bg-cooper-blue-200"></div>
            )}
            <div className="flex h-20 flex-col justify-center">
              <CardTitle>
                <div className="flex items-center gap-3 text-lg md:text-2xl">
                  <div>{roleObj.title}</div>
                  <div className="hidden text-sm font-normal text-cooper-gray-400 sm:block">
                    Co-op
                  </div>
                </div>
              </CardTitle>
              <div className="align-center flex gap-2 text-cooper-gray-400">
                {companyData?.name}
                {location.isSuccess && location.data && (
                  <> • {prettyLocationName(location.data)}</>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid justify-end gap-2">
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
                  {Math.round(
                    Number(averages.data?.averageOverallRating) * 100,
                  ) / 100}{" "}
                  ({reviews.data.length} review
                  {reviews.data.length !== 1 && "s"})
                </div>
              );
            })()}
        </CardContent>
      </div>
      <div className="mt-4 flex w-[100%] justify-between">
        <div className="grid w-full grid-cols-2 gap-5 px-3 lg:w-[80%] lg:pl-6 lg:pr-0">
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
                  <div className="flex flex-col justify-between gap-2 md:w-[30%] md:gap-5">
                    <div className="text-cooper-gray-400">Pay range</div>
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
                  <div className="flex flex-col justify-between gap-2 md:w-[30%] md:gap-5">
                    <div className="text-cooper-gray-400">Overtime work</div>
                    <div className="flex items-center gap-2 pl-1">
                      <div className="text-4xl text-[#141414]">
                        {Number(averages.data.overtimeNormal.toPrecision(2)) *
                          100}
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
                    <Link
                      href={`/review?id=${roleObj.id}`}
                      className="ml-2 underline"
                    >
                      Add one!
                    </Link>
                  )}
                </div>
              )}
              {reviews.isSuccess && reviews.data.length > 0 && (
                <div className="flex h-full flex-col gap-5">
                  <div className="w-[60%]">
                    <StarGraph
                      ratings={ratings}
                      averageOverallRating={
                        averages.data?.averageOverallRating ?? 0
                      }
                    />
                  </div>

                  {reviews.data.map((review: ReviewType) => {
                    return <ReviewCard reviewObj={review} key={review.id} />;
                  })}
                </div>
              )}
            </CollapsableInfoCard>
          </div>
        </div>
        <div className="sticky top-10 hidden h-fit w-[15%] flex-col gap-3 text-[#5a5a5a] lg:flex">
          <a href="#job-description">Job Description</a>
          <a href="#company">Company</a>
          <a href="#on-the-job">On the job</a>
          <a href="#pay">Pay</a>
          <a href="#interview">Interview</a>
          <a href="#reviews">Reviews</a>
        </div>
      </div>
    </div>
  );
}
