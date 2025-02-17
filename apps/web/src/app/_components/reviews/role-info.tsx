"use client";

import Image from "next/image";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { ReviewCard } from "./review-card";
import { ReviewCardStars } from "./review-card-stars";

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

  const companyQuery = api.company.getById.useQuery(
    { id: reviews.data?.[0]?.companyId ?? "" },
    { enabled: !!reviews.data?.[0]?.companyId },
  );

  // ===== ROLE DATA ===== //
  const role = api.role.getById.useQuery({ id: roleObj.id });

  const companyData = companyQuery.data;

  return (
    <Card
      className={cn(
        "flex h-fit w-[100%] flex-col justify-between overflow-hidden rounded-2xl border-none",
        className,
      )}
    >
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
                  className="rounded-xl border"
                />
              ) : (
                <div className="h-20 w-20 rounded-xl border bg-cooper-blue-200"></div>
              )}
              <div className="h-20">
                <CardTitle className="text-2xl">
                  <div className="text-md flex items-center gap-3 md:text-xl">
                    <div>{role.data?.title}</div>
                    <div className="text-sm font-normal text-cooper-gray-400">
                      Co-op
                    </div>
                  </div>
                </CardTitle>
                <div className="align-center flex gap-2 text-cooper-gray-400">
                  <span>{companyData?.name}</span>
                  {reviews.isSuccess && reviews.data.length > 0 && (
                    <span
                      className={`${reviews.data[0]?.location ? "visibility: visible" : "visibility: hidden"}`}
                    >
                      •
                    </span>
                  )}
                  {reviews.isSuccess && reviews.data.length > 0 && (
                    <span>{reviews.data[0]?.location}</span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid justify-end gap-2">
            {reviews.isSuccess &&
              reviews.data.length > 0 &&
              (() => {
                const totalRating = reviews.data.reduce(
                  (sum, review) => sum + review.overallRating,
                  0,
                );
                const averageRating = (
                  totalRating / reviews.data.length
                ).toFixed(1);

                return (
                  <div className="align-center flex gap-2 text-cooper-gray-400">
                    <Image
                      src="/svg/star.svg"
                      alt="Star icon"
                      width={20}
                      height={20}
                    />
                    {averageRating} ({reviews.data.length} reviews)
                  </div>
                );
              })()}
          </CardContent>
        </div>

        <div className="space-y-4">
          <Card className="mx-auto w-[94%] rounded-3xl bg-cooper-gray-200">
            <CardHeader>About the Job</CardHeader>
            <div className="align-center flex">
              <CardContent className="grid justify-end gap-2">
                {reviews.isSuccess &&
                  reviews.data.length > 0 &&
                  (() => {
                    const totalPay = reviews.data.reduce(
                      (sum, review) =>
                        sum + parseFloat(review.hourlyPay ?? "0"),
                      0.0,
                    );
                    const averagePay = totalPay / reviews.data.length;

                    return (
                      <>
                        <div className="align-center flex gap-2">Pay Range</div>
                        <div className="align-center flex gap-2">
                          ${Math.round(averagePay * 100) / 100.0}/hr
                        </div>
                      </>
                    );
                  })()}
              </CardContent>
              <CardContent className="grid justify-end gap-2">
                {reviews.isSuccess &&
                  reviews.data.length > 0 &&
                  (() => {
                    const totalInterviewDifficulty = reviews.data.reduce(
                      (sum, review) => sum + review.interviewDifficulty,
                      0,
                    );
                    const averageInterviewDifficulty =
                      totalInterviewDifficulty / reviews.data.length;
                    return (
                      <>
                        <div className="align-center flex gap-2">
                          Interview Difficulty
                        </div>
                        <div className="align-center flex gap-2">
                          {Math.round(averageInterviewDifficulty * 100) / 100.0}
                        </div>
                      </>
                    );
                  })()}
              </CardContent>
            </div>
          </Card>

          <Card className="mx-auto w-[94%] rounded-3xl">
            <CardContent>
              <h2 className="mb-1 mt-3 text-xl font-semibold">Ratings</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {reviews.isSuccess &&
                  reviews.data.length > 0 &&
                  (() => {
                    const totalCultureRating = reviews.data.reduce(
                      (sum, review) => sum + review.cultureRating,
                      0,
                    );
                    const averageCultureRating =
                      totalCultureRating / reviews.data.length;
                    return (
                      <>
                        <div>
                          <h3>Company Culture</h3>
                          <ReviewCardStars numStars={averageCultureRating} />
                        </div>
                      </>
                    );
                  })()}
                {reviews.isSuccess &&
                  reviews.data.length > 0 &&
                  (() => {
                    const totalSupervisorRating = reviews.data.reduce(
                      (sum, review) => sum + review.supervisorRating,
                      0,
                    );
                    const averageSupervisorRating =
                      totalSupervisorRating / reviews.data.length;
                    return (
                      <>
                        <div>
                          <h3>Supervisor</h3>
                          <ReviewCardStars numStars={averageSupervisorRating} />
                        </div>
                      </>
                    );
                  })()}
                {reviews.isSuccess &&
                  reviews.data.length > 0 &&
                  (() => {
                    const totalInterviewRating = reviews.data.reduce(
                      (sum, review) => sum + review.interviewRating,
                      0,
                    );
                    const averageInterviewRating =
                      totalInterviewRating / reviews.data.length;
                    return (
                      <>
                        <div>
                          <h3>Interview Rating</h3>
                          <ReviewCardStars numStars={averageInterviewRating} />
                        </div>
                      </>
                    );
                  })()}
              </div>
            </CardContent>
          </Card>
          {reviews.isSuccess && reviews.data.length > 0 && (
            <div>
              <div className="pl-6">Reviews:</div>

              {reviews.data.map((review) => {
                return <ReviewCard reviewObj={review} />;
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
