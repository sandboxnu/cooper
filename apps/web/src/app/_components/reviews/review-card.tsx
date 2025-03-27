"use client";

import Image from "next/image";

import type { ReviewType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { ReviewCardStars } from "./review-card-stars";

// const InterviewDifficulty = [
//   { des: "Very Easy", color: "text-[#4bc92e]" },
//   { des: "Easy", color: "text-[#09b52b]" },
//   { des: "Neither Easy Nor Difficult", color: "text-cooper-blue-400" },
//   { des: "Difficult", color: "text-[#f27c38]" },
//   { des: "Very Difficult", color: "text-[#f52536]" },
// ];

interface ReviewCardProps {
  className?: string;
  reviewObj: ReviewType;
}

export function ReviewCard({ reviewObj, className }: ReviewCardProps) {
  // ===== LOCATION DATA ===== //
  const locationName = (reviewObj: ReviewType) => {
    if (reviewObj.locationId) {
      const { data: location } = api.location.getById.useQuery({
        id: reviewObj.locationId,
      });
      return location
        ? location.city +
            (location.state ? `, ${location.state}` : "") +
            (location.state ? "" : `, ${location.country}`)
        : "N/A";
    }
  };

  const workTerm = (reviewObj: ReviewType) => {
    if (reviewObj.workTerm == "SPRING") {
      return "Spr";
    }
    if (reviewObj.workTerm == "SUMMER") {
      return "Sum";
    }
    if (reviewObj.workTerm == "FALL") {
      return "Fall";
    }
    return "N/A";
  };

  const workEnv = (reviewObj: ReviewType) => {
    if (reviewObj.workEnvironment == "HYBRID") {
      return "Hybrid";
    }
    if (reviewObj.workEnvironment == "REMOTE") {
      return "Remote";
    }
    if (reviewObj.workEnvironment == "INPERSON") {
      return "In Person";
    }
    return "N/A";
  };

  return (
    <Card
      className={cn(
        "mx-auto min-h-40 w-[100%] border border-neutral-900 bg-cooper-gray-200",
        className,
      )}
    >
      <div className="flex w-full pt-5">
        <div className="h-40 w-[35%]">
          <CardContent className="flex h-full flex-col justify-between pr-0">
            <div>
              <div className="pt-2">
                <ReviewCardStars numStars={reviewObj.overallRating} />
              </div>
              <div className="align-center flex flex-wrap gap-x-2 pt-2">
                <span
                  className={`${locationName(reviewObj) ? "visibility: visible" : "visibility: hidden"}`}
                >
                  {locationName(reviewObj)} •
                </span>
                <span>
                  {workTerm(reviewObj)} {reviewObj.workYear}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm">
                {reviewObj.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2 text-sm">
                Posted by: Anonymous{" "}
                <div className="cursor-pointer text-sm font-black">?</div>
              </div>
            </div>
          </CardContent>
        </div>
        <div className="w-[65%]">
          <CardContent className="flex h-full flex-col justify-between gap-4 pl-0">
            <div className="pt-1">{reviewObj.textReview}</div>
            <div className="flex justify-between text-sm">
              <div className="flex gap-6">
                <div>Position type: Co-op</div>
                <div>Work model: {workEnv(reviewObj)}</div>
                <div>Pay: ${reviewObj.hourlyPay} / hr</div>
              </div>

              <Image
                src="/svg/reviewReport.svg"
                alt="Star icon"
                width={16}
                height={15}
                className="cursor-pointer"
              />
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
