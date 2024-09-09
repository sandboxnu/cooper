"use client";

import Image from "next/image";

import type { ReviewType, WorkEnvironmentType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { listBenefits } from "~/utils/reviewsAggregationHelpers";
import { prettyWorkEnviornment, truncateText } from "~/utils/stringHelpers";
import { ReviewCardStars } from "./review-card-stars";

// todo: add this attribution in a footer somewhere
//  <a href="https://clearbit.com">Logos provided by Clearbit</a>

const InterviewDifficulty = [
  { des: "Very Easy", color: "text-[#4bc92e]" },
  { des: "Easy", color: "text-[#09b52b]" },
  { des: "Neither Easy Nor Difficult", color: "text-cooper-blue-400" },
  { des: "Difficult", color: "text-[#f27c38]" },
  { des: "Very Difficult", color: "text-[#f52536]" },
];

interface ReviewCardProps {
  className?: string;
  reviewObj: ReviewType;
}

export function ReviewCard({ className, reviewObj }: ReviewCardProps) {
  // ===== COMPANY DATA ===== //
  const company = api.company.getById.useQuery({ id: reviewObj.companyId });

  // ===== ROLE DATA ===== //
  const role = api.role.getById.useQuery({ id: reviewObj.roleId });

  // Truncate Review Text
  const reviewText = truncateText(reviewObj.textReview, 80);

  // Benefits
  const benefits = listBenefits(reviewObj);
  return (
    <Card
      className={cn(
        "flex h-fit w-[100%] flex-col justify-between overflow-hidden rounded-3xl",
        className,
      )}
    >
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-start space-x-4">
            {company.data ? (
              <Image
                src={`https://logo.clearbit.com/${company.data.name.replace(/\s/g, "")}.com`}
                width={80}
                height={80}
                alt={`Logo of ${company.data.name}`}
                className="rounded-xl border"
              />
            ) : (
              <div className="h-20 w-20 rounded-xl border bg-cooper-blue-200"></div>
            )}
            <div className="h-20">
              <CardTitle className="text-2xl">{role.data?.title}</CardTitle>
              <p className="text-md font-semibold">{company.data?.name}</p>
              {company.data && role.data && (
                <ReviewCardStars numStars={reviewObj.overallRating} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="mb-1 mt-3 text-xl font-semibold">
            {reviewObj.reviewHeadline}
          </h2>
          <p>{reviewText}</p>
        </CardContent>
        <CardContent>
          <h2 className="mb-1 mt-3 text-xl font-semibold">Ratings</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3>Company Culture</h3>
              <ReviewCardStars numStars={reviewObj.cultureRating} />
            </div>
            <div>
              <h3>Supervisor</h3>
              <ReviewCardStars numStars={reviewObj.supervisorRating} />
            </div>
            <div>
              <h3>Interview Rating</h3>
              <ReviewCardStars numStars={reviewObj.interviewRating} />
            </div>
          </div>
        </CardContent>
        <CardContent>
          <h2 className="mb-1 mt-3 text-xl font-semibold">
            Interview Difficulty
          </h2>
          <p
            className={
              InterviewDifficulty[reviewObj.interviewDifficulty - 1]?.color
            }
          >
            {InterviewDifficulty[reviewObj.interviewDifficulty - 1]?.des}
          </p>
          <p>{reviewObj.interviewReview}</p>
        </CardContent>
        <CardContent>
          <h2 className="mb-1 mt-3 text-xl font-semibold">Role Details</h2>
          <div className="flex flex-col lg:grid lg:grid-cols-2 xl:grid-cols-3">
            <div className="flex gap-x-2">
              <h3 className="font-semibold">Location</h3>
              <p>{reviewObj.location}</p>
            </div>
            <div className="flex gap-x-2">
              <h3 className="font-semibold">Hourly Pay</h3>
              <p>${reviewObj.hourlyPay?.toString()}</p>
            </div>
            <div className="flex gap-x-2">
              <h3 className="font-semibold">Work Model</h3>
              <p>
                {prettyWorkEnviornment(
                  reviewObj.workEnvironment as WorkEnvironmentType,
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <h3 className="font-semibold">Drug Test?</h3>
              <p>{reviewObj.drugTest ? "Yes" : "No"}</p>
            </div>
            <div className="col-span-2 flex gap-2">
              <h3 className="font-semibold">Overtime Common?</h3>
              <p>{reviewObj.overtimeNormal ? "Yes" : "No"}</p>
            </div>
          </div>
        </CardContent>
        <CardContent>
          <h2 className="mb-1 mt-3 text-xl font-semibold">Benefits</h2>
          <div className="flex flex-wrap gap-2">
            {benefits.map((benefit) => {
              return (
                <div
                  key={benefit}
                  className="text-nowrap rounded-full bg-cooper-blue-400 px-4 py-2 text-white"
                >
                  {benefit}
                </div>
              );
            })}
          </div>
          <p>{reviewObj.otherBenefits}</p>
        </CardContent>
      </div>
    </Card>
  );
}
