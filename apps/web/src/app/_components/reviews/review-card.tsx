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
        "mx-auto w-[100%] border-[0.75px] border-cooper-gray-150 bg-[#FEFEFE]",
        className,
      )}
    >
      <div className="flex w-full flex-wrap">
        <div className="w-full sm:w-[17%]">
          <CardContent className="flex h-full pr-0">
            <div className="flex md:flex-col flex-row justify-between w-full">
              <div className="flex flex-row gap-2 items-center">
                <div className="md:text-4xl text-2xl text-[#151515]">
                  {reviewObj.overallRating.toFixed(1)}
                </div>
                <Image
                  src="/svg/star.svg"
                  alt="Star icon"
                  width={28}
                  height={28}
                  className="w-5 h-5 md:w-7 md:h-7"
                />
              </div>
              <div className="align-center flex flex-col pt-2 text-cooper-gray-350 text-sm">
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
          <CardContent className="flex h-full flex-col justify-between gap-4 md:pl-4 sm:pl-0 md:pt-0 pt-5">
            <div className=" flex-row justify-between hidden md:flex">
              <div className="pt-1">{reviewObj.textReview}</div>
              {isAuthor && <DeleteReviewDialog reviewId={reviewObj.id} />}
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex md:gap-10 gap-6 bg-[#f4f4f4] p-3 md:pl-4 pr-4 rounded-lg">
                <div className="flex md:flex-row flex-col gap-2">
                  <span className="text-cooper-gray-350">Job type</span> {reviewObj.jobType}
                </div>
                <div className="flex md:flex-row flex-col gap-2">
                  <span className="text-cooper-gray-350">Work model</span>
                  {prettyWorkEnviornment(
                    reviewObj.workEnvironment as WorkEnvironmentType,
                  )}
                </div>
                <div className="flex md:flex-row flex-col gap-2">
                  <span className="text-cooper-gray-350">Pay</span> $
                  {reviewObj.hourlyPay}/hr
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-between visible md:hidden">
              <div className="pt-1">{reviewObj.textReview}</div>
              {isAuthor && <DeleteReviewDialog reviewId={reviewObj.id} />}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
