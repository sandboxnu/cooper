"use client";

import Image from "next/image";

import type { ReviewType, RoleType, WorkEnvironmentType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@cooper/api";

import { api } from "~/trpc/react";
import { listBenefits } from "~/utils/reviewsAggregationHelpers";
import { prettyWorkEnviornment } from "~/utils/stringHelpers";
import { ReviewCardStars } from "./review-card-stars";
import { ReviewCard } from "./review-card";


const InterviewDifficulty = [
  { des: "Very Easy", color: "text-[#4bc92e]" },
  { des: "Easy", color: "text-[#09b52b]" },
  { des: "Neither Easy Nor Difficult", color: "text-cooper-blue-400" },
  { des: "Difficult", color: "text-[#f27c38]" },
  { des: "Very Difficult", color: "text-[#f52536]" },
];

const yellowStar = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="19"
    height="17"
    viewBox="0 0 19 17"
    fill="none"
  >
    <path
      d="M8.57668 1.21993C8.91827 0.398637 10.0817 0.398636 10.4233 1.21993L12.0427 5.11343C12.1867 5.45967 12.5123 5.69624 12.8861 5.72621L17.0895 6.06319C17.9761 6.13427 18.3357 7.24078 17.6601 7.81945L14.4576 10.5627C14.1728 10.8067 14.0485 11.1895 14.1355 11.5542L15.1139 15.656C15.3203 16.5212 14.379 17.2051 13.6199 16.7414L10.0213 14.5434C9.70124 14.3479 9.29876 14.3479 8.97875 14.5434L5.38008 16.7414C4.62098 17.2051 3.67973 16.5212 3.88611 15.656L4.86454 11.5542C4.95154 11.1895 4.82717 10.8067 4.54238 10.5627L1.33986 7.81945C0.664326 7.24078 1.02385 6.13427 1.91051 6.06319L6.11387 5.72621C6.48766 5.69624 6.81327 5.45967 6.95728 5.11343L8.57668 1.21993Z"
      fill="#FFA400"
    />
  </svg>
);

interface RoleCardProps {
  className?: string;
  roleObj: RoleType;
}

export function RoleInfo({ className, roleObj }: RoleCardProps) {
  const reviews = api.review.getByRole.useQuery({id: roleObj.id});
  
  const companyQuery = api.company.getById.useQuery(
    { id: reviews.data?.[0]?.companyId ?? "" },
    { enabled: !!reviews.data?.[0]?.companyId }
  );

  // ===== ROLE DATA ===== //
  const role = api.role.getById.useQuery({ id: roleObj.id });

  const companyData = companyQuery.data;

  return (
    <Card
      className={cn(
        "flex h-fit w-[100%] flex-col justify-between overflow-hidden rounded-3xl",
        className,
      )}
    >
      <div>
        <div className="flex items-center justify-between w-full">
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
                <div className="flex items-center gap-3 text-md md:text-xl">
                  <div>
                  {role.data?.title}
                  </div>
                  <div className="font-normal text-sm">
                  Co-op
                  </div>
                </div>
              </CardTitle>
              <div className="flex align-center gap-2">
                <span>{companyData?.name}</span>
                {reviews.isSuccess && reviews.data.length > 0 && <span className={`${reviews.data[0]?.location ? "visibility: visible" : "visibility: hidden"}`}>•</span>}
                {reviews.isSuccess && reviews.data.length > 0 && <span>{reviews.data[0]?.location}</span>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 justify-end">
          {reviews.isSuccess && reviews.data.length > 0 && (() => {
            const totalRating = reviews.data.reduce((sum, review) => sum + review.overallRating, 0);
            const averageRating = (totalRating / reviews.data.length).toFixed(1);

            return (
              <div className="flex align-center gap-2">
                {yellowStar} {averageRating} ({reviews.data.length} reviews)
              </div>
            );
          })()}
        </CardContent>
        </div>

        <div className="space-y-4">
        <Card className="w-[94%] bg-cooper-gray-100 rounded-3xl mx-auto">
          <CardHeader>About the Job</CardHeader>
          <div className="flex align-center">
            <CardContent className="grid gap-2 justify-end">
            {reviews.isSuccess && reviews.data.length > 0 && (() => {
            const totalPay = reviews.data.reduce((sum, review) => sum + parseFloat(review.hourlyPay || "0"), 0.0);
            const averagePay = (totalPay / reviews.data.length);

            return (
              <>
                <div className="flex align-center gap-2">
                Pay Range
                </div>
                <div className="flex align-center gap-2">
                  ${Math.round(averagePay * 100) / 100.00}/hr
                </div>
            </>
            );
          })()}

            </CardContent>
            <CardContent className="grid gap-2 justify-end">
              {reviews.isSuccess && reviews.data.length > 0 && (() => {
              const totalInterviewDifficulty = reviews.data.reduce((sum, review) => sum + review.interviewDifficulty, 0);
              const averageInterviewDifficulty = (totalInterviewDifficulty / reviews.data.length);
              return (
                <>
                  <div className="flex align-center gap-2">
                  Interview Difficulty
                </div>
                <div className="flex align-center gap-2">
                  {Math.round(averageInterviewDifficulty * 100) / 100.00}
                </div>
              </>
              );
            })()}
            </CardContent>
            {/* <CardContent className="grid gap-2 justify-end">
              {reviews.isSuccess && reviews.data.length > 0 && (() => {
              const totalInterviewDifficulty = reviews.data.reduce((sum, review) => sum + review.interviewDifficulty, 0);
              const averageInterviewDifficulty = (totalInterviewDifficulty / reviews.data.length);
              return (
                <>
                  <div className="flex align-center gap-2">
                  Interview Difficulty
                </div>
                <div className="flex align-center gap-2">
                  {averageInterviewDifficulty}
                </div>
              </>
              );
            })()}
            </CardContent> */}
          </div>
        </Card>

        <Card className="w-[94%] bg-cooper-gray-100 rounded-3xl mx-auto">
          <div className="flex align-center">
            {/* <CardContent className="pt-2 grid grid-cols-3 mx-auto h-full w-full">
              <div>
                Drug Test {reviewObj.drugTest}
              </div>
              <div>
                Federal holidays {reviewObj.federalHolidays}
              </div>
              <div>
                Free merch {reviewObj.freeMerch}
              </div>
              <div>
                Overtime {reviewObj.overtimeNormal}
              </div>
              <div>
                Lunch provided {reviewObj.freeLunch}
              </div>
              <div>
                Other benefits {reviewObj.otherBenefits}
              </div>
              <div>
                PTO {reviewObj.pto}
              </div>
              <div>
                Transportation {reviewObj.freeTransport}
              </div>
            </CardContent> */}
          </div>
        </Card>

        <Card className="w-[94%] rounded-3xl mx-auto">
          <CardContent>
            <h2 className="mb-1 mt-3 text-xl font-semibold">Ratings</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {reviews.isSuccess && reviews.data.length > 0 && (() => {
              const totalCultureRating = reviews.data.reduce((sum, review) => sum + review.cultureRating, 0);
              const averageCultureRating = (totalCultureRating / reviews.data.length);
              return (
                <>
                <div>
                <h3>Company Culture</h3>
                <ReviewCardStars numStars={averageCultureRating} />
              </div>
              </>
              );
            })()}
            {reviews.isSuccess && reviews.data.length > 0 && (() => {
              const totalSupervisorRating = reviews.data.reduce((sum, review) => sum + review.supervisorRating, 0);
              const averageSupervisorRating = (totalSupervisorRating / reviews.data.length);
              return (
                <>
                <div>
                <h3>Supervisor</h3>
                <ReviewCardStars numStars={averageSupervisorRating} />
              </div>
              </>
              );
            })()}
            {reviews.isSuccess && reviews.data.length > 0 && (() => {
              const totalInterviewRating = reviews.data.reduce((sum, review) => sum + review.interviewRating, 0);
              const averageInterviewRating = (totalInterviewRating / reviews.data.length);
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
        {reviews.isSuccess && reviews.data.length > 0 &&  (
          <div>

          {reviews.data.map((review) => {
            return <ReviewCard reviewObj={review} /> 
          })}
          </div>   
            ) }
        </div>
      </div>
    </Card>
  );
}
