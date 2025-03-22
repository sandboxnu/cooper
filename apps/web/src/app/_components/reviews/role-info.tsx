"use client";

import Image from "next/image";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { calculateRatings } from "~/utils/reviewCountByStars";
import StarGraph from "../shared/star-graph";
import BarGraph from "./bar-graph";
import InfoCard from "./info-card";
import { NewReviewDialog } from "./new-review-dialogue";
import { ReviewCard } from "./review-card";
import RoundBarGraph from "./round-bar-graph";

// const InterviewDifficulty = [
//   { des: "Very Easy", color: "text-[#4bc92e]" },
//   { des: "Easy", color: "text-[#09b52b]" },
//   { des: "Neither Easy Nor Difficult", color: "text-cooper-blue-400" },
//   { des: "Difficult", color: "text-[#f27c38]" },
//   { des: "Very Difficult", color: "text-[#f52536]" },
// ];

interface RoleCardProps {
  className?: string;
  roleObj: RoleType;
}

export function RoleInfo({ className, roleObj }: RoleCardProps) {
  const reviews = api.review.getByRole.useQuery({ id: roleObj.id });

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

  return (
    <Card
      className={cn(
        "flex h-fit w-[100%] flex-col justify-between overflow-hidden scroll-smooth rounded-2xl border-none",
        className,
      )}
    >
      <NewReviewDialog />
      <div>
        <div className="flex w-full items-center justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-start space-x-4">
              {companyData ? (
                <Image
                  src={`https://logo.clearbit.com/${companyData.name.replace(/\s/g, "")}.com`}
                  width={80}
                  height={80}
                  alt={`Logo of ${companyData.name}`}
                  className="h-20 w-20 rounded-xl border"
                />
              ) : (
                <div className="h-20 w-20 rounded-xl border bg-cooper-blue-200"></div>
              )}
              <div className="h-20">
                <CardTitle className="text-2xl">
                  <div className="text-md flex items-center gap-3 md:text-xl">
                    <div>{roleObj.title}</div>
                    <div className="text-sm font-normal text-cooper-gray-400">
                      Co-op
                    </div>
                  </div>
                </CardTitle>
                <div className="align-center flex gap-2 text-cooper-gray-400">
                  <span>{companyData?.name}</span>
                  {/* {reviews.isSuccess && reviews.data.length > 0 && (
                    <span
                      className={`${(reviews.data[0] ? locationName(reviews.data[0]) : "") ? "visibility: visible" : "visibility: hidden"}`}
                    >
                      •
                    </span>
                  )} */}
                  {reviews.isSuccess && reviews.data.length > 0 && (
                    <span>
                      {/* {reviews.data[0] ? locationName(reviews.data[0]) : ""} */}
                    </span>
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
          <div className="grid w-[80%] grid-cols-2 gap-5 pl-6">
            <div className="h-full" id="job-description">
              <InfoCard title={"Job Description"}>
                <div className="text-[#5a5a5a]">{roleObj.description}</div>
              </InfoCard>
            </div>
            {companyData && (
              <div className="h-full" id="company">
                <InfoCard title={`About ${companyData.name}`}>
                  <div className="flex gap-4 text-[#5a5a5a]">
                    <Image
                      src={`https://logo.clearbit.com/${companyData.name.replace(/\s/g, "")}.com`}
                      width={80}
                      height={80}
                      alt={`Logo of ${companyData.name}`}
                      className="h-20 w-20 rounded-xl border"
                    />
                    {companyData.description}
                  </div>
                </InfoCard>
              </div>
            )}

            <div className="col-span-2" id="on-the-job">
              <InfoCard title={"On the job"}>
                {averages.data && (
                  <div className="flex gap-10">
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
                    <div className="flex flex-wrap gap-x-6">
                      {perks &&
                        Object.entries(perks).map(([perk, value]) => (
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
                        ))}
                    </div>
                  </div>
                )}
              </InfoCard>
            </div>
            {averages.data && (
              <div className="col-span-2" id="pay">
                <InfoCard title={"Pay"}>
                  <div className="flex justify-between">
                    <div className="flex w-[30%] flex-col gap-5">
                      <div className="text-[#5a5a5a]">Pay range</div>
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
                    <div className="flex w-[30%] flex-col gap-5">
                      <div className="text-[#5a5a5a]">Overtime work</div>
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
                    <div className="flex w-[30%] flex-col gap-5">
                      <div className="text-[#5a5a5a]">Paid time off (PTO)</div>
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
                        highValue={
                          Number(averages.data.pto.toPrecision(2)) * 100
                        }
                      />
                    </div>
                  </div>
                </InfoCard>
              </div>
            )}
            <div className="col-span-2" id="interview">
              <InfoCard title="Interview">
                {averages.data && (
                  <div className="flex gap-10">
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
              </InfoCard>
            </div>
            <div className="col-span-2" id="reviews">
              <InfoCard title="Reviews">
                {reviews.isSuccess && reviews.data.length > 0 && (
                  <div className="flex flex-col gap-5">
                    <div className="w-[60%]">
                      <StarGraph
                        ratings={ratings}
                        averageOverallRating={
                          averages.data?.averageOverallRating ?? 0
                        }
                      />
                    </div>

                    {reviews.data.map((review) => {
                      return <ReviewCard reviewObj={review} />;
                    })}
                  </div>
                )}
              </InfoCard>
            </div>
          </div>
          <div className="flex w-[15%] flex-col gap-3 text-[#5a5a5a]">
            <a href="#job-description">Job Description</a>
            <a href="#company">Company</a>
            <a href="#on-the-job">On the job</a>
            <a href="#pay">Pay</a>
            <a href="#interview">Interview</a>
            <a href="#reviews">Reviews</a>
          </div>
        </div>
      </div>
    </Card>
  );
}
