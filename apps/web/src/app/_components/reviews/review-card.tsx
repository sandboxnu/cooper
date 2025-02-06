"use client";

import Image from "next/image";

import type { ReviewType, WorkEnvironmentType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { listBenefits } from "~/utils/reviewsAggregationHelpers";
import { prettyWorkEnviornment } from "~/utils/stringHelpers";
import { ReviewCardStars } from "./review-card-stars";


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

interface ReviewCardProps {
  className?: string;
  reviewObj: ReviewType;
}

export function ReviewCard({ className, reviewObj }: ReviewCardProps) {
  // ===== COMPANY DATA ===== //
  const company = api.company.getById.useQuery({ id: reviewObj.companyId });

  // ===== ROLE DATA ===== //
  const role = api.role.getById.useQuery({ id: reviewObj.roleId });

  // ===== REVIEW TEXT ===== //
  const reviewText = reviewObj.textReview;

  // Benefits
  const benefits = listBenefits(reviewObj);
  return (
    <Card>
        <CardHeader>Search goes here</CardHeader>
    <div className="flex">
    <Card className="w-25% border-none shadow-none">

          <CardContent>
            <div className="pt-2">
            <ReviewCardStars numStars={reviewObj.overallRating} />
              </div>
              <div className="pt-2 flex align-center gap-2">
                <span className={`${reviewObj.location ? "visibility: visible" : "visibility: hidden"}`}> {reviewObj.location} •</span>
                <span>{reviewObj.workTerm}</span>
              </div>
              <div>
            date posted
              </div>
              <div>
            posted by: 
              </div>
                <div>
                <h3>Position type: Co-op</h3>
              </div>
              <div>
                <h3>Work model: {reviewObj.workEnvironment}</h3>
              </div>
              <div>
                <h3>Pay: ${reviewObj.hourlyPay}/hr</h3>
              </div>
          </CardContent>
        </Card>
    <Card className="w-75% border-none shadow-none">
    <CardContent>
      <div className="pt-2 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
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
      <div className="pt-5">{reviewObj.textReview}</div>
    </CardContent>
  </Card>
  </div>
  </Card>
  );
}
