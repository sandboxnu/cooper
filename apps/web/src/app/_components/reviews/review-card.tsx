"use client";

import Image from "next/image";

import type { ReviewType, WorkEnvironmentType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { prettyWorkEnviornment } from "~/utils/stringHelpers";
import { DeleteReviewDialog } from "./delete-review-dialogue";

interface ReviewCardProps {
  className?: string;
  reviewObj: ReviewType;
}

export function ReviewCard({ reviewObj, className }: ReviewCardProps) {
  // Get the current user's profile
  const { data: currentProfile } = api.profile.getCurrentUser.useQuery();

  // Check if the current user is the author of the review
  const isAuthor = currentProfile?.id === reviewObj.profileId;

  const { data: location } = api.location.getById.useQuery({
    id: reviewObj.locationId ?? "",
  });

  return (
    <Card
      className={cn(
        "border-cooper-gray-150 mx-auto w-[100%] border-[0.75px] bg-[#FEFEFE]",
        className,
      )}
    >
      <div className="flex w-full flex-wrap">
        <div className="w-full sm:w-[17%]">
          <CardContent className="flex h-full pr-0">
            <div className="flex w-full flex-row justify-between md:flex-col">
              <div className="flex flex-row items-center gap-2">
                <div className="text-2xl text-[#151515] md:text-4xl">
                  {reviewObj.overallRating.toFixed(1)}
                </div>
                <Image
                  src="/svg/star.svg"
                  alt="Star icon"
                  width={28}
                  height={28}
                  className="h-5 w-5 md:h-7 md:w-7"
                />
              </div>
              <div className="align-center text-cooper-gray-350 flex flex-col pt-2 text-sm">
                <span
                  className={`${location && prettyLocationName(location) ? "visibility: visible" : "visibility: hidden"}`}
                >
                  {prettyLocationName(location)}
                </span>
                <span>
                  {reviewObj.workTerm.charAt(0).toUpperCase() +
                    reviewObj.workTerm.slice(1).toLowerCase()}{" "}
                  {reviewObj.workYear}
                </span>
              </div>
            </div>
          </CardContent>
        </div>
        <div className="w-full sm:w-[83%]">
          <CardContent className="flex h-full flex-col justify-between gap-4 pt-5 sm:pl-0 md:pl-4 md:pt-0">
            <div className="hidden flex-row justify-between md:flex">
              <div className="pt-1">{reviewObj.textReview}</div>
              {isAuthor && <DeleteReviewDialog reviewId={reviewObj.id} />}
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex gap-6 rounded-lg bg-[#f4f4f4] p-3 pr-4 md:gap-10 md:pl-4">
                <div className="flex flex-col gap-2 md:flex-row">
                  <span className="text-cooper-gray-350">Job type</span>{" "}
                  {reviewObj.jobType === "CO-OP" ? "Co-op" : reviewObj.jobType}
                </div>
                <div className="flex flex-col gap-2 md:flex-row">
                  <span className="text-cooper-gray-350">Work model</span>
                  {prettyWorkEnviornment(
                    reviewObj.workEnvironment as WorkEnvironmentType,
                  )}
                </div>
                <div className="flex flex-col gap-2 md:flex-row">
                  <span className="text-cooper-gray-350">Pay</span> $
                  {reviewObj.hourlyPay}/hr
                </div>
              </div>
            </div>
            <div className="visible flex flex-row justify-between md:hidden">
              <div className="pt-1">{reviewObj.textReview}</div>
              {isAuthor && <DeleteReviewDialog reviewId={reviewObj.id} />}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
