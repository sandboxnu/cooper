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
          <CardContent className="flex h-full flex-col justify-between pr-0">
            <div>
              <div className="flex flex-row gap-2">
                <div className="text-4xl text-[#151515]">
                  {reviewObj.overallRating.toFixed(1)}
                </div>
                <Image
                  src="/svg/star.svg"
                  alt="Star icon"
                  width={28}
                  height={28}
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
          <CardContent className="flex h-full flex-col justify-between gap-4 pl-4 sm:pl-0">
            <div className="flex flex-row justify-between">
              <div className="pt-1">{reviewObj.textReview}</div>
              {isAuthor && <DeleteReviewDialog reviewId={reviewObj.id} />}
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex gap-10 bg-cooper-gray-100 p-3 pl-4 pr-4 rounded-lg">
                <div className="flex flex-row gap-2">
                  <span className="text-cooper-gray-350">Job type</span> Co-op
                </div>
                <div className="flex flex-row gap-2">
                  <span className="text-cooper-gray-350">Work model</span>
                  {prettyWorkEnviornment(
                    reviewObj.workEnvironment as WorkEnvironmentType,
                  )}
                </div>
                <div className="flex flex-row gap-2">
                  <span className="text-cooper-gray-350">Pay</span> $
                  {reviewObj.hourlyPay} / hr
                </div>
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
